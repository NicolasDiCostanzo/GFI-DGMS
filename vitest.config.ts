import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv) =>
    mergeConfig(
        typeof viteConfig === 'function' ? viteConfig(configEnv) : viteConfig,
        defineConfig({
            test: {
                globals: true,
                environment: 'happy-dom',
                include: ['src/**/*.{test,spec}.{ts,js}'],
                exclude: [...configDefaults.exclude, 'src/**/*.playwright.spec.ts'],
                setupFiles: ['./vitest.setup.ts'],
            },
        }),
    ),
);
