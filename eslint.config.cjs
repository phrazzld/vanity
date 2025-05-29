// eslint.config.cjs
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const nextPlugin = require('@next/eslint-plugin-next');
const tseslint = require('typescript-eslint');
const storybook = require('eslint-plugin-storybook');
const jsxA11y = require('eslint-plugin-jsx-a11y');

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
  clearTimeout: 'readonly',
  clearInterval: 'readonly',
  setInterval: 'readonly',
  NodeJS: 'readonly',
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
  test: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
};

// Define the flat configuration without relying on @rushstack/eslint-patch
module.exports = [
  // Ignore built and generated files
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'build/**',
      'dist/**',
      'storybook-static/**',
      'coverage/**',
      '*.log',
    ],
  },

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
      'jest.setup.js',
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
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Relaxed rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|props|initialProps',
          varsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|props|initialProps',
          varsIgnorePattern: '^_',
        },
      ],
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      // Allow non-null assertions in tests
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // TypeScript parser configuration for all TS files (excluding test files)
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', '**/test-utils/**/*.{ts,tsx}'],
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
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
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
          max: 1000,
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
      // Allow underscore prefixed parameters to be unused
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
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
      '**/.prettierrc.js',
      '**/scripts/**/*.js',
      '**/src/lib/logger.ts',
      '**/src/lib/prisma.ts',
      '**/src/middleware/logging.ts',
      '**/src/app/api/auth/**/*.ts',
      '**/src/auth.ts',
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

  // Accessibility rules for React components
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Essential accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'warn',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'warn',
    },
  },

  // Prettier compatibility (must come last to override style rules)
  prettier,
];
