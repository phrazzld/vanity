/**
 * Tests for the audit-filter core module
 */

import {
  parseNpmAuditJson,
  parseAndValidateAllowlist,
  isAllowlistEntryExpired,
  willExpireSoon,
  findAllowlistEntry,
  filterVulnerabilities,
  analyzeAuditReport,
} from '../core';
import type { AllowlistEntry, Advisory, NpmAuditResult } from '../types';

// Import fail from Jest to be used in conditionals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { fail } = expect as any;

describe('parseNpmAuditJson', () => {
  test('should correctly parse valid npm audit JSON', () => {
    const validJson = JSON.stringify({
      advisories: {
        '1234': {
          id: 1234,
          module_name: 'test-package',
          severity: 'high',
          title: 'Test Vulnerability',
          url: 'https://example.com/advisory/1234',
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

    const result = parseNpmAuditJson(validJson);
    expect(result).toHaveProperty('advisories');
    expect(result).toHaveProperty('metadata.vulnerabilities');

    // These assertions are safe in the context of this test
    // Verify the advisory exists before accessing its properties
    const advisory = result.advisories['1234'];
    if (advisory) {
      expect(advisory.id).toBe(1234);
      expect(advisory.module_name).toBe('test-package');
    } else {
      fail('Expected advisory with ID 1234 to exist');
    }

    // This is properly typed in the interface
    expect(result.metadata.vulnerabilities.high).toBe(1);
  });

  test('should throw error for invalid JSON', () => {
    const invalidJson = '{not valid json';
    expect(() => parseNpmAuditJson(invalidJson)).toThrow(
      'Failed to parse npm audit output as JSON'
    );
  });

  test('should throw error for missing advisories field', () => {
    const invalidJson = JSON.stringify({ metadata: { vulnerabilities: {} } });
    expect(() => parseNpmAuditJson(invalidJson)).toThrow('missing or invalid advisories field');
  });

  test('should throw error for missing metadata', () => {
    const invalidJson = JSON.stringify({ advisories: {} });
    expect(() => parseNpmAuditJson(invalidJson)).toThrow('missing or invalid metadata field');
  });
});

describe('parseAndValidateAllowlist', () => {
  test('should return empty array for null input', () => {
    const result = parseAndValidateAllowlist(null);
    expect(result).toEqual([]);
  });

  test('should correctly parse valid allowlist JSON', () => {
    const validJson = JSON.stringify([
      {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2099-12-31',
        reviewedOn: '2023-01-01',
      },
    ]);

    const result = parseAndValidateAllowlist(validJson);
    expect(result).toHaveLength(1);

    // Verify the result has the expected entry
    if (result.length > 0) {
      expect(result[0].id).toBe('GHSA-1234');
      expect(result[0].package).toBe('test-package');
      expect(result[0].reason).toBe('Test reason');
      expect(result[0].expires).toBe('2099-12-31');
    } else {
      fail('Expected result to have at least one entry');
    }
  });

  test('should throw error for invalid JSON', () => {
    const invalidJson = '{not valid json';
    expect(() => parseAndValidateAllowlist(invalidJson)).toThrow(
      'Failed to parse allowlist as JSON'
    );
  });

  test('should throw error if allowlist is not an array', () => {
    const invalidJson = JSON.stringify({ item: 'not an array' });
    expect(() => parseAndValidateAllowlist(invalidJson)).toThrow('Allowlist must be an array');
  });

  test('should throw error for missing required fields', () => {
    // Missing id
    const missingId = JSON.stringify([{ package: 'test', reason: 'test', expires: '2099-12-31' }]);
    expect(() => parseAndValidateAllowlist(missingId)).toThrow('must have a non-empty id string');

    // Missing package
    const missingPackage = JSON.stringify([{ id: 'test', reason: 'test', expires: '2099-12-31' }]);
    expect(() => parseAndValidateAllowlist(missingPackage)).toThrow(
      'must have a non-empty package string'
    );

    // Missing reason
    const missingReason = JSON.stringify([{ id: 'test', package: 'test', expires: '2099-12-31' }]);
    expect(() => parseAndValidateAllowlist(missingReason)).toThrow(
      'must have a non-empty reason string'
    );

    // Missing expires
    const missingExpires = JSON.stringify([{ id: 'test', package: 'test', reason: 'test' }]);
    expect(() => parseAndValidateAllowlist(missingExpires)).toThrow(
      'must have a non-empty expires string'
    );

    // Empty expires
    const emptyExpires = JSON.stringify([
      { id: 'test', package: 'test', reason: 'test', expires: '' },
    ]);
    expect(() => parseAndValidateAllowlist(emptyExpires)).toThrow(
      'must have a non-empty expires string'
    );
  });
});

describe('isAllowlistEntryExpired', () => {
  test('should return true if expires is undefined', () => {
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
    };
    expect(isAllowlistEntryExpired(entry, new Date())).toBe(true);
  });

  test('should return true if expires is in the past', () => {
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: '2020-01-01',
    };
    expect(isAllowlistEntryExpired(entry, new Date('2023-01-01'))).toBe(true);
  });

  test('should return false if expires is in the future', () => {
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: '2099-01-01',
    };
    expect(isAllowlistEntryExpired(entry, new Date('2023-01-01'))).toBe(false);
  });

  test('should return true for invalid date format', () => {
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: 'not a date',
    };
    expect(isAllowlistEntryExpired(entry, new Date())).toBe(true);
  });
});

describe('willExpireSoon', () => {
  test('should return false if expires is undefined', () => {
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
    };
    expect(willExpireSoon(entry, new Date(), 30)).toBe(false);
  });

  test('should return false if expires is invalid date', () => {
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: 'not a date',
    };
    expect(willExpireSoon(entry, new Date(), 30)).toBe(false);
  });

  test('should return false if expires is already in the past', () => {
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: '2020-01-01',
    };
    expect(willExpireSoon(entry, new Date('2023-01-01'), 30)).toBe(false);
  });

  test('should return true if expires is within the threshold', () => {
    const currentDate = new Date('2023-01-01');
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: '2023-01-15', // 14 days in the future
    };
    expect(willExpireSoon(entry, currentDate, 30)).toBe(true);
  });

  test('should return false if expires is beyond the threshold', () => {
    const currentDate = new Date('2023-01-01');
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: '2023-02-15', // More than 30 days in the future
    };
    expect(willExpireSoon(entry, currentDate, 30)).toBe(false);
  });
});

describe('findAllowlistEntry', () => {
  const allowlist: AllowlistEntry[] = [
    {
      id: '1234',
      package: 'test-package',
      reason: 'Test reason',
    },
    {
      id: '5678',
      package: 'other-package',
      reason: 'Other reason',
    },
  ];

  test('should find matching entry by id and package name', () => {
    const advisory: Advisory = {
      id: 1234,
      module_name: 'test-package',
      severity: 'high',
      title: 'Test Vulnerability',
      url: 'https://example.com',
      vulnerable_versions: '>=1.0.0',
    };

    const result = findAllowlistEntry(advisory, allowlist);
    expect(result).toBeDefined();

    // Make sure we have a valid result before accessing properties
    if (result) {
      expect(result.id).toBe('1234');
      expect(result.package).toBe('test-package');
    } else {
      // This should never happen due to the expect above, but TypeScript needs this check
      fail('Result should be defined');
    }
  });

  test('should return undefined if package name does not match', () => {
    const advisory: Advisory = {
      id: 1234,
      module_name: 'wrong-package',
      severity: 'high',
      title: 'Test Vulnerability',
      url: 'https://example.com',
      vulnerable_versions: '>=1.0.0',
    };

    const result = findAllowlistEntry(advisory, allowlist);
    expect(result).toBeUndefined();
  });

  test('should return undefined if id does not match', () => {
    const advisory: Advisory = {
      id: 9999,
      module_name: 'test-package',
      severity: 'high',
      title: 'Test Vulnerability',
      url: 'https://example.com',
      vulnerable_versions: '>=1.0.0',
    };

    const result = findAllowlistEntry(advisory, allowlist);
    expect(result).toBeUndefined();
  });
});

describe('filterVulnerabilities', () => {
  const currentDate = new Date('2023-01-01');

  const mockAuditReport: NpmAuditResult = {
    advisories: {
      '1234': {
        id: 1234,
        module_name: 'allowed-package',
        severity: 'high',
        title: 'Allowed Vulnerability',
        url: 'https://example.com/1234',
        vulnerable_versions: '>=1.0.0',
      },
      '5678': {
        id: 5678,
        module_name: 'expired-package',
        severity: 'critical',
        title: 'Expired Vulnerability',
        url: 'https://example.com/5678',
        vulnerable_versions: '>=1.0.0',
      },
      '9012': {
        id: 9012,
        module_name: 'new-package',
        severity: 'high',
        title: 'New Vulnerability',
        url: 'https://example.com/9012',
        vulnerable_versions: '>=1.0.0',
      },
      '3456': {
        id: 3456,
        module_name: 'moderate-package',
        severity: 'moderate',
        title: 'Moderate Vulnerability',
        url: 'https://example.com/3456',
        vulnerable_versions: '>=1.0.0',
      },
      '7890': {
        id: 7890,
        module_name: 'expiring-package',
        severity: 'high',
        title: 'Expiring Vulnerability',
        url: 'https://example.com/7890',
        vulnerable_versions: '>=1.0.0',
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 1,
        high: 3,
        critical: 1,
        total: 5,
      },
    },
  };

  const mockAllowlist: AllowlistEntry[] = [
    {
      id: '1234',
      package: 'allowed-package',
      reason: 'Allowed reason',
      expires: '2099-01-01',
    },
    {
      id: '5678',
      package: 'expired-package',
      reason: 'Expired reason',
      expires: '2022-01-01', // Expired
    },
    {
      id: '7890',
      package: 'expiring-package',
      reason: 'Expiring reason',
      expires: '2023-01-15', // Will expire in 14 days
    },
  ];

  test('should correctly classify vulnerabilities', () => {
    const result = filterVulnerabilities(mockAuditReport, mockAllowlist, currentDate);

    // New vulnerabilities
    expect(result.vulnerabilities).toHaveLength(1);
    if (result.vulnerabilities.length > 0) {
      expect(result.vulnerabilities[0].id).toBe(9012);
      expect(result.vulnerabilities[0].allowlistStatus).toBe('new');
    } else {
      fail('Expected vulnerabilities to have at least one entry');
    }

    // Allowed vulnerabilities
    expect(result.allowedVulnerabilities).toHaveLength(2);
    if (result.allowedVulnerabilities.length > 0) {
      expect(result.allowedVulnerabilities[0].id).toBe(1234);
      expect(result.allowedVulnerabilities[0].allowlistStatus).toBe('allowed');

      if (result.allowedVulnerabilities.length > 1) {
        expect(result.allowedVulnerabilities[1].id).toBe(7890);
      } else {
        fail('Expected allowedVulnerabilities to have at least two entries');
      }
    } else {
      fail('Expected allowedVulnerabilities to have at least one entry');
    }

    // Expired allowlist entries
    expect(result.expiredAllowlistEntries).toHaveLength(1);
    if (result.expiredAllowlistEntries.length > 0) {
      expect(result.expiredAllowlistEntries[0].id).toBe(5678);
      expect(result.expiredAllowlistEntries[0].allowlistStatus).toBe('expired');
    } else {
      fail('Expected expiredAllowlistEntries to have at least one entry');
    }

    // Expiring soon entries
    expect(result.expiringEntries).toHaveLength(1);
    if (result.expiringEntries.length > 0) {
      expect(result.expiringEntries[0].id).toBe(7890);
    } else {
      fail('Expected expiringEntries to have at least one entry');
    }

    // Should be unsuccessful due to new and expired vulnerabilities
    expect(result.isSuccessful).toBe(false);
  });

  test('should ignore moderate and lower severity vulnerabilities', () => {
    const result = filterVulnerabilities(mockAuditReport, mockAllowlist, currentDate);

    // Should not include moderate vulnerability
    const hasModerate = result.vulnerabilities.some(v => v.id === 3456);
    expect(hasModerate).toBe(false);
  });

  test('should be successful when no new or expired vulnerabilities', () => {
    // Make a deep copy to ensure we have a non-null advisory
    const advisory1234 = mockAuditReport.advisories['1234'];
    // Verify advisory exists before using it
    if (!advisory1234) {
      throw new Error('Test setup error: advisories[1234] is undefined');
    }
    const advisoryDeepCopy = { ...advisory1234 };

    // Mock audit with only allowed vulnerability
    const successAuditReport: NpmAuditResult = {
      advisories: {
        '1234': advisoryDeepCopy,
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
    };

    const result = filterVulnerabilities(successAuditReport, mockAllowlist, currentDate);

    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(1);
    expect(result.isSuccessful).toBe(true);
  });
});

describe('analyzeAuditReport', () => {
  const currentDate = new Date('2023-01-01');

  const mockNpmAuditJson = JSON.stringify({
    advisories: {
      '1234': {
        id: 1234,
        module_name: 'allowed-package',
        severity: 'high',
        title: 'Allowed Vulnerability',
        url: 'https://example.com/1234',
        vulnerable_versions: '>=1.0.0',
      },
      '9012': {
        id: 9012,
        module_name: 'new-package',
        severity: 'high',
        title: 'New Vulnerability',
        url: 'https://example.com/9012',
        vulnerable_versions: '>=1.0.0',
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 2,
        critical: 0,
        total: 2,
      },
    },
  });

  const mockAllowlistJson = JSON.stringify([
    {
      id: '1234',
      package: 'allowed-package',
      reason: 'Allowed reason',
      expires: '2099-01-01',
    },
  ]);

  test('should correctly analyze audit report with allowlist', () => {
    const result = analyzeAuditReport(mockNpmAuditJson, mockAllowlistJson, currentDate);

    expect(result.vulnerabilities).toHaveLength(1);
    if (result.vulnerabilities.length > 0) {
      expect(result.vulnerabilities[0].id).toBe(9012);
    } else {
      fail('Expected vulnerabilities to have at least one entry');
    }

    expect(result.allowedVulnerabilities).toHaveLength(1);
    if (result.allowedVulnerabilities.length > 0) {
      expect(result.allowedVulnerabilities[0].id).toBe(1234);
    } else {
      fail('Expected allowedVulnerabilities to have at least one entry');
    }

    expect(result.isSuccessful).toBe(false);
  });

  test('should handle missing allowlist', () => {
    const result = analyzeAuditReport(mockNpmAuditJson, null, currentDate);

    expect(result.vulnerabilities).toHaveLength(2);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.isSuccessful).toBe(false);
  });

  test('should throw error for invalid npm audit JSON', () => {
    expect(() => analyzeAuditReport('not json', mockAllowlistJson, currentDate)).toThrow();
  });

  test('should throw error for invalid allowlist JSON', () => {
    expect(() => analyzeAuditReport(mockNpmAuditJson, 'not json', currentDate)).toThrow();
  });
});
