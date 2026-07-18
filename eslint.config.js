import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import vuePlugin from 'eslint-plugin-vue';

export default [
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'coverage/**',
            '.dependency-cruiser.js',
            'vite.config.ts',
            'vitest.config.ts',
            'playwright.config.ts',
            'eslint.config.js',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs['flat/recommended'].map((config) => ({
        ...config,
        files: ['src/**/*.ts'],
    })),
    ...vuePlugin.configs['flat/recommended'].map((config) => ({
        ...config,
        files: ['src/**/*.vue'],
    })),
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
        },
    },
    {
        files: ['src/**/*.vue'],
        rules: {
            'vue/multi-word-component-names': 'off',
            'vue/html-indent': ['warn', 4],
        },
    },
];