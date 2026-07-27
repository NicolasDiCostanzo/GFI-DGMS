import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            globals: true,
            environment: 'node',
            include: ['src/**/*.{test,spec}.{ts,js}'],
            exclude: ['src/**/*.playwright.spec.ts'],
            coverage: {
                provider: 'istanbul',
                reporter: ['text', 'lcov', 'html', 'json'],
                include: ['src/**/*.ts', 'src/**/*.vue'],
                exclude: ['src/**/*.{test,spec}.ts', 'src/vite-env.d.ts', 'src/main.ts'],
                thresholds: {
                    lines: 100,
                    functions: 100,
                    branches: 100,
                    statements: 100,
                },
            },
        },
    }),
);
