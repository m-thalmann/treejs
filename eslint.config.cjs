const globals = require('globals');

const baseConfig = require('@m-thalmann/eslint-config-base');

const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['dist/', 'tree.js'], // TODO: remove tree.js after migrating to builds
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  ...baseConfig,
  prettierConfig,
];
