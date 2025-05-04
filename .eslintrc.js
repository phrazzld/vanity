module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    // React functional components can be longer
    'max-lines-per-function': [
      'warn',
      {
        max: 300, // Increased to allow for React component complexity
        skipBlankLines: true,
        skipComments: true,
      },
    ],
  },
  overrides: [
    {
      // Standard file length - warn at 500 lines for all files
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
    {
      // Error at 1000 lines for all files without exceptions
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
  ],
};
