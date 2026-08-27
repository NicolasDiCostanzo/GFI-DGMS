import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        vue({ customElement: true }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
            entry: fileURLToPath(
                new URL('./src/sovereign/infrastructure/ui/entry/gfi-widget.ce.ts', import.meta.url)
            ),
            name: 'GFIWidget',
            formats: ['es', 'umd'],
            fileName: (format) => (format === 'es' ? 'gfi-widget.js' : 'gfi-widget.umd.js'),
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
        },
    },
});