import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            globals: true,
            environment: 'node',
            include: ['src/**/*.{test,spec}.{ts,js}'],
            coverage: {
                provider: 'istanbul',
                reporter: ['text', 'lcov', 'html'],
                include: ['src/**/*.ts', 'src/**/*.vue'],
                exclude: ['src/**/*.{test,spec}.ts', 'src/vite-env.d.ts'],
            },
        },
    }),
);