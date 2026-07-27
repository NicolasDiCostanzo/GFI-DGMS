import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import istanbul from 'vite-plugin-istanbul';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [
        vue({ customElement: true }),
        istanbul({
            include: 'src/**/*',
            exclude: ['node_modules', 'test'],
            extension: ['.vue', '.ts'],
            requireEnv: true,
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        // HMR wiring code is instrumented by vite-plugin-istanbul but can never execute
        // during an automated test run, which makes 100% coverage unreachable.
        hmr: process.env.VITE_COVERAGE !== 'true',
    },
    build: {
        sourcemap: true,
        lib: {
            entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
            name: 'GFIDGMS',
            formats: ['es', 'umd'],
            fileName: (format) => `gfi-dgms.${format}.js`,
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
});
