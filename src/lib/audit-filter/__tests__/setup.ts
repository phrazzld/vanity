/**
 * Jest setup file for audit-filter tests
 *
 * This file is automatically loaded by Jest before running tests
 * and ensures the mocks are properly initialized.
 *
 * @jest-environment node
 */

/* global process */

// This file is not a test file - it's a setup file

// Import setup functions
import { resetMocks } from '../__mocks__/setupMocks';

// Reset all mocks before each test
beforeEach(() => {
  resetMocks();
});

// Mock process.cwd to return a consistent path for tests
jest.spyOn(process, 'cwd').mockReturnValue('/path/to');

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit;
jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
  console.log(`[Mock] process.exit called with code: ${code}`);
  return undefined as never;
});

// Restore process.exit after all tests
afterAll(() => {
  process.exit = originalExit;
});
