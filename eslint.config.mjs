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
            // Error Prevention
            'no-console': 'warn', // Warn on console.log (use proper logging)
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_', // Allow unused vars starting with _
                    varsIgnorePattern: '^_',
                },
            ],
            'no-undef': 'error', // Prevent undefined variables
            'no-unreachable': 'error', // Catch unreachable code

            // Best Practices
            eqeqeq: ['error', 'always'], // Require === instead of ==
            //curly: ['error', 'all'], // Require curly braces for all control statements
            'no-var': 'error', // Use let/const instead of var
            'prefer-const': 'error', // Prefer const when variables aren't reassigned
            'no-eval': 'error', // Disallow eval()
            'no-implied-eval': 'error', // Disallow setTimeout/setInterval strings

            // Code Quality
            complexity: ['warn', 10], // Warn on overly complex functions
            'max-depth': ['warn', 4], // Warn on deeply nested blocks
            'max-lines-per-function': [
                'warn',
                {
                    max: 150,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            // Node.js Specific
            'no-process-exit': 'error', // Prefer proper error handling over process.exit()
        },
    },
];
