import { describe, expect, it } from 'vitest';

const modules = import.meta.glob(
    ['/src/**/*.{ts,vue}', '!/src/**/*.{test,spec}.ts', '!/src/main.ts', '!/src/vite-env.d.ts'],
    { eager: true },
);

describe('coverage completeness', () => {
    it('imports every production module so files untouched by other tests still appear in coverage reports', () => {
        expect(Object.keys(modules).length).toBeGreaterThan(0);
    });
});
