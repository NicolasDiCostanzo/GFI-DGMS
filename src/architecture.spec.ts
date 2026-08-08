import fs from 'node:fs';
import path from 'node:path';
import { cruise } from 'dependency-cruiser';
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options';
import type { ICruiseResult, IViolation } from 'dependency-cruiser';
import { describe, expect, it } from 'vitest';

const HEXAGONAL_RULE_NAMES = new Set([
    'domain-not-import-infrastructure',
    'domain-not-import-app',
    'domain-not-import-vue',
    'app-not-import-infrastructure',
]);

function formatViolations(violations: IViolation[]): string {
    if (violations.length === 0) return 'no violations';
    return violations.map((v) => `[${v.rule.name}] ${v.from} -> ${v.to}`).join('\n');
}

describe('hexagonal architecture boundaries (dependency-cruiser rules)', () => {
    it('has zero violations of the 4 hexagonal rules defined in .dependency-cruiser.js', async () => {
        const cruiseOptions = await extractDepcruiseOptions(
            path.join(process.cwd(), '.dependency-cruiser.js'),
        );

        // Guard against silent false-green if a rule is ever renamed/removed
        // from .dependency-cruiser.js without updating this test.
        const loadedRuleNames = new Set(
            (cruiseOptions.ruleSet?.forbidden ?? []).map((rule) => rule.name),
        );
        for (const name of HEXAGONAL_RULE_NAMES) {
            expect(
                loadedRuleNames.has(name),
                `expected rule "${name}" to be defined in .dependency-cruiser.js`,
            ).toBe(true);
        }

        const result = await cruise([path.join(process.cwd(), 'src')], cruiseOptions);
        const output = result.output as ICruiseResult;
        const hexagonalViolations = output.summary.violations.filter((v) =>
            HEXAGONAL_RULE_NAMES.has(v.rule.name),
        );

        expect(hexagonalViolations, formatViolations(hexagonalViolations)).toEqual([]);
    });
});

function listTsFiles(dir: string): string[] {
    let out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out = out.concat(listTsFiles(full));
        } else if (entry.name.endsWith('.ts') && !/\.(spec|test)\./.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

function toRepoRelative(absPath: string): string {
    return path.relative(process.cwd(), absPath).split(path.sep).join('/');
}

function boundedContexts(srcDir: string): string[] {
    return fs
        .readdirSync(srcDir, { withFileTypes: true })
        .filter(
            (entry) =>
                entry.isDirectory() && fs.existsSync(path.join(srcDir, entry.name, 'domain')),
        )
        .map((entry) => entry.name);
}

function extractExportedInterfaceNames(source: string): string[] {
    return [...source.matchAll(/export interface (\w+)/g)].map((match) => match[1]);
}

interface PortUsage {
    contextName: string;
    interfaceName: string;
    file: string;
}

/**
 * Identifies, per bounded context, which files implement a domain repository
 * port (repository implementations) vs. which files constructor-inject one
 * (use cases). There is no naming convention (no `*UseCase.ts`/`*Repository
 * Impl.ts` suffix) in this codebase, so placement can only be inferred from
 * this structural shape.
 *
 * Known limitations (proportionate to the codebase's current surface area):
 * no import-alias support (`import { X as Y }`), and only single-level
 * `implements`/constructor-parameter matching (no decorators, re-exports, or
 * interface merging).
 */
function findPortImplementationsAndUseCases(srcDir: string): {
    implementations: PortUsage[];
    useCases: PortUsage[];
} {
    const implementations: PortUsage[] = [];
    const useCases: PortUsage[] = [];

    for (const contextName of boundedContexts(srcDir)) {
        const repositoryDir = path.join(srcDir, contextName, 'domain', 'repository');
        if (!fs.existsSync(repositoryDir)) continue;

        const interfaceNames = listTsFiles(repositoryDir).flatMap((file) =>
            extractExportedInterfaceNames(fs.readFileSync(file, 'utf8')),
        );
        if (interfaceNames.length === 0) continue;

        for (const file of listTsFiles(path.join(srcDir, contextName))) {
            const content = fs.readFileSync(file, 'utf8');
            const constructorParams = content.match(/constructor\s*\(([^)]*)\)/)?.[1] ?? '';

            for (const interfaceName of interfaceNames) {
                const implementsPort = new RegExp(`implements[^{]*\\b${interfaceName}\\b`).test(
                    content,
                );
                const importsPort = new RegExp(
                    `import\\s*\\{[^}]*\\b${interfaceName}\\b[^}]*\\}\\s*from`,
                ).test(content);
                const consumesInConstructor = new RegExp(`:\\s*${interfaceName}\\b`).test(
                    constructorParams,
                );

                if (implementsPort) {
                    implementations.push({
                        contextName,
                        interfaceName,
                        file: toRepoRelative(file),
                    });
                }
                if (importsPort && !implementsPort && consumesInConstructor) {
                    useCases.push({ contextName, interfaceName, file: toRepoRelative(file) });
                }
            }
        }
    }

    return { implementations, useCases };
}

function formatUsages(usages: PortUsage[]): string {
    if (usages.length === 0) return 'none found';
    return usages
        .map((usage) => `[${usage.contextName}/${usage.interfaceName}] ${usage.file}`)
        .join('\n');
}

describe('hexagonal architecture boundaries (repository/use-case placement)', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const { implementations, useCases } = findPortImplementationsAndUseCases(srcDir);

    it('places every class implementing a domain repository port under <context>/infrastructure/', () => {
        expect(
            implementations.length,
            'expected to find at least one repository implementation to check',
        ).toBeGreaterThan(0);
        const misplaced = implementations.filter(
            (usage) => !new RegExp(`^src/${usage.contextName}/infrastructure/`).test(usage.file),
        );
        expect(misplaced, formatUsages(misplaced)).toEqual([]);
    });

    it('places every use case (class constructor-injecting a domain repository port) under <context>/app/', () => {
        expect(useCases.length, 'expected to find at least one use case to check').toBeGreaterThan(
            0,
        );
        const misplaced = useCases.filter(
            (usage) => !new RegExp(`^src/${usage.contextName}/app/`).test(usage.file),
        );
        expect(misplaced, formatUsages(misplaced)).toEqual([]);
    });
});
