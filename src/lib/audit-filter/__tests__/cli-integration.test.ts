/**
 * CLI integration tests for audit-filter
 *
 * These tests verify the end-to-end behavior of the audit-filter CLI,
 * focusing on the interaction between exit codes and logging output.
 */

import { analyzeResults, getExitCode, displayResults } from '../cli-utils';
import {
  createMockAllowlist,
  createCleanAuditResult,
  createHighVulnerabilitiesAuditResult,
} from '../__mocks__/mockHelpers';

// Mocking console and process.exit
let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;
let processExitSpy: jest.SpyInstance;

// Mock constants
const CURRENT_DATE = new Date('2023-01-01');

// Helper function to simulate CLI execution flow
function simulateCliExecution(auditOutput: string, allowlistContent: string | null): number {
  try {
    // Analyze results
    const results = analyzeResults(auditOutput, allowlistContent, CURRENT_DATE);

    // Display results
    displayResults(results);

    // Get exit code
    return getExitCode(results);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    return 1;
  }
}

describe('CLI Integration Tests', () => {
  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock process.exit
    // eslint-disable-next-line no-undef
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(code => {
      throw new Error(`Process.exit called with code: ${code}`);
    });
  });

  afterEach(() => {
    // Restore all mocks
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  test('should display success message and exit with code 0 for clean audit', () => {
    // Set up clean audit scenario
    const auditOutput = createCleanAuditResult();
    const allowlistContent = createMockAllowlist([]);

    // Simulate CLI execution
    const exitCode = simulateCliExecution(auditOutput, allowlistContent);

    // Verify successful execution
    expect(exitCode).toBe(0);
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ Security scan passed!');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('should display error message and exit with code 1 for vulnerabilities', () => {
    // Set up vulnerability scenario
    const auditOutput = createHighVulnerabilitiesAuditResult();
    const allowlistContent = createMockAllowlist([]);

    // Simulate CLI execution
    const exitCode = simulateCliExecution(auditOutput, allowlistContent);

    // Verify failed execution
    expect(exitCode).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Security scan failed!');
    expect(consoleLogSpy).not.toHaveBeenCalledWith('✅ Security scan passed!');
  });

  test('should display allowed vulnerabilities and exit with code 0 when allowlisted', () => {
    // Set up allowlisted vulnerability scenario
    const auditOutput = createHighVulnerabilitiesAuditResult();

    // Create an allowlist that covers the vulnerabilities
    const allowlistContent = createMockAllowlist([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        expires: '2099-01-01T00:00:00Z',
      },
      {
        id: '5678',
        package: 'vulnerable-package-2',
        reason: 'Test reason 2',
        expires: '2099-01-01T00:00:00Z',
      },
    ]);

    // Simulate CLI execution
    const exitCode = simulateCliExecution(auditOutput, allowlistContent);

    // Verify successful execution with allowlist
    expect(exitCode).toBe(0);
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ Security scan passed!');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('allowlisted vulnerabilities found')
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('should display expired allowlist entries and exit with code 1', () => {
    // Set up expired allowlist scenario
    const auditOutput = createHighVulnerabilitiesAuditResult();

    // Create an allowlist with expired entries
    const allowlistContent = createMockAllowlist([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        expires: '2022-01-01T00:00:00Z', // Expired
      },
      {
        id: '5678',
        package: 'vulnerable-package-2',
        reason: 'Test reason 2',
        expires: '2022-01-01T00:00:00Z', // Expired
      },
    ]);

    // Simulate CLI execution
    const exitCode = simulateCliExecution(auditOutput, allowlistContent);

    // Verify failed execution due to expired allowlist entries
    expect(exitCode).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Security scan failed!');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('allowlist entries have expired')
    );
    expect(consoleLogSpy).not.toHaveBeenCalledWith('✅ Security scan passed!');
  });

  test('should exit with code 1 and display error message for malformed npm audit output', () => {
    // Set up malformed npm audit output
    const malformedAuditOutput = '{malformed json';
    const allowlistContent = createMockAllowlist([]);

    // Simulate CLI execution
    const exitCode = simulateCliExecution(malformedAuditOutput, allowlistContent);

    // Verify failed execution
    expect(exitCode).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalledWith('✅ Security scan passed!');
  });

  test('should exit with code 1 and display error message for missing allowlist', () => {
    // Set up scenario with high vulnerabilities and missing allowlist
    const auditOutput = createHighVulnerabilitiesAuditResult();
    const allowlistContent = null; // Missing allowlist

    // Simulate CLI execution
    const exitCode = simulateCliExecution(auditOutput, allowlistContent);

    // Verify failed execution
    expect(exitCode).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Security scan failed!');
    expect(consoleLogSpy).not.toHaveBeenCalledWith('✅ Security scan passed!');
  });
});
