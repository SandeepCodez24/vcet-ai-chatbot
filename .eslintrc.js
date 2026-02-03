/**
 * ESLint Configuration
 * VCET AI Chatbot
 * 
 * This configuration provides linting rules for the project.
 * 
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    // Environment settings
    env: {
        browser: true,
        es2021: true,
        node: true
    },

    // Extend recommended configurations
    extends: [
        'eslint:recommended'
    ],

    // Parser options
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },

    // Global variables (browser APIs and custom globals)
    globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',

        // Custom globals from our modules
        ApiService: 'readonly',
        apiService: 'readonly',
        StorageService: 'readonly',
        storageService: 'readonly',
        GestureManager: 'readonly',
        SidebarSwipeController: 'readonly',
        PullToRefreshController: 'readonly',
        MessageContextMenu: 'readonly',

        // Utility functions
        $: 'readonly',
        $$: 'readonly',
        escapeHTML: 'readonly',
        copyToClipboard: 'readonly',
        debounce: 'readonly',
        throttle: 'readonly',
        sleep: 'readonly',
        isMobile: 'readonly',
        isTouchDevice: 'readonly'
    },

    // Custom rules
    rules: {
        // Possible Errors
        'no-console': 'off', // Allow console for debugging
        'no-debugger': 'warn',
        'no-duplicate-case': 'error',
        'no-empty': 'warn',
        'no-extra-semi': 'error',
        'no-irregular-whitespace': 'error',

        // Best Practices
        'curly': ['error', 'multi-line'],
        'default-case': 'warn',
        'dot-notation': 'error',
        'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
        'no-else-return': 'warn',
        'no-empty-function': 'warn',
        'no-eval': 'error',
        'no-floating-decimal': 'error',
        'no-implied-eval': 'error',
        'no-multi-spaces': 'error',
        'no-return-assign': 'error',
        'no-unused-expressions': 'warn',
        'yoda': 'error',

        // Variables
        'no-shadow': 'warn',
        'no-unused-vars': ['warn', {
            'argsIgnorePattern': '^_',
            'varsIgnorePattern': '^_'
        }],
        'no-use-before-define': ['error', {
            'functions': false,
            'classes': true
        }],

        // Stylistic Issues
        'array-bracket-spacing': ['error', 'never'],
        'block-spacing': 'error',
        'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
        'camelcase': ['warn', { 'properties': 'never' }],
        'comma-dangle': ['error', 'never'],
        'comma-spacing': ['error', { 'before': false, 'after': true }],
        'comma-style': ['error', 'last'],
        'computed-property-spacing': ['error', 'never'],
        'eol-last': ['error', 'always'],
        'func-call-spacing': ['error', 'never'],
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
        'keyword-spacing': ['error', { 'before': true, 'after': true }],
        'linebreak-style': 'off', // Allow both LF and CRLF
        'max-len': ['warn', {
            'code': 120,
            'ignoreComments': true,
            'ignoreStrings': true,
            'ignoreTemplateLiterals': true,
            'ignoreUrls': true
        }],
        'new-cap': ['error', { 'newIsCap': true, 'capIsNew': false }],
        'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
        'no-trailing-spaces': 'error',
        'object-curly-spacing': ['error', 'always'],
        'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
        'semi': ['error', 'always'],
        'semi-spacing': ['error', { 'before': false, 'after': true }],
        'space-before-blocks': 'error',
        'space-before-function-paren': ['error', {
            'anonymous': 'never',
            'named': 'never',
            'asyncArrow': 'always'
        }],
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': 'error',
        'spaced-comment': ['error', 'always', { 'exceptions': ['-', '+', '*'] }],

        // ES6
        'arrow-parens': ['error', 'as-needed'],
        'arrow-spacing': ['error', { 'before': true, 'after': true }],
        'no-duplicate-imports': 'error',
        'no-var': 'error',
        'prefer-const': 'warn',
        'prefer-template': 'warn',
        'template-curly-spacing': ['error', 'never']
    },

    // Override rules for specific files
    overrides: [
        {
            // Test files
            files: ['**/*.test.js', '**/*.spec.js'],
            env: {
                jest: true,
                mocha: true
            },
            rules: {
                'no-unused-expressions': 'off'
            }
        },
        {
            // Build scripts
            files: ['scripts/**/*.js'],
            rules: {
                'no-console': 'off'
            }
        }
    ],

    // Ignore patterns
    ignorePatterns: [
        'node_modules/',
        'public/',
        'dist/',
        '*.min.js',
        'vendor/'
    ]
};
