/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, webextensions: true, node: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  ignorePatterns: ['dist', 'node_modules', 'playwright-report', 'test-results', '*.ts', '*.tsx'],
  rules: {
    'no-unused-vars': 'off',
  },
};
