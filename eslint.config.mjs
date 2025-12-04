import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        ignores: ['node_modules/**', 'eslint.config.mjs'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
        },
        rules: {
            // Custom rules here as needed
        },
    },
];
