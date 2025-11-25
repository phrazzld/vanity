/* eslint-disable no-undef -- Node.js config file uses CommonJS globals (require, module) which are not defined in browser environment but are standard in Node.js */
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
    } catch {
      // If we can't determine, assume it's not a symlink
      return true;
    }
  });
}
/* eslint-enable no-undef */

/* eslint-disable no-undef -- CommonJS module.exports is standard in Node.js config files but not recognized by ESLint's browser environment settings */
module.exports = {
  // JavaScript and TypeScript files - run ESLint with flat config and Prettier
  '**/*.{js,jsx,ts,tsx}': files => {
    const nonSymlinks = filterSymlinks(files);
    if (nonSymlinks.length === 0) return [];

    const commands = [
      `prettier --write ${nonSymlinks.join(' ')}`,
      // ESLint with --fix will auto-fix and still error on unfixable issues
      `eslint --config eslint.config.cjs --fix ${nonSymlinks.join(' ')}`,
    ];

    // Note: TypeScript checking removed from pre-commit for performance
    // TypeScript is now checked in pre-push hook for faster commits

    return commands;
  },

  // Config files - format with Prettier
  '**/*.{cjs,mjs,yaml,yml}': files => {
    const nonSymlinks = filterSymlinks(files);
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },

  // All other supported files - just format (excluding svg which lacks parser)
  '**/*.{css,json,md,html}': files => {
    const nonSymlinks = filterSymlinks(files);
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },
};
/* eslint-enable no-undef */
