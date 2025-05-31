/**
 * Tests for CLI utility functions
 *
 * These tests verify the CLI utility functions that support the audit-filter script
 */

import { analyzeResults, getExitCode, displayResults } from '../cli-utils';
import {
  createCleanAuditResult,
  createHighVulnerabilitiesAuditResult,
  createMockAllowlist,
} from '../__mocks__/mockHelpers';
import type { AnalysisResult } from '../types';
import { logger } from '../../logger';

// Jest will automatically mock child_process when imported
jest.mock('child_process');

// Mock nanoid for consistent correlation IDs
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id'),
}));

// Mock console methods to test displayResults
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();

describe('CLI Utility Functions', () => {
  describe('Data Sanitization (T014)', () => {
    let loggerInfoSpy: jest.SpyInstance;
    let loggerWarnSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      loggerInfoSpy = jest.spyOn(logger, 'info').mockImplementation();
      loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation();
      loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();
    });

    afterEach(() => {
      loggerInfoSpy.mockRestore();
      loggerWarnSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    test('should log sanitized vulnerability data from real displayResults calls', () => {
      // Test with a real scenario that will trigger log calls
      const results: AnalysisResult = {
        isSuccessful: true,
        vulnerabilities: [],
        allowedVulnerabilities: [
          {
            id: 'GHSA-test-123',
            package: 'test-package',
            severity: 'high',
            title: 'SENSITIVE: Should not appear in logs',
            url: 'https://sensitive-url.com/advisory',
            allowlistStatus: 'allowed',
            reason: 'SENSITIVE: Business justification',
          },
        ],
        expiredAllowlistEntries: [],
        expiringEntries: [],
      };

      displayResults(results);

      // Verify sanitization worked - should only contain package, id, severity
      expect(loggerInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('allowlisted vulnerabilities'),
        expect.objectContaining({
          vulnerabilities: [
            {
              package: 'test-package',
              id: 'GHSA-test-123',
              severity: 'high',
            },
          ],
        })
      );

      // Verify no sensitive data leaked through
      const allLogCalls = loggerInfoSpy.mock.calls;
      allLogCalls.forEach(call => {
        const logString = JSON.stringify(call);
        expect(logString).not.toContain('SENSITIVE:');
        expect(logString).not.toContain('https://sensitive-url.com');
        expect(logString).not.toContain('Business justification');
      });
    });

    test('should not log sensitive vulnerability details', () => {
      const sensitiveData = {
        title: 'SENSITIVE TITLE',
        url: 'https://sensitive-url.com',
        reason: 'SENSITIVE REASON',
        expiresOn: '2024-01-01',
      };

      const results: AnalysisResult = {
        isSuccessful: false,
        vulnerabilities: [
          {
            id: 'test',
            package: 'test-pkg',
            severity: 'high',
            allowlistStatus: 'new',
            ...sensitiveData,
          },
        ],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
      };

      displayResults(results);

      // Check that none of the log calls contain sensitive data
      const allLogCalls = [
        ...loggerInfoSpy.mock.calls,
        ...loggerWarnSpy.mock.calls,
        ...loggerErrorSpy.mock.calls,
      ];

      allLogCalls.forEach(call => {
        const logMessage = call[0];
        const logContext = call[1];
        const fullLogString = JSON.stringify([logMessage, logContext]);

        expect(fullLogString).not.toContain('SENSITIVE TITLE');
        expect(fullLogString).not.toContain('https://sensitive-url.com');
        expect(fullLogString).not.toContain('SENSITIVE REASON');
      });
    });
  });
  // Set up console mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
  });

  // Restore original console methods after tests
  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('analyzeResults', () => {
    const CURRENT_DATE = new Date('2023-01-01');

    test('should analyze clean audit correctly', () => {
      const cleanAudit = createCleanAuditResult();
      const emptyAllowlist = createMockAllowlist([]);

      const result = analyzeResults(cleanAudit, emptyAllowlist, CURRENT_DATE);

      expect(result.vulnerabilities).toHaveLength(0);
      expect(result.allowedVulnerabilities).toHaveLength(0);
      expect(result.isSuccessful).toBe(true);
    });

    test('should analyze vulnerabilities correctly', () => {
      const vulnerableAudit = createHighVulnerabilitiesAuditResult();
      const emptyAllowlist = createMockAllowlist([]);

      const result = analyzeResults(vulnerableAudit, emptyAllowlist, CURRENT_DATE);

      expect(result.vulnerabilities.length).toBeGreaterThan(0);
      expect(result.isSuccessful).toBe(false);
    });

    test('should handle null allowlist', () => {
      const cleanAudit = createCleanAuditResult();

      const result = analyzeResults(cleanAudit, null, CURRENT_DATE);

      expect(result.vulnerabilities).toHaveLength(0);
      expect(result.allowedVulnerabilities).toHaveLength(0);
      expect(result.isSuccessful).toBe(true);
    });
  });

  describe('getExitCode', () => {
    test('should return 0 for successful analysis', () => {
      const mockResult: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: true,
      };

      expect(getExitCode(mockResult)).toBe(0);
    });

    test('should return 1 for unsuccessful analysis', () => {
      const mockResult: AnalysisResult = {
        vulnerabilities: [
          {
            id: 1234,
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com',
            allowlistStatus: 'new',
          },
        ],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: false,
      };

      expect(getExitCode(mockResult)).toBe(1);
    });
  });

  describe('displayResults', () => {
    test('should display success message for clean audit', () => {
      const mockResult: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: true,
      };

      displayResults(mockResult, true); // Use legacy output for test compatibility

      // Verify console output
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Security scan passed!');
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    test('should display allowed vulnerabilities', () => {
      const mockResult: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [
          {
            id: 1234,
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com',
            allowlistStatus: 'allowed',
            reason: 'Test reason',
          },
        ],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: true,
      };

      displayResults(mockResult, true); // Use legacy output for test compatibility

      // Verify console output
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Security scan passed!');
      expect(mockConsoleLog).toHaveBeenCalledWith('\n1 allowlisted vulnerabilities found:');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '  - test-package@1234 (high): Test Vulnerability'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('    Reason: Test reason');
    });

    test('should display expiring entries warning', () => {
      const mockResult: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [
          {
            id: 1234,
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com',
            allowlistStatus: 'allowed',
            reason: 'Test reason',
            expiresOn: '2023-01-15',
          },
        ],
        isSuccessful: true,
      };

      displayResults(mockResult, true); // Use legacy output for test compatibility

      // Verify console output
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Security scan passed!');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '\n⚠️  Warning: The following allowlist entries will expire within 30 days:'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('  - test-package@1234 expires on 2023-01-15');
    });

    test('should display failure message for vulnerabilities', () => {
      const mockResult: AnalysisResult = {
        vulnerabilities: [
          {
            id: 1234,
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com',
            allowlistStatus: 'new',
          },
        ],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: false,
      };

      displayResults(mockResult, true); // Use legacy output for test compatibility

      // Verify console output
      expect(mockConsoleError).toHaveBeenCalledWith('❌ Security scan failed!');
      expect(mockConsoleError).toHaveBeenCalledWith(
        '\nFound 1 non-allowlisted high/critical vulnerabilities:'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        '  - test-package@1234 (high): Test Vulnerability'
      );
      expect(mockConsoleError).toHaveBeenCalledWith('    URL: https://example.com');
    });

    test('should display expired allowlist entries', () => {
      const mockResult: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [
          {
            id: 1234,
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com',
            allowlistStatus: 'expired',
            reason: 'Test reason',
            expiresOn: '2022-01-01',
          },
        ],
        expiringEntries: [],
        isSuccessful: false,
      };

      displayResults(mockResult, true); // Use legacy output for test compatibility

      // Verify console output
      expect(mockConsoleError).toHaveBeenCalledWith('❌ Security scan failed!');
      expect(mockConsoleError).toHaveBeenCalledWith('\n1 allowlist entries have expired:');
      expect(mockConsoleError).toHaveBeenCalledWith(
        '  - test-package@1234 (high): Test Vulnerability'
      );
      expect(mockConsoleError).toHaveBeenCalledWith('    Reason was: Test reason');
      expect(mockConsoleError).toHaveBeenCalledWith('    Expired on: 2022-01-01');
    });

    test('should display remediation instructions on failure', () => {
      const mockResult: AnalysisResult = {
        vulnerabilities: [
          {
            id: 1234,
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com',
            allowlistStatus: 'new',
          },
        ],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: false,
      };

      displayResults(mockResult, true); // Use legacy output for test compatibility

      // Verify remediation instructions
      expect(mockConsoleError).toHaveBeenCalledWith('\nTo fix this issue:');
      expect(mockConsoleError).toHaveBeenCalledWith(
        '1. Update dependencies to resolve vulnerabilities'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        '2. Or add entries to .audit-allowlist.json with proper justification'
      );
    });
  });
});
