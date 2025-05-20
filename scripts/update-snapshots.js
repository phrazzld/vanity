#!/usr/bin/env node

/**
 * Snapshot Update Script
 *
 * This script provides a simplified interface for updating Jest snapshots.
 * It can update all snapshots or specific component snapshots based on command line arguments.
 *
 * Usage:
 *   npm run update-snapshots              # Updates all snapshots
 *   npm run update-snapshots SearchBar    # Updates only SearchBar snapshots
 *   npm run update-snapshots -- --help    # Shows help
 */

/* eslint-env node */

const { spawnSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Snapshot Update Script

Updates Jest snapshots with proper configuration.

Usage:
  npm run update-snapshots              # Updates all snapshots
  npm run update-snapshots SearchBar    # Updates only SearchBar snapshots
  npm run update-snapshots -- --help    # Shows this help message

Options:
  --help, -h     Show this help message
  --ci           Run in CI mode (stricter)
  --verbose      Show more detailed output
  `);
  process.exit(0);
}

// Extract options and components
const options = args.filter(arg => arg.startsWith('--'));
const components = args.filter(arg => !arg.startsWith('--'));

// Set environment variables
process.env.UPDATE_SNAPSHOTS = 'true';

// Build the Jest command
let testCommand = ['test', '--testMatch=**/*.snapshot.test.{ts,tsx}', '--', '-u'];

// Add component pattern if specified
if (components.length > 0) {
  const pattern = components.map(c => `${c}\\.snapshot\\.test`).join('|');
  testCommand.push('-t', pattern);
}

// Add additional options
if (options.includes('--ci')) {
  testCommand.push('--ci');
}

if (options.includes('--verbose')) {
  testCommand.push('--verbose');
}

console.log(`Updating snapshots${components.length ? ` for: ${components.join(', ')}` : ''}`);

// Run the command
const result = spawnSync('npm', testCommand, {
  stdio: 'inherit',
  env: { ...process.env },
});

if (result.status !== 0) {
  console.error('Failed to update snapshots');
  process.exit(result.status);
}

console.log('\nSnapshots updated successfully!');
