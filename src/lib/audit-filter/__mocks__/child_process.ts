/**
 * Mock implementation for Node.js child_process module
 *
 * This module provides a mock implementation of the child_process.execSync function
 * for testing the audit-filter functionality without actually spawning processes.
 */

/* global jest */

import { createExecSyncError, createNpmAuditMockScenarios } from './mockHelpers';

// Define scenarios for different npm audit outputs
const npmAuditScenarios = createNpmAuditMockScenarios();

// Mock state that can be configured in tests
export const mockState = {
  // Whether execSync should throw an error
  shouldThrow: false,
  // The command that was last executed
  lastCommand: '',
  // Custom output to return for specific commands
  commandOutputs: new Map<string, string>(),
  // Default output for npm audit --json command
  defaultNpmAuditOutput: npmAuditScenarios.clean,
  // Default error to throw when shouldThrow is true
  defaultError: createExecSyncError('npm audit --json', npmAuditScenarios.withHighVulnerabilities),
};

/**
 * Mock implementation of child_process.execSync
 *
 * This mock will:
 * - Record the command in mockState.lastCommand
 * - Return a predefined output based on the command
 * - Throw an error if mockState.shouldThrow is true
 *
 * @param command - The command to execute
 * @param options - Options for executing the command
 * @returns The simulated command output
 */
export const execSync = jest.fn((command: string, _options: any = {}): string => {
  mockState.lastCommand = command;

  // Check if we're configured to throw an error
  if (mockState.shouldThrow) {
    throw mockState.defaultError;
  }

  // Look for a predefined output for this exact command
  if (mockState.commandOutputs.has(command)) {
    return mockState.commandOutputs.get(command) as string;
  }

  // Handle specific commands
  if (command === 'npm audit --json') {
    return mockState.defaultNpmAuditOutput;
  }

  // Default: return an empty string for unknown commands
  return '';
});

/**
 * Configure the mock to return a specific npm audit result
 *
 * @param scenarioName - The name of the predefined scenario to use
 */
export function mockNpmAuditResult(scenarioName: keyof typeof npmAuditScenarios): void {
  mockState.defaultNpmAuditOutput = npmAuditScenarios[scenarioName];
}

/**
 * Configure the mock to set a custom output for a specific command
 *
 * @param command - The exact command string
 * @param output - The output to return when this command is executed
 */
export function mockCommandOutput(command: string, output: string): void {
  mockState.commandOutputs.set(command, output);
}

/**
 * Configure the mock to throw an error for execSync
 *
 * @param error - Optional custom error to throw
 */
export function mockExecSyncFailure(
  error = createExecSyncError('npm audit --json', npmAuditScenarios.withHighVulnerabilities)
): void {
  mockState.shouldThrow = true;
  mockState.defaultError = error;
}

/**
 * Configure the mock to succeed (not throw errors)
 */
export function mockExecSyncSuccess(): void {
  mockState.shouldThrow = false;
}

/**
 * Reset the mock state to default values
 */
export function resetMock(): void {
  mockState.shouldThrow = false;
  mockState.lastCommand = '';
  mockState.commandOutputs.clear();
  mockState.defaultNpmAuditOutput = npmAuditScenarios.clean;
  mockState.defaultError = createExecSyncError(
    'npm audit --json',
    npmAuditScenarios.withHighVulnerabilities
  );
  jest.clearAllMocks();
}

// No need to call jest.mock here - we'll use manual mocking with the __mocks__ directory

// Explicitly add typed exports for better IDE support
export default {
  execSync,
  mockNpmAuditResult,
  mockCommandOutput,
  mockExecSyncFailure,
  mockExecSyncSuccess,
  resetMock,
  mockState,
  npmAuditScenarios,
};
