import { afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Minimal DOM stubs for Node environment (used by custom element specs)
if (typeof globalThis.HTMLElement === 'undefined') {
    globalThis.HTMLElement = class HTMLElement {} as unknown as typeof HTMLElement;
}

if (typeof globalThis.customElements === 'undefined') {
    const registry = new Map<string, unknown>();
    // eslint-disable-next-line no-unused-vars
    const pendingWhenDefined = new Map<string, Array<(constructor: unknown) => void>>();
    globalThis.customElements = {
        get: (name: string) => registry.get(name),
        define: (name: string, constructor: unknown) => {
            registry.set(name, constructor);
            const waiters = pendingWhenDefined.get(name);
            if (waiters) {
                for (const resolve of waiters) {
                    resolve(constructor);
                }
                pendingWhenDefined.delete(name);
            }
        },
        whenDefined: (name: string) => {
            const existing = registry.get(name);
            if (existing !== undefined) {
                return Promise.resolve(existing);
            }
            return new Promise((resolve) => {
                const waiters = pendingWhenDefined.get(name) ?? [];
                waiters.push(resolve);
                pendingWhenDefined.set(name, waiters);
            });
        },
    } as unknown as CustomElementRegistry;
}

afterAll(() => {
    const coverage = (globalThis as { __coverage__?: object }).__coverage__;
    if (!coverage) return;

    const dir = join(process.cwd(), '.nyc_output');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `vitest-${randomUUID()}.json`), JSON.stringify(coverage));
});
