module.exports = {
  // JavaScript and TypeScript files - temporarily disable eslint
  '**/*.{js,jsx,ts,tsx}': files => {
    // Filter out any symlinks
    const nonSymlinks = files.filter(file => !file.includes('docs/DEVELOPMENT_PHILOSOPHY'));
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },

  // All files - just format, exclude symlinks
  '**/*.{css,json,md}': files => {
    // Filter out any symlinks
    const nonSymlinks = files.filter(file => !file.includes('docs/DEVELOPMENT_PHILOSOPHY'));
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },
};
