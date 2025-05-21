/**
 * Mock implementation for Node.js fs module
 * 
 * This module provides mock implementations of fs.readFileSync and fs.existsSync
 * for testing the audit-filter functionality without touching the actual filesystem.
 */

import { createDefaultMockFileSystem } from './mockHelpers';
import type { MockFileSystem } from './mockHelpers';

// Mock file system state
export const mockState = {
  // Map of file paths to their contents
  fileSystem: createDefaultMockFileSystem(),
  // Last file path that was read
  lastReadFilePath: '',
  // Last file path that was checked for existence
  lastExistsFilePath: '',
  // Whether readFileSync should throw an error
  shouldThrowOnRead: false,
  // Custom error message for readFileSync
  readErrorMessage: 'Mock file read error',
};

/**
 * Mock implementation of fs.readFileSync
 * 
 * This mock will:
 * - Record the file path in mockState.lastReadFilePath
 * - Return the content from the mock file system if it exists
 * - Throw an error if the file doesn't exist or shouldThrowOnRead is true
 * 
 * @param filePath - Path to the file to read
 * @param options - Encoding or options object
 * @returns The simulated file content
 */
export const readFileSync = jest.fn((filePath: string, _options?: string | { encoding?: string; flag?: string }): string => {
  mockState.lastReadFilePath = filePath;

  // Check if we're configured to throw an error
  if (mockState.shouldThrowOnRead) {
    throw new Error(mockState.readErrorMessage);
  }

  // Check if the file exists in our mock file system
  if (filePath in mockState.fileSystem.files) {
    return mockState.fileSystem.files[filePath];
  }

  // File not found - throw ENOENT error similar to the real fs module
  const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`) as NodeJS.ErrnoException;
  error.code = 'ENOENT';
  error.errno = -2;
  error.syscall = 'open';
  error.path = filePath;
  throw error;
});

/**
 * Mock implementation of fs.existsSync
 * 
 * This mock will:
 * - Record the file path in mockState.lastExistsFilePath
 * - Return true if the file exists in the mock file system
 * - Return false otherwise
 * 
 * @param filePath - Path to the file to check
 * @returns Whether the file exists in the mock file system
 */
export const existsSync = jest.fn((filePath: string): boolean => {
  mockState.lastExistsFilePath = filePath;
  return filePath in mockState.fileSystem.files;
});

/**
 * Configure the mock file system
 * 
 * @param fileSystem - The new mock file system state
 */
export function setMockFileSystem(fileSystem: MockFileSystem): void {
  mockState.fileSystem = fileSystem;
}

/**
 * Add a file to the mock file system
 * 
 * @param filePath - Path to the file
 * @param content - Content of the file
 */
export function addMockFile(filePath: string, content: string): void {
  mockState.fileSystem.files[filePath] = content;
}

/**
 * Remove a file from the mock file system
 * 
 * @param filePath - Path to the file to remove
 */
export function removeMockFile(filePath: string): void {
  delete mockState.fileSystem.files[filePath];
}

/**
 * Configure the mock to throw an error when reading a file
 * 
 * @param errorMessage - The error message to use
 */
export function mockReadFileFailure(errorMessage = 'Mock file read error'): void {
  mockState.shouldThrowOnRead = true;
  mockState.readErrorMessage = errorMessage;
}

/**
 * Configure the mock to succeed (not throw errors) when reading a file
 */
export function mockReadFileSuccess(): void {
  mockState.shouldThrowOnRead = false;
}

/**
 * Reset the mock state to default values
 */
export function resetMock(): void {
  mockState.fileSystem = createDefaultMockFileSystem();
  mockState.lastReadFilePath = '';
  mockState.lastExistsFilePath = '';
  mockState.shouldThrowOnRead = false;
  mockState.readErrorMessage = 'Mock file read error';
  jest.clearAllMocks();
}

// No need to call jest.mock here - we'll use manual mocking with the __mocks__ directory

// Explicitly add typed exports for better IDE support
export default {
  readFileSync,
  existsSync,
  setMockFileSystem,
  addMockFile,
  removeMockFile,
  mockReadFileFailure,
  mockReadFileSuccess,
  resetMock,
  mockState,
};