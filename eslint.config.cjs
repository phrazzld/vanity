// eslint.config.cjs
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const nextPlugin = require('@next/eslint-plugin-next');
const tseslint = require('typescript-eslint');

// Create a TypeScript parser configuration
const typescriptParser = tseslint.parser;

// Define the flat configuration without relying on @rushstack/eslint-patch
module.exports = [
  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript parser configuration for all TS files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Strict TypeScript type rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // Next.js specific rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Add Next.js specific rules from the plugin
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
      '@next/next/no-unwanted-polyfillio': 'warn',
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

  // JavaScript-specific rules
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': 'warn',
    },
  },

  // Prettier compatibility (must come last to override style rules)
  prettier,
];