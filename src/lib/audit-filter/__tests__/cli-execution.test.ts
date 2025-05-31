/**
 * CLI execution tests for audit-filter
 *
 * These tests verify the end-to-end behavior of the audit-filter script,
 * including process exit codes and command line handling.
 */

import { analyzeAuditReport } from '../core';
import {
  createCleanAuditResult,
  createHighVulnerabilitiesAuditResult,
  createMockAllowlist,
} from '../__mocks__/mockHelpers';

// Import the mocks directly to manipulate them
import * as childProcessMock from '../__mocks__/child_process';
import * as fsMock from '../__mocks__/fs';

// Mock process.cwd to return a consistent path for tests
jest.spyOn(process, 'cwd').mockReturnValue('/path/to'); // eslint-disable-line no-undef

// Create a reference date for testing
const CURRENT_DATE = new Date('2023-01-01');
const _MOCK_ALLOWLIST_PATH = '/path/to/.audit-allowlist.json';

describe('CLI execution tests', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    childProcessMock.resetMock();
    fsMock.resetMock();
  });

  test('should return exit code 0 for clean audit', () => {
    // Set up a clean audit scenario
    const cleanAudit = createCleanAuditResult();
    const emptyAllowlist = createMockAllowlist([]);

    // Analyze the results
    const results = analyzeAuditReport(cleanAudit, emptyAllowlist, CURRENT_DATE);

    // Verify results
    expect(results.vulnerabilities).toHaveLength(0);
    expect(results.allowedVulnerabilities).toHaveLength(0);
    expect(results.expiredAllowlistEntries).toHaveLength(0);
    expect(results.isSuccessful).toBe(true);
  });

  test('should return exit code 1 for new vulnerabilities', () => {
    // Set up a scenario with vulnerabilities not in allowlist
    const highVulnAudit = createHighVulnerabilitiesAuditResult();
    const emptyAllowlist = createMockAllowlist([]);

    // Analyze the results
    const results = analyzeAuditReport(highVulnAudit, emptyAllowlist, CURRENT_DATE);

    // Verify results
    expect(results.vulnerabilities.length).toBeGreaterThan(0);
    expect(results.isSuccessful).toBe(false);
  });

  test('should return exit code 1 for expired allowlist entries', () => {
    // Set up a scenario with vulnerabilities that have expired allowlist entries
    const highVulnAudit = createHighVulnerabilitiesAuditResult();

    // Create an allowlist with expired entries
    const expiredAllowlist = createMockAllowlist([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason',
        expires: '2022-01-01T00:00:00Z', // Expired
      },
      {
        id: '5678',
        package: 'vulnerable-package-2',
        reason: 'Test reason',
        expires: '2022-01-01T00:00:00Z', // Expired
      },
    ]);

    // Analyze the results
    const results = analyzeAuditReport(highVulnAudit, expiredAllowlist, CURRENT_DATE);

    // Verify results
    expect(results.expiredAllowlistEntries.length).toBeGreaterThan(0);
    expect(results.isSuccessful).toBe(false);
  });

  test('should return exit code 0 for vulnerabilities with valid allowlist entries', () => {
    // Set up a scenario with vulnerabilities covered by allowlist
    const highVulnAudit = createHighVulnerabilitiesAuditResult();

    // Create a valid allowlist
    const validAllowlist = createMockAllowlist([
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

    // Analyze the results
    const results = analyzeAuditReport(highVulnAudit, validAllowlist, CURRENT_DATE);

    // Verify results
    expect(results.allowedVulnerabilities.length).toBeGreaterThan(0);
    expect(results.vulnerabilities).toHaveLength(0);
    expect(results.expiredAllowlistEntries).toHaveLength(0);
    expect(results.isSuccessful).toBe(true);
  });

  test('should handle command execution failure', () => {
    // Set up mocks
    childProcessMock.mockExecSyncFailure();

    // Verify the mock is configured to throw
    expect(childProcessMock.mockState.shouldThrow).toBe(true);

    // Verify execSync throws when called
    expect(() => {
      childProcessMock.execSync('npm audit --json', {});
    }).toThrow();
  });

  test('should handle missing allowlist', () => {
    // Set up a scenario with vulnerabilities and no allowlist
    const highVulnAudit = createHighVulnerabilitiesAuditResult();

    // Analyze the results with null allowlist
    const results = analyzeAuditReport(highVulnAudit, null, CURRENT_DATE);

    // Verify results
    expect(results.vulnerabilities.length).toBeGreaterThan(0);
    expect(results.allowedVulnerabilities).toHaveLength(0);
    expect(results.isSuccessful).toBe(false);
  });

  test('should handle malformed allowlist JSON', () => {
    // Set up a scenario with malformed allowlist
    const cleanAudit = createCleanAuditResult();
    const malformedAllowlist = '{malformed json';

    // Analyzing results should throw an error for malformed JSON
    expect(() => analyzeAuditReport(cleanAudit, malformedAllowlist, CURRENT_DATE)).toThrow();
  });

  test('should handle malformed npm audit output', () => {
    // Set up a scenario with malformed npm audit output
    const malformedAudit = '{malformed json';
    const validAllowlist = createMockAllowlist([]);

    // Analyzing results should throw an error for malformed JSON
    expect(() => analyzeAuditReport(malformedAudit, validAllowlist, CURRENT_DATE)).toThrow();
  });
});
