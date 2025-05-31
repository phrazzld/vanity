/**
 * Tests for allowlist integration with npm audit results
 *
 * These tests verify the interaction between npm audit results and allowlist entries,
 * including handling of expired allowlists, partial allowlists, and other edge cases.
 */

import { analyzeAuditReport, isAllowlistEntryExpired, willExpireSoon } from '../core';
import type { AllowlistEntry } from '../types';
import {
  createHighVulnerabilitiesAuditResult,
  createCriticalVulnerabilitiesAuditResult,
  createMockAllowlist,
} from '../__mocks__/mockHelpers';

// Import fail from Jest to be used in conditionals
const { fail } = expect as any;

describe('Expired allowlist entries', () => {
  // Fixed test date
  const CURRENT_DATE = new Date('2023-01-01');

  // Test vulnerabilities
  const highVulnAudit = createHighVulnerabilitiesAuditResult();

  test('should identify expired allowlist entries', () => {
    // Create an allowlist with expired entries
    const expiredAllowlist = createMockAllowlist([
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
        expires: '2022-06-30T00:00:00Z', // Expired
      },
    ]);

    const result = analyzeAuditReport(highVulnAudit, expiredAllowlist, CURRENT_DATE);

    // All entries are expired, so they should be in expiredAllowlistEntries
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.expiredAllowlistEntries).toHaveLength(2);
    expect(result.isSuccessful).toBe(false);

    // Verify expired entry details
    if (result.expiredAllowlistEntries.length >= 2) {
      expect(result.expiredAllowlistEntries[0].id).toBe(1234);
      expect(result.expiredAllowlistEntries[0].allowlistStatus).toBe('expired');
      expect(result.expiredAllowlistEntries[1].id).toBe(5678);
      expect(result.expiredAllowlistEntries[1].allowlistStatus).toBe('expired');
    } else {
      fail('Expected expiredAllowlistEntries to have at least two entries');
    }
  });

  test('should identify entries expiring soon', () => {
    // Create an allowlist with entries expiring soon
    const expiringAllowlist = createMockAllowlist([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        expires: '2023-01-15T00:00:00Z', // 14 days from test date
      },
      {
        id: '5678',
        package: 'vulnerable-package-2',
        reason: 'Test reason 2',
        expires: '2023-01-30T00:00:00Z', // 29 days from test date
      },
    ]);

    const result = analyzeAuditReport(highVulnAudit, expiringAllowlist, CURRENT_DATE);

    // Entries are valid but expiring soon
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(2);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.expiringEntries).toHaveLength(2); // Both are expiring within 30 days
    expect(result.isSuccessful).toBe(true);
  });

  test('should not include entries beyond expiration threshold in expiringEntries', () => {
    // Create an allowlist with entries expiring at various times
    const mixedExpirationAllowlist = createMockAllowlist([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        expires: '2023-01-15T00:00:00Z', // 14 days from test date (expiring soon)
      },
      {
        id: '5678',
        package: 'vulnerable-package-2',
        reason: 'Test reason 2',
        expires: '2023-02-15T00:00:00Z', // 45 days from test date (not expiring soon)
      },
    ]);

    const result = analyzeAuditReport(highVulnAudit, mixedExpirationAllowlist, CURRENT_DATE);

    // Only one entry is expiring soon
    expect(result.expiringEntries).toHaveLength(1);

    // Verify it's the correct one
    if (result.expiringEntries.length > 0) {
      expect(result.expiringEntries[0].id).toBe(1234);
    } else {
      fail('Expected expiringEntries to have at least one entry');
    }
  });

  test('should reject allowlist entries without expiration dates during parsing', () => {
    // With the new implementation, entries without expiration dates should be rejected during parsing
    const noExpirationAllowlist = JSON.stringify([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        // No expires field
      },
    ]);

    // Test the direct expiration function first to confirm behavior
    const testEntry: AllowlistEntry = {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
      // No expires field
    };

    // Direct function still returns true (entry is expired if no expiration date)
    expect(isAllowlistEntryExpired(testEntry, CURRENT_DATE)).toBe(true);

    // Test full analysis should now throw an error during parsing
    expect(() => analyzeAuditReport(highVulnAudit, noExpirationAllowlist, CURRENT_DATE)).toThrow(
      /missing required property 'expires'/
    );
  });

  test('should reject invalid date formats during parsing', () => {
    const invalidDateAllowlist = createMockAllowlist([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        expires: 'not-a-date', // Invalid date
      },
    ]);

    // Test the direct function first (this still works with TypeScript objects)
    const testEntry: AllowlistEntry = {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
      expires: 'invalid-date-format',
    };

    expect(isAllowlistEntryExpired(testEntry, CURRENT_DATE)).toBe(true);

    // Test full analysis should now throw an error during parsing
    expect(() => analyzeAuditReport(highVulnAudit, invalidDateAllowlist, CURRENT_DATE)).toThrow(
      /invalid format/
    );
  });
});

describe('Allowlist matching behavior', () => {
  const CURRENT_DATE = new Date('2023-01-01');

  test('should only match exact package and vulnerability ID', () => {
    const highVulnAudit = createHighVulnerabilitiesAuditResult();

    // Create allowlist with similar but not exact entries
    const mismatchedAllowlist = createMockAllowlist([
      {
        id: '1234', // Correct ID
        package: 'vulnerable-package-1-wrong', // Wrong package
        reason: 'Test reason',
        expires: '2099-01-01T00:00:00Z',
      },
      {
        id: '5679', // Wrong ID
        package: 'vulnerable-package-2', // Correct package
        reason: 'Test reason',
        expires: '2099-01-01T00:00:00Z',
      },
    ]);

    const result = analyzeAuditReport(highVulnAudit, mismatchedAllowlist, CURRENT_DATE);

    // None should match despite similar values
    expect(result.vulnerabilities).toHaveLength(2);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.isSuccessful).toBe(false);
  });

  test('should handle mixed vulnerabilities with partial allowlist', () => {
    const highVulnAudit = createHighVulnerabilitiesAuditResult();
    const criticalVulnAudit = createCriticalVulnerabilitiesAuditResult();

    // Create a combined audit JSON with both high and critical vulnerabilities
    const combinedAudit = JSON.parse(highVulnAudit);
    const criticalAdvisories = JSON.parse(criticalVulnAudit).advisories;

    // Merge the advisories
    combinedAudit.advisories = {
      ...combinedAudit.advisories,
      ...criticalAdvisories,
    };

    // Update the metadata
    combinedAudit.metadata.vulnerabilities.critical = 1;
    combinedAudit.metadata.vulnerabilities.total = 3;

    // Create an allowlist that only covers some vulnerabilities
    const partialAllowlist = createMockAllowlist([
      {
        id: '1234', // Covers one high vulnerability
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        expires: '2099-01-01T00:00:00Z',
      },
      {
        id: '9012', // Covers the critical vulnerability
        package: 'vulnerable-package-3',
        reason: 'Test reason 3',
        expires: '2099-01-01T00:00:00Z',
      },
      // Missing allowlist entry for 5678 (vulnerable-package-2)
    ]);

    const result = analyzeAuditReport(
      JSON.stringify(combinedAudit),
      partialAllowlist,
      CURRENT_DATE
    );

    // Should have one non-allowlisted vulnerability
    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.allowedVulnerabilities).toHaveLength(2);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(false);

    // Verify the non-allowlisted vulnerability
    if (result.vulnerabilities.length > 0) {
      expect(result.vulnerabilities[0].id).toBe(5678);
      expect(result.vulnerabilities[0].package).toBe('vulnerable-package-2');
    } else {
      fail('Expected vulnerabilities to have one entry');
    }
  });

  test('should handle entries with different expiration statuses', () => {
    const highVulnAudit = createHighVulnerabilitiesAuditResult();

    // Create allowlist with one valid and one expired entry
    const mixedStatusAllowlist = createMockAllowlist([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        expires: '2099-01-01T00:00:00Z', // Valid
      },
      {
        id: '5678',
        package: 'vulnerable-package-2',
        reason: 'Test reason 2',
        expires: '2022-01-01T00:00:00Z', // Expired
      },
    ]);

    const result = analyzeAuditReport(highVulnAudit, mixedStatusAllowlist, CURRENT_DATE);

    // Should have one allowed and one expired vulnerability
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(1);
    expect(result.expiredAllowlistEntries).toHaveLength(1);
    expect(result.isSuccessful).toBe(false); // Fails due to expired entry

    // Verify the categories
    if (result.allowedVulnerabilities.length > 0) {
      expect(result.allowedVulnerabilities[0].id).toBe(1234);
    } else {
      fail('Expected allowedVulnerabilities to have one entry');
    }

    if (result.expiredAllowlistEntries.length > 0) {
      expect(result.expiredAllowlistEntries[0].id).toBe(5678);
    } else {
      fail('Expected expiredAllowlistEntries to have one entry');
    }
  });
});

describe('Edge cases for willExpireSoon', () => {
  test('should handle exact threshold date', () => {
    const currentDate = new Date('2023-01-01');
    const expirationDate = new Date('2023-01-31'); // Exactly 30 days from current

    const entry: AllowlistEntry = {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
      expires: expirationDate.toISOString().split('T')[0], // YYYY-MM-DD format
    };

    // Should return true as it's on the threshold
    expect(willExpireSoon(entry, currentDate, 30)).toBe(true);
  });

  test('should handle leap years correctly', () => {
    // Test with leap year (2024)
    const leapYearDate = new Date('2024-01-31');
    const leapYearExpiry = new Date('2024-02-29').toISOString().split('T')[0]; // leap day

    const leapYearEntry: AllowlistEntry = {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
      expires: leapYearExpiry,
    };

    // 29 days difference, should be expiring soon with 30-day threshold
    expect(willExpireSoon(leapYearEntry, leapYearDate, 30)).toBe(true);

    // Test with non-leap year (2023)
    const nonLeapYearDate = new Date('2023-01-31');

    // We must use a date that's valid in non-leap year
    const nonLeapYearExpiry = new Date('2023-02-28').toISOString().split('T')[0];

    const nonLeapYearEntry: AllowlistEntry = {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
      expires: nonLeapYearExpiry,
    };

    // 28 days difference, should be expiring soon with 30-day threshold
    expect(willExpireSoon(nonLeapYearEntry, nonLeapYearDate, 30)).toBe(true);
  });

  test('should handle month boundaries correctly', () => {
    // January 31 to March 2 (30 days in February non-leap year)
    const startDate = new Date('2023-01-31');
    const expiryDate = new Date('2023-03-02').toISOString().split('T')[0];

    const entry: AllowlistEntry = {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
      expires: expiryDate,
    };

    // 30 days difference, should be expiring soon with 30-day threshold
    expect(willExpireSoon(entry, startDate, 30)).toBe(true);

    // Should not be expiring soon with 29-day threshold
    expect(willExpireSoon(entry, startDate, 29)).toBe(false);
  });

  test('should return false for entries without expiration date', () => {
    const currentDate = new Date('2023-01-01');

    const entry: AllowlistEntry = {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
      // No expires field
    };

    expect(willExpireSoon(entry, currentDate, 30)).toBe(false);
  });

  test('should return false for entries with invalid expiration date', () => {
    const currentDate = new Date('2023-01-01');

    const entry: AllowlistEntry = {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
      expires: 'not-a-date',
    };

    expect(willExpireSoon(entry, currentDate, 30)).toBe(false);
  });
});
