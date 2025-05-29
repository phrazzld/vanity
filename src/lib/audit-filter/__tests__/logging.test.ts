/**
 * Logging output tests for audit-filter
 *
 * These tests verify that the audit-filter CLI correctly outputs
 * appropriate logging messages based on the analysis results.
 */

import { displayResults } from '../cli-utils';
import type { AnalysisResult } from '../types';
import {
  createCleanAuditResult,
  createHighVulnerabilitiesAuditResult,
  createMockAllowlist,
} from '../__mocks__/mockHelpers';
import { analyzeAuditReport } from '../core';

// Mock console.log and console.error
let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

// Reference date for testing
const CURRENT_DATE = new Date('2023-01-01');

describe('Logging Output Tests', () => {
  // Set up console spies before each test
  beforeEach(() => {
    // Mock console.log and console.error
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Restore console functions after each test
  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Tests for displayResults function
  describe('displayResults', () => {
    test('should log success message for successful analysis result', () => {
      const result: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: true,
      };

      displayResults(result);

      // Verify console.log was called with success message
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Security scan passed!');
      // Verify console.error was not called
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should log error message for unsuccessful analysis result', () => {
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

      displayResults(result);

      // Verify console.error was called with failure message
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Security scan failed!');
      // Verify console.log was not called
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should log details of vulnerabilities for unsuccessful result', () => {
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

      displayResults(result);

      // Verify vulnerability details are logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Found 1 non-allowlisted high/critical vulnerabilities:')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-package@1234 (high): Test Vulnerability')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('URL: https://example.com/vuln/1234')
      );
    });

    test('should log details of allowed vulnerabilities for successful result', () => {
      const result: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [
          {
            id: '1234',
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com/vuln/1234',
            allowlistStatus: 'allowed',
            reason: 'Test reason',
            expiresOn: '2099-01-01',
          },
        ],
        expiredAllowlistEntries: [],
        expiringEntries: [],
        isSuccessful: true,
      };

      displayResults(result);

      // Verify allowed vulnerability details are logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('1 allowlisted vulnerabilities found:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-package@1234 (high): Test Vulnerability')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Reason: Test reason'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Expires: 2099-01-01'));
    });

    test('should log details of expired allowlist entries for unsuccessful result', () => {
      const result: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [
          {
            id: '1234',
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com/vuln/1234',
            allowlistStatus: 'expired',
            reason: 'Test reason',
            expiresOn: '2022-01-01',
          },
        ],
        expiringEntries: [],
        isSuccessful: false,
      };

      displayResults(result);

      // Verify expired allowlist entries are logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('1 allowlist entries have expired:')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-package@1234 (high): Test Vulnerability')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Reason was: Test reason')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expired on: 2022-01-01')
      );
    });

    test('should log warnings for entries expiring soon for successful result', () => {
      const result: AnalysisResult = {
        vulnerabilities: [],
        allowedVulnerabilities: [],
        expiredAllowlistEntries: [],
        expiringEntries: [
          {
            id: '1234',
            package: 'test-package',
            severity: 'high',
            title: 'Test Vulnerability',
            url: 'https://example.com/vuln/1234',
            allowlistStatus: 'allowed',
            reason: 'Test reason',
            expiresOn: '2023-01-15',
          },
        ],
        isSuccessful: true,
      };

      displayResults(result);

      // Verify expiring soon warnings are logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '⚠️  Warning: The following allowlist entries will expire within 30 days:'
        )
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-package@1234 expires on 2023-01-15')
      );
    });
  });

  // Integration tests for logging output
  describe('integration', () => {
    test('should log success message for clean audit', () => {
      // Set up a clean audit scenario
      const cleanAudit = createCleanAuditResult();
      const emptyAllowlist = createMockAllowlist([]);

      // Analyze the results
      const results = analyzeAuditReport(cleanAudit, emptyAllowlist, CURRENT_DATE);

      // Display the results
      displayResults(results);

      // Verify success message is logged
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Security scan passed!');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should log error message for new vulnerabilities', () => {
      // Set up a scenario with vulnerabilities not in allowlist
      const highVulnAudit = createHighVulnerabilitiesAuditResult();
      const emptyAllowlist = createMockAllowlist([]);

      // Analyze the results
      const results = analyzeAuditReport(highVulnAudit, emptyAllowlist, CURRENT_DATE);

      // Display the results
      displayResults(results);

      // Verify error message is logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Security scan failed!');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Found 2 non-allowlisted high/critical vulnerabilities:')
      );
    });

    test('should log details of allowed vulnerabilities', () => {
      // Set up a scenario with vulnerabilities covered by allowlist
      const highVulnAudit = createHighVulnerabilitiesAuditResult();

      // Create a valid allowlist
      const validAllowlist = createMockAllowlist([
        {
          id: '1234',
          package: 'vulnerable-package-1',
          reason: 'Test reason 1',
          expires: '2099-01-01',
        },
        {
          id: '5678',
          package: 'vulnerable-package-2',
          reason: 'Test reason 2',
          expires: '2099-01-01',
        },
      ]);

      // Analyze the results
      const results = analyzeAuditReport(highVulnAudit, validAllowlist, CURRENT_DATE);

      // Display the results
      displayResults(results);

      // Verify allowed vulnerabilities are logged
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Security scan passed!');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('2 allowlisted vulnerabilities found:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('vulnerable-package-1@1234')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Reason: Test reason 1'));
    });

    test('should sanitize sensitive data in logs', () => {
      // Set up a scenario with vulnerabilities not in allowlist
      const highVulnAudit = createHighVulnerabilitiesAuditResult();
      const emptyAllowlist = createMockAllowlist([]);

      // Analyze the results
      const results = analyzeAuditReport(highVulnAudit, emptyAllowlist, CURRENT_DATE);

      // Display the results
      displayResults(results);

      // Verify only minimal identifiers are logged (no detailed vulnerability information)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('vulnerable-package-1@1234 (high): Remote Code Execution')
      );

      // Make sure vulnerable_versions is not logged
      const allErrorCalls = consoleErrorSpy.mock.calls.flat().join(' ');
      expect(allErrorCalls).not.toContain('vulnerable_versions');
      expect(allErrorCalls).not.toContain('>=1.0.0 <2.0.0');
    });
  });
});
