/**
 * Snapshot Resolver for Jest
 *
 * This module customizes how Jest creates and resolves snapshot paths.
 * It places snapshots in a __snapshots__ directory alongside the test files
 * to keep related files together.
 */
/* eslint-env node */
/* global module, require */

const path = require('path');

module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    const dirname = path.dirname(testPath);
    const filename = path.basename(testPath);
    return path.join(dirname, '__snapshots__', `${filename}${snapshotExtension}`);
  },

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    const dirname = path.dirname(snapshotFilePath);
    const snapshotFilename = path.basename(snapshotFilePath);

    // Extract parent directory (should be __snapshots__)
    const snapshotDir = path.basename(dirname);

    if (snapshotDir !== '__snapshots__') {
      throw new Error(
        `Expected snapshot to be in __snapshots__ directory, but found in ${snapshotDir}`
      );
    }

    const parentDir = path.dirname(dirname);

    // Remove snapshot extension from filename
    const testFileName = snapshotFilename.slice(0, -snapshotExtension.length);

    // The test file should be directly in the parent directory
    return path.join(parentDir, testFileName);
  },

  // Example test path, used for preflight consistency check
  testPathForConsistencyCheck: 'src/app/components/__tests__/SearchBar.snapshot.test.tsx',
};
