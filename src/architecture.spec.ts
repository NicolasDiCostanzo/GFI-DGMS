import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cruise } from 'dependency-cruiser';
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options';
import type { ICruiseResult, IViolation } from 'dependency-cruiser';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const HEXAGONAL_RULE_NAMES = new Set([
    'domain-not-import-infrastructure',
    'domain-not-import-app',
    'domain-not-import-vue',
    'app-not-import-infrastructure',
    'app-not-import-vue',
    'shared-not-import-context',
    'adapters-only-imported-by-composition-root',
]);

function formatViolations(violations: IViolation[]): string {
    if (violations.length === 0) return 'no violations';
    return violations.map((v) => `[${v.rule.name}] ${v.from} -> ${v.to}`).join('\n');
}

describe('hexagonal architecture boundaries (dependency-cruiser rules)', () => {
    it('has zero violations of the architecture-boundary rules defined in .dependency-cruiser.js', async () => {
        const cruiseOptions = await extractDepcruiseOptions(
            path.join(process.cwd(), '.dependency-cruiser.js'),
        );

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

function parseSourceFile(filePath: string): ts.SourceFile {
    return ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
    );
}

function isExported(node: ts.InterfaceDeclaration): boolean {
    if (!ts.canHaveModifiers(node)) return false;
    return (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

/**
 * Names re-exported via a local `export { X }` (or `export { X as Y }`) declaration,
 * keyed by the identifier's local name (the name usable within this file), not its
 * exported alias.
 */
function collectLocallyReExportedNames(sourceFile: ts.SourceFile): Set<string> {
    const names = new Set<string>();
    ts.forEachChild(sourceFile, (node) => {
        if (
            ts.isExportDeclaration(node) &&
            !node.moduleSpecifier &&
            node.exportClause &&
            ts.isNamedExports(node.exportClause)
        ) {
            for (const element of node.exportClause.elements) {
                names.add((element.propertyName ?? element.name).text);
            }
        }
    });
    return names;
}

function extractExportedInterfaceNames(sourceFile: ts.SourceFile): string[] {
    const locallyReExportedNames = collectLocallyReExportedNames(sourceFile);
    const names: string[] = [];
    ts.forEachChild(sourceFile, (node) => {
        if (
            ts.isInterfaceDeclaration(node) &&
            (isExported(node) || locallyReExportedNames.has(node.name.text))
        ) {
            names.push(node.name.text);
        }
    });
    return names;
}

function findClassDeclarations(sourceFile: ts.SourceFile): ts.ClassDeclaration[] {
    const classes: ts.ClassDeclaration[] = [];
    ts.forEachChild(sourceFile, (node) => {
        if (ts.isClassDeclaration(node)) classes.push(node);
    });
    return classes;
}

function classImplementsInterface(classNode: ts.ClassDeclaration, interfaceName: string): boolean {
    return (
        classNode.heritageClauses?.some(
            (clause) =>
                clause.token === ts.SyntaxKind.ImplementsKeyword &&
                clause.types.some(
                    (type) =>
                        ts.isIdentifier(type.expression) && type.expression.text === interfaceName,
                ),
        ) ?? false
    );
}

function classConsumesInConstructor(
    classNode: ts.ClassDeclaration,
    interfaceName: string,
): boolean {
    const constructorDeclaration = classNode.members.find(ts.isConstructorDeclaration);
    if (!constructorDeclaration) return false;
    return constructorDeclaration.parameters.some(
        (param) =>
            !!param.type &&
            ts.isTypeReferenceNode(param.type) &&
            ts.isIdentifier(param.type.typeName) &&
            param.type.typeName.text === interfaceName,
    );
}

function sourceFileImportLocalName(
    sourceFile: ts.SourceFile,
    importedName: string,
): string | undefined {
    let localName: string | undefined;
    ts.forEachChild(sourceFile, (node) => {
        if (
            ts.isImportDeclaration(node) &&
            node.importClause?.namedBindings &&
            ts.isNamedImports(node.importClause.namedBindings)
        ) {
            const element = node.importClause.namedBindings.elements.find(
                (candidate) => (candidate.propertyName ?? candidate.name).text === importedName,
            );
            localName ||= element?.name.text;
        }
    });
    return localName;
}

interface PortUsage {
    contextName: string;
    interfaceName: string;
    file: string;
}

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
            extractExportedInterfaceNames(parseSourceFile(file)),
        );
        if (interfaceNames.length === 0) continue;

        for (const file of listTsFiles(path.join(srcDir, contextName))) {
            const sourceFile = parseSourceFile(file);
            const classes = findClassDeclarations(sourceFile);

            for (const interfaceName of interfaceNames) {
                const implementingClass = classes.find((classNode) =>
                    classImplementsInterface(classNode, interfaceName),
                );
                if (implementingClass) {
                    implementations.push({
                        contextName,
                        interfaceName,
                        file: toRepoRelative(file),
                    });
                    continue;
                }

                const portLocalName = sourceFileImportLocalName(sourceFile, interfaceName);
                const consumesInConstructor =
                    portLocalName !== undefined &&
                    classes.some((classNode) =>
                        classConsumesInConstructor(classNode, portLocalName),
                    );
                if (portLocalName !== undefined && consumesInConstructor) {
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

describe('findPortImplementationsAndUseCases (interface export syntax regression)', () => {
    it('detects a port interface exported via a separate `export { X }` declaration', () => {
        const tmpSrcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-spec-'));
        try {
            const repositoryDir = path.join(tmpSrcDir, 'payments', 'domain', 'repository');
            const appDir = path.join(tmpSrcDir, 'payments', 'app');
            const infrastructureDir = path.join(
                tmpSrcDir,
                'payments',
                'infrastructure',
                'adapters',
            );
            fs.mkdirSync(repositoryDir, { recursive: true });
            fs.mkdirSync(appDir, { recursive: true });
            fs.mkdirSync(infrastructureDir, { recursive: true });

            fs.writeFileSync(
                path.join(repositoryDir, 'PaymentPort.ts'),
                [
                    'interface PaymentPort {',
                    '    charge(amountUsd: number): Promise<void>;',
                    '}',
                    '',
                    'export { PaymentPort };',
                    '',
                ].join('\n'),
            );
            fs.writeFileSync(
                path.join(infrastructureDir, 'StripePaymentAdapter.ts'),
                [
                    "import { PaymentPort } from '../../domain/repository/PaymentPort';",
                    '',
                    'export class StripePaymentAdapter implements PaymentPort {',
                    '    async charge(amountUsd: number): Promise<void> {}',
                    '}',
                    '',
                ].join('\n'),
            );
            fs.writeFileSync(
                path.join(appDir, 'ChargeCustomer.ts'),
                [
                    "import { PaymentPort } from '../domain/repository/PaymentPort';",
                    '',
                    'export class ChargeCustomer {',
                    '    constructor(private readonly paymentPort: PaymentPort) {}',
                    '}',
                    '',
                ].join('\n'),
            );

            const { implementations, useCases } = findPortImplementationsAndUseCases(tmpSrcDir);

            expect(implementations).toEqual([
                {
                    contextName: 'payments',
                    interfaceName: 'PaymentPort',
                    file: toRepoRelative(path.join(infrastructureDir, 'StripePaymentAdapter.ts')),
                },
            ]);
            expect(useCases).toEqual([
                {
                    contextName: 'payments',
                    interfaceName: 'PaymentPort',
                    file: toRepoRelative(path.join(appDir, 'ChargeCustomer.ts')),
                },
            ]);
        } finally {
            fs.rmSync(tmpSrcDir, { recursive: true, force: true });
        }
    });

    it('detects a use case importing a port under a local alias and injecting it via constructor', () => {
        const tmpSrcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-spec-'));
        try {
            const repositoryDir = path.join(tmpSrcDir, 'orders', 'domain', 'repository');
            const appDir = path.join(tmpSrcDir, 'orders', 'app');
            fs.mkdirSync(repositoryDir, { recursive: true });
            fs.mkdirSync(appDir, { recursive: true });

            fs.writeFileSync(
                path.join(repositoryDir, 'OrderRepository.ts'),
                [
                    'export interface OrderRepository {',
                    '    save(order: unknown): Promise<void>;',
                    '}',
                    '',
                ].join('\n'),
            );
            fs.writeFileSync(
                path.join(appDir, 'PlaceOrder.ts'),
                [
                    "import { OrderRepository as Repository } from '../domain/repository/OrderRepository';",
                    '',
                    'export class PlaceOrder {',
                    '    constructor(private readonly repository: Repository) {}',
                    '}',
                    '',
                ].join('\n'),
            );

            const { useCases } = findPortImplementationsAndUseCases(tmpSrcDir);

            expect(useCases).toEqual([
                {
                    contextName: 'orders',
                    interfaceName: 'OrderRepository',
                    file: toRepoRelative(path.join(appDir, 'PlaceOrder.ts')),
                },
            ]);
        } finally {
            fs.rmSync(tmpSrcDir, { recursive: true, force: true });
        }
    });
});
