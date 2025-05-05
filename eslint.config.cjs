// eslint.config.cjs
const js = require('@eslint/js');
const nextjs = require('eslint-config-next');
const prettier = require('eslint-config-prettier');

module.exports = [
  // Base JavaScript rules
  js.configs.recommended,

  // Next.js rules
  ...nextjs,

  // Prettier compatibility (must come after style rules)
  prettier,

  // Core TypeScript rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
    },
    rules: {
      // Strict TypeScript type rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // File length rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // React functional components can be longer
      'max-lines-per-function': [
        'warn',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      // Warning at 500 lines
      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },

  // Error at 1000 lines
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'max-lines': [
        'error',
        {
          max: 1000,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },

  // Enforce unused variables checking (temporarily disabled in tsconfig)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-unused-vars': 'warn',
    },
  },
];