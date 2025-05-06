/* eslint-disable no-undef */
const fs = require('fs');

/**
 * Helper function to filter out symlinks
 * @param {string[]} files - List of files to check
 * @returns {string[]} List of files excluding symlinks
 */
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
/* eslint-enable no-undef */

/* eslint-disable no-undef */
module.exports = {
  // JavaScript and TypeScript files - run ESLint with flat config and Prettier
  '**/*.{js,jsx,ts,tsx}': files => {
    const nonSymlinks = filterSymlinks(files);
    return nonSymlinks.length > 0
      ? [
          `prettier --write ${nonSymlinks.join(' ')}`,
          `eslint --config eslint.config.cjs --fix ${nonSymlinks.join(' ')}`,
        ]
      : [];
  },

  // All files - just format, exclude symlinks
  '**/*.{css,json,md}': files => {
    const nonSymlinks = filterSymlinks(files);
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },
};
/* eslint-enable no-undef */
