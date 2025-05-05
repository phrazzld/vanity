module.exports = {
  // JavaScript and TypeScript files - temporarily disable eslint
  '**/*.{js,jsx,ts,tsx}': ['prettier --write'],

  // All files - just format
  '**/*.{css,json,md}': ['prettier --write'],
};
