// eslint.config.cjs
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const nextPlugin = require('@next/eslint-plugin-next');
const tseslint = require('typescript-eslint');
const storybook = require('eslint-plugin-storybook');

// Create a TypeScript parser configuration
const typescriptParser = tseslint.parser;

// Define globals for browser and Node.js environments
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  React: 'readonly',
  setTimeout: 'readonly',
};

const nodeGlobals = {
  process: 'readonly',
  global: 'readonly',
  console: 'readonly',
  module: 'writable',
  require: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  crypto: 'readonly',
  Buffer: 'readonly',
};

const testGlobals = {
  jest: 'readonly',
  describe: 'readonly',
  it: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
};

// Define the flat configuration without relying on @rushstack/eslint-patch
module.exports = [
  // Base JavaScript rules
  js.configs.recommended,

  // Storybook config (must come early to set up Storybook files properly)
  ...storybook.configs['flat/recommended'],

  // Test files configuration (place before the general TypeScript configuration)
  {
    files: [
      '*.test.{js,jsx,ts,tsx}',
      'src/**/*.test.{js,jsx,ts,tsx}',
      'src/test-utils/*.{js,jsx,ts,tsx}',
      'src/**/__tests__/*.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      'tests/**/*.{js,jsx,ts,tsx}',
      'jest.setup.js'
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        // Don't specify project for now, as it's causing issues
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...testGlobals,
        ...browserGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Relaxed rules for test files
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_|props|initialProps',
        'varsIgnorePattern': '^_' 
      }],
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_|props|initialProps', 
        'varsIgnorePattern': '^_' 
      }],
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      // Allow non-null assertions in tests
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

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
      globals: {
        ...browserGlobals,
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
    languageOptions: {
      globals: {
        ...browserGlobals,
      },
    },
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
    languageOptions: {
      globals: {
        ...browserGlobals,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },

  // Node.js files
  {
    files: [
      '**/jest.config.js',
      '**/next.config.ts',
      '**/postcss.config.mjs',
      '**/tailwind.config.ts',
      '**/eslint.config.cjs',
      '**/commitlint.config.js',
      '**/scripts/**/*.js',
      '**/src/lib/logger.ts',
      '**/src/lib/prisma.ts',
      '**/src/middleware/logging.ts',
    ],
    languageOptions: {
      globals: {
        ...nodeGlobals,
      },
    },
  },


  // Storybook files
  {
    files: ['**/*.stories.{js,jsx,ts,tsx}', '**/.storybook/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Add any additional rules for Storybook files
      'storybook/hierarchy-separator': 'error',
      'storybook/default-exports': 'error',
      'storybook/no-uninstalled-addons': 'error',
    },
  },

  // Prettier compatibility (must come last to override style rules)
  prettier,
];