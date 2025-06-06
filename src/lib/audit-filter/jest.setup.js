/**
 * Jest setup for audit-filter integration tests
 *
 * This file is used to properly set up manual mocks for external dependencies
 *
 * @jest-environment node
 */

/* eslint-env node, jest */
/* global process, jest, require, afterAll */

// This file is not a test file - it's a setup file

// Mock the fs module
jest.mock('fs', () => {
  // Import our custom mock implementation
  const fsMock = require('./__mocks__/fs');
  return {
    readFileSync: fsMock.readFileSync,
    existsSync: fsMock.existsSync,
  };
});

// Mock the child_process module
jest.mock('child_process', () => {
  // Import our custom mock implementation
  const cpMock = require('./__mocks__/child_process');
  return {
    execSync: cpMock.execSync,
  };
});

// Mock process.cwd to return a consistent path for tests
jest.spyOn(process, 'cwd').mockReturnValue('/path/to');

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit;
jest.spyOn(process, 'exit').mockImplementation(code => {
  console.log(`[Mock] process.exit called with code: ${code}`);
  return undefined;
});

// Restore process.exit after all tests
afterAll(() => {
  process.exit = originalExit;
});
