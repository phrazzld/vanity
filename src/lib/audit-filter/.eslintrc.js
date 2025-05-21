/* eslint-env node */
module.exports = {
  env: {
    jest: true,
    node: true,
    browser: false,
  },
  globals: {
    process: true,
    module: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
};