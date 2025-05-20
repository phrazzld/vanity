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
    } catch (_e) {
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
    if (nonSymlinks.length === 0) return [];

    const commands = [
      `prettier --write ${nonSymlinks.join(' ')}`,
      // First check for lint errors (will fail commit if errors found)
      `eslint --config eslint.config.cjs ${nonSymlinks.join(' ')}`,
      // Then fix what can be fixed
      `eslint --config eslint.config.cjs --fix ${nonSymlinks.join(' ')}`,
    ];

    // If any TypeScript files are staged, run a quick type check
    const hasTypeScriptFiles = nonSymlinks.some(
      file => file.endsWith('.ts') || file.endsWith('.tsx')
    );
    if (hasTypeScriptFiles) {
      commands.push('npm run typecheck');
    }

    return commands;
  },

  // Config files - format with Prettier
  '**/*.{cjs,mjs,yaml,yml}': files => {
    const nonSymlinks = filterSymlinks(files);
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },

  // All other supported files - just format
  '**/*.{css,json,md,html,svg}': files => {
    const nonSymlinks = filterSymlinks(files);
    return nonSymlinks.length > 0 ? [`prettier --write ${nonSymlinks.join(' ')}`] : [];
  },
};
/* eslint-enable no-undef */
