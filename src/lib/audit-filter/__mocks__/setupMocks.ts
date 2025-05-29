/**
 * Setup and configuration for audit-filter mocks
 *
 * This module provides functions to set up common test scenarios
 * using the mock implementations of fs and child_process.
 */

/* global jest */

import childProcessMock from './child_process';
import fsMock from './fs';
import { createMockAllowlist, resetAllMocks } from './mockHelpers';

/**
 * Common path used for allowlist file in tests
 */
export const MOCK_ALLOWLIST_PATH = '/path/to/.audit-allowlist.json';

/**
 * Reset all mocks to their default state
 * Call this in beforeEach to ensure test isolation
 */
export function resetMocks(): void {
  childProcessMock.resetMock();
  fsMock.resetMock();
  resetAllMocks();
}

/**
 * Set up mocks for a clean audit with no vulnerabilities
 * and a valid allowlist file
 */
export function setupCleanAuditWithAllowlist(): void {
  // Set up npm audit to return a clean result
  childProcessMock.mockNpmAuditResult('clean');
  childProcessMock.mockExecSyncSuccess();

  // Ensure the allowlist file exists
  fsMock.mockReadFileSuccess();
}

/**
 * Set up mocks for a scenario with high severity vulnerabilities
 * and a matching allowlist
 */
export function setupVulnerabilitiesWithMatchingAllowlist(): void {
  // Set up npm audit to return high severity vulnerabilities
  childProcessMock.mockNpmAuditResult('withHighVulnerabilities');

  // Create an allowlist that matches the vulnerabilities
  const allowlistEntries = [
    {
      id: '1234',
      package: 'vulnerable-package-1',
      reason: 'False positive, fixed in our usage',
      expires: '2099-12-31',
    },
    {
      id: '5678',
      package: 'vulnerable-package-2',
      reason: 'Working on upgrade',
      expires: '2099-12-31',
    },
  ];

  // Add the allowlist file to the mock filesystem
  fsMock.addMockFile(MOCK_ALLOWLIST_PATH, createMockAllowlist(allowlistEntries));
}

/**
 * Set up mocks for a scenario with vulnerabilities
 * and a partially matching allowlist (some entries are missing)
 */
export function setupVulnerabilitiesWithPartialAllowlist(): void {
  // Set up npm audit to return high severity vulnerabilities
  childProcessMock.mockNpmAuditResult('withHighVulnerabilities');

  // Create an allowlist that only matches some of the vulnerabilities
  const allowlistEntries = [
    {
      id: '1234',
      package: 'vulnerable-package-1',
      reason: 'False positive, fixed in our usage',
      expires: '2099-12-31',
    },
    // Missing entry for vulnerable-package-2
  ];

  // Add the allowlist file to the mock filesystem
  fsMock.addMockFile(MOCK_ALLOWLIST_PATH, createMockAllowlist(allowlistEntries));
}

/**
 * Set up mocks for a scenario with vulnerabilities
 * and a expired allowlist entries
 */
export function setupVulnerabilitiesWithExpiredAllowlist(): void {
  // Set up npm audit to return high severity vulnerabilities
  childProcessMock.mockNpmAuditResult('withHighVulnerabilities');

  // Create an allowlist with expired entries
  const allowlistEntries = [
    {
      id: '1234',
      package: 'vulnerable-package-1',
      reason: 'False positive, fixed in our usage',
      expires: '2020-01-01', // Expired
    },
    {
      id: '5678',
      package: 'vulnerable-package-2',
      reason: 'Working on upgrade',
      expires: '2020-01-01', // Expired
    },
  ];

  // Add the allowlist file to the mock filesystem
  fsMock.addMockFile(MOCK_ALLOWLIST_PATH, createMockAllowlist(allowlistEntries));
}

/**
 * Set up mocks for a scenario where the allowlist file doesn't exist
 */
export function setupMissingAllowlist(): void {
  // Remove the allowlist file from the mock filesystem
  fsMock.removeMockFile(MOCK_ALLOWLIST_PATH);
}

/**
 * Set up mocks for a scenario where the allowlist file is malformed
 */
export function setupMalformedAllowlist(): void {
  // Add a malformed allowlist file to the mock filesystem
  fsMock.addMockFile(MOCK_ALLOWLIST_PATH, '{malformed json');
}

/**
 * Set up mocks for a scenario where npm audit fails
 */
export function setupNpmAuditFailure(): void {
  // Configure child_process.execSync to throw an error
  childProcessMock.mockExecSyncFailure();
}

/**
 * Set up mocks for a scenario where reading the allowlist file fails
 */
export function setupAllowlistReadFailure(): void {
  // Configure fs.readFileSync to throw a specific error
  fsMock.mockReadFileFailure('Error reading allowlist file');
}

// Export all the mock modules for direct access if needed
export { childProcessMock, fsMock };
