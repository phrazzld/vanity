/**
 * Tests for executeNpmAudit function
 *
 * These tests specifically target the executeNpmAudit function in the cli-utils module
 */

import { executeNpmAudit } from '../cli-utils';

// We'll need to mock the child_process module
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Import the mocked child_process module
import { execSync } from 'child_process';

describe('executeNpmAudit', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should execute npm audit command and return output', () => {
    // Mock successful execution
    const mockOutput = JSON.stringify({
      advisories: {},
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0,
          total: 0,
        },
      },
    });

    (execSync as jest.Mock).mockReturnValue(mockOutput);

    // Call the function
    const result = executeNpmAudit();

    // Verify the command was executed with the correct arguments
    expect(execSync).toHaveBeenCalledWith('npm audit --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Verify the output
    expect(result).toBe(mockOutput);
  });

  test('should handle execution errors with stdout', () => {
    // Mock execSync to throw an error with stdout
    const mockOutput = JSON.stringify({
      advisories: {
        '1234': {
          id: 1234,
          module_name: 'vulnerable-package',
          severity: 'high',
          title: 'Test Vulnerability',
          url: 'https://example.com',
          vulnerable_versions: '>=1.0.0',
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 0,
          high: 1,
          critical: 0,
          total: 1,
        },
      },
    });

    const mockError = {
      stdout: mockOutput,
      message: 'Command failed with exit code 1',
    };

    (execSync as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function - should not throw
    const result = executeNpmAudit();

    // Verify it returned stdout from the error
    expect(result).toBe(mockOutput);
  });

  test('should rethrow errors without stdout', () => {
    // Mock execSync to throw an error without stdout
    const mockError = new Error('Unexpected error');

    (execSync as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function - should throw
    expect(() => executeNpmAudit()).toThrow('Error executing npm audit: Unexpected error');
  });
});
