const globals = require('globals');

const baseConfig = require('@m-thalmann/eslint-config-base');

const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['dist/'],
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  ...baseConfig,
  prettierConfig,

  {
    rules: {
      'no-console': 'off',
    },
  },

  {
    files: ['src/tree.js'],
    rules: {
      'max-lines': 'off',
      camelcase: 'off',
    },
  },
];
