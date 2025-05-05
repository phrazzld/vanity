// eslint.config.js
import nextPlugin from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

export default [
  // Start with Next.js recommended settings
  ...nextPlugin,

  // Apply Prettier settings to avoid conflicts
  prettier,

  // Custom rules for all files
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
    },
  },

  // Warning at 500 lines
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
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
];
