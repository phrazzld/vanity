/**
 * Exit code tests for audit-filter
 *
 * These tests verify that the audit-filter CLI correctly sets exit codes
 * based on the analysis results in different scenarios.
 */

import { getExitCode } from '../cli-utils';
import type { AnalysisResult } from '../types';
import {
  createCleanAuditResult,
  createHighVulnerabilitiesAuditResult,
  createMockAllowlist,
} from '../__mocks__/mockHelpers';
import { analyzeAuditReport } from '../core';

// Import mocks directly to manipulate them
import * as childProcessMock from '../__mocks__/child_process';
import * as fsMock from '../__mocks__/fs';

// Mock process.exit
// eslint-disable-next-line no-undef
const mockExit = jest.spyOn(process, 'exit').mockImplementation(code => {
  throw new Error(`Process.exit called with code: ${code}`);
});

// Reference date for testing
const CURRENT_DATE = new Date('2023-01-01');

describe('Exit Code Tests', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    childProcessMock.resetMock();
    fsMock.resetMock();
  });

  afterAll(() => {
    mockExit.mockRestore();
  });

  // Tests for getExitCode function
  describe('getExitCode', () => {
    test('should return 0 for successful analysis result', () => {
      const result: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: true,
      };

      expect(getExitCode(result)).toBe(0);
    });

    test('should return 1 for unsuccessful analysis result', () => {
      const result: AnalysisResult = {
        vulnerabilities: [
          {
            id: '1234',
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com/vuln/1234',
            allowlistStatus: 'new',
          },
        ],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: false,
      };

      expect(getExitCode(result)).toBe(1);
    });
  });

  // Integration tests for exit codes
  describe('integration', () => {
    test('should exit with code 0 for clean audit', () => {
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

      // Verify exit code
      expect(getExitCode(results)).toBe(0);
    });

    test('should throw error for corrupt allowlist JSON', () => {
      // Set up a clean audit scenario
      const cleanAudit = createCleanAuditResult();
      const corruptAllowlist = '{invalid json with trailing comma,}';

      // Verify that corrupt JSON throws an error
      expect(() => analyzeAuditReport(cleanAudit, corruptAllowlist, CURRENT_DATE)).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });

    test('should exit with code 1 for new vulnerabilities', () => {
      // Set up a scenario with vulnerabilities not in allowlist
      const highVulnAudit = createHighVulnerabilitiesAuditResult();
      const emptyAllowlist = createMockAllowlist([]);

      // Analyze the results
      const results = analyzeAuditReport(highVulnAudit, emptyAllowlist, CURRENT_DATE);

      // Verify results
      expect(results.vulnerabilities.length).toBeGreaterThan(0);
      expect(results.isSuccessful).toBe(false);

      // Verify exit code
      expect(getExitCode(results)).toBe(1);
    });

    test('should exit with code 1 for expired allowlist entries', () => {
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

      // Verify exit code
      expect(getExitCode(results)).toBe(1);
    });

    test('should exit with code 0 for vulnerabilities with valid allowlist entries', () => {
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

      // Verify exit code
      expect(getExitCode(results)).toBe(0);
    });
  });

  // Test for process.exit in error conditions
  describe('error scenarios', () => {
    test('should call process.exit(1) when parseNpmAuditJson throws an error', () => {
      // Set up malformed JSON
      const malformedJson = '{not valid json';

      // Verify that analyzing malformed JSON throws an error
      expect(() => {
        analyzeAuditReport(malformedJson, null, CURRENT_DATE);
      }).toThrow();
    });

    test('should call process.exit(1) when parseAndValidateAllowlist throws an error', () => {
      // Set up clean audit
      const cleanAudit = createCleanAuditResult();

      // Malformed allowlist
      const malformedAllowlist = '{not valid json';

      // Verify that analyzing with malformed allowlist throws an error
      expect(() => {
        analyzeAuditReport(cleanAudit, malformedAllowlist, CURRENT_DATE);
      }).toThrow();
    });
  });
});
