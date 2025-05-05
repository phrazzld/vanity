const fs = require('fs');

// Helper function to filter out symlinks
function filterSymlinks(files) {
  return files.filter(file => {
    try {
      const stats = fs.lstatSync(file);
      return !stats.isSymbolicLink();
    } catch (e) {
      // If we can't determine, assume it's not a symlink
      return true;
    }
  });
}

module.exports = {
  // JavaScript and TypeScript files - temporarily disable eslint
  '**/*.{js,jsx,ts,tsx}': files => {
    const nonSymlinks = filterSymlinks(files);
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },

  // All files - just format, exclude symlinks
  '**/*.{css,json,md}': files => {
    const nonSymlinks = filterSymlinks(files);
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },
};
