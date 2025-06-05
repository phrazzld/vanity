/**
 * Tests for the audit-filter core module
 */

import {
  parseNpmAuditJson,
  parseNpmAuditJsonCanonical,
  parseAndValidateAllowlist,
  isAllowlistEntryExpired,
  willExpireSoon,
  findAllowlistEntry,
  filterVulnerabilities,
  analyzeAuditReport,
} from '../core';
import { logger } from '../../logger';
import type { AllowlistEntry, Advisory, NpmAuditResult } from '../types';

// Mock nanoid for consistent correlation IDs
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id'),
}));

// Import fail from Jest to be used in conditionals
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
    expect(() => parseNpmAuditJson(invalidJson)).toThrow(
      'The provided npm audit JSON does not match any supported format'
    );
  });

  test('should throw error for missing metadata', () => {
    const invalidJson = JSON.stringify({ advisories: {} });
    expect(() => parseNpmAuditJson(invalidJson)).toThrow(
      'The provided npm audit JSON does not match any supported format'
    );
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
        expires: '2099-12-31T00:00:00Z',
        reviewedOn: '2023-01-01T00:00:00Z',
      },
    ]);

    const result = parseAndValidateAllowlist(validJson);
    expect(result).toHaveLength(1);

    // Verify the result has the expected entry
    if (result.length > 0) {
      expect(result[0]!.id).toBe('GHSA-1234');
      expect(result[0]!.package).toBe('test-package');
      expect(result[0]!.reason).toBe('Test reason');
      expect(result[0]!.expires).toBe('2099-12-31T00:00:00Z');
    } else {
      fail('Expected result to have at least one entry');
    }
  });

  test('should throw error for invalid JSON', () => {
    const invalidJson = '{not valid json';
    expect(() => parseAndValidateAllowlist(invalidJson)).toThrow(
      'Failed to parse allowlist file as JSON'
    );
  });

  test('should throw descriptive error for malformed JSON with helpful guidance', () => {
    const invalidJson = '{"test": "value",}'; // trailing comma
    try {
      parseAndValidateAllowlist(invalidJson);
      fail('Expected parseAndValidateAllowlist to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      expect(errorMessage).toContain('Failed to parse allowlist file as JSON');
      expect(errorMessage).toContain('invalid JSON syntax');
      expect(errorMessage).toContain('Missing commas between array elements');
      expect(errorMessage).toContain('Trailing commas');
    }
  });

  test('should throw error if allowlist is not an array', () => {
    const invalidJson = JSON.stringify({ item: 'not an array' });
    expect(() => parseAndValidateAllowlist(invalidJson)).toThrow('Allowlist must be an array');
  });

  test('should throw error for missing required fields', () => {
    // Missing id
    const missingId = JSON.stringify([
      { package: 'test', reason: 'test', expires: '2099-12-31T00:00:00Z' },
    ]);
    expect(() => parseAndValidateAllowlist(missingId)).toThrow(/missing required property 'id'/);

    // Missing package
    const missingPackage = JSON.stringify([
      { id: 'test', reason: 'test', expires: '2099-12-31T00:00:00Z' },
    ]);
    expect(() => parseAndValidateAllowlist(missingPackage)).toThrow(
      /missing required property 'package'/
    );

    // Missing reason
    const missingReason = JSON.stringify([
      { id: 'test', package: 'test', expires: '2099-12-31T00:00:00Z' },
    ]);
    expect(() => parseAndValidateAllowlist(missingReason)).toThrow(
      /missing required property 'reason'/
    );

    // Missing expires
    const missingExpires = JSON.stringify([{ id: 'test', package: 'test', reason: 'test' }]);
    expect(() => parseAndValidateAllowlist(missingExpires)).toThrow(
      /missing required property 'expires'/
    );

    // Empty expires
    const emptyExpires = JSON.stringify([
      { id: 'test', package: 'test', reason: 'test', expires: '' },
    ]);
    expect(() => parseAndValidateAllowlist(emptyExpires)).toThrow(/invalid format/);
  });

  test('should throw error for invalid date formats', () => {
    const invalidDate = JSON.stringify([
      { id: 'test', package: 'test', reason: 'test', expires: 'not-a-date' },
    ]);
    expect(() => parseAndValidateAllowlist(invalidDate)).toThrow(/invalid format/);
  });

  test('should throw error for wrong data types', () => {
    const wrongType = JSON.stringify([
      { id: 123, package: 'test', reason: 'test', expires: '2099-12-31T00:00:00Z' },
    ]);
    expect(() => parseAndValidateAllowlist(wrongType)).toThrow(/must be a string/);
  });

  test('should throw error for additional properties', () => {
    const extraProps = JSON.stringify([
      {
        id: 'test',
        package: 'test',
        reason: 'test',
        expires: '2099-12-31T00:00:00Z',
        extraField: 'value',
      },
    ]);
    expect(() => parseAndValidateAllowlist(extraProps)).toThrow(/unexpected property/);
  });

  test('should throw error for empty string fields', () => {
    // Test empty string for non-date field (should trigger minLength error)
    const emptyId = JSON.stringify([
      { id: '', package: 'test', reason: 'test', expires: '2099-12-31T00:00:00Z' },
    ]);
    expect(() => parseAndValidateAllowlist(emptyId)).toThrow(/cannot be empty/);
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
      expires: '2020-01-01T00:00:00Z',
    };
    expect(isAllowlistEntryExpired(entry, new Date('2023-01-01'))).toBe(true);
  });

  test('should return false if expires is in the future', () => {
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: '2099-01-01T00:00:00Z',
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
      expires: '2020-01-01T00:00:00Z',
    };
    expect(willExpireSoon(entry, new Date('2023-01-01'), 30)).toBe(false);
  });

  test('should return true if expires is within the threshold', () => {
    const currentDate = new Date('2023-01-01');
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: '2023-01-15T00:00:00Z', // 14 days in the future
    };
    expect(willExpireSoon(entry, currentDate, 30)).toBe(true);
  });

  test('should return false if expires is beyond the threshold', () => {
    const currentDate = new Date('2023-01-01');
    const entry: AllowlistEntry = {
      id: 'test',
      package: 'test',
      reason: 'test',
      expires: '2023-02-15T00:00:00Z', // More than 30 days in the future
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
      expires: '2099-01-01T00:00:00Z',
    },
    {
      id: '5678',
      package: 'expired-package',
      reason: 'Expired reason',
      expires: '2022-01-01T00:00:00Z', // Expired
    },
    {
      id: '7890',
      package: 'expiring-package',
      reason: 'Expiring reason',
      expires: '2023-01-15T00:00:00Z', // Will expire in 14 days
    },
  ];

  test('should correctly classify vulnerabilities', () => {
    const result = filterVulnerabilities(mockAuditReport, mockAllowlist, currentDate);

    // New vulnerabilities
    expect(result.vulnerabilities).toHaveLength(1);
    if (result.vulnerabilities.length > 0) {
      expect(result.vulnerabilities[0]!.id).toBe('9012'); // String now due to canonical format
      expect(result.vulnerabilities[0]!.allowlistStatus).toBe('new');
    } else {
      fail('Expected vulnerabilities to have at least one entry');
    }

    // Allowed vulnerabilities
    expect(result.allowedVulnerabilities).toHaveLength(2);
    if (result.allowedVulnerabilities.length > 0) {
      expect(result.allowedVulnerabilities[0]!.id).toBe('1234'); // String now due to canonical format
      expect(result.allowedVulnerabilities[0]!.allowlistStatus).toBe('allowed');

      if (result.allowedVulnerabilities.length > 1) {
        expect(result.allowedVulnerabilities[1]!.id).toBe('7890'); // String now due to canonical format
      } else {
        fail('Expected allowedVulnerabilities to have at least two entries');
      }
    } else {
      fail('Expected allowedVulnerabilities to have at least one entry');
    }

    // Expired allowlist entries
    expect(result.expiredAllowlistEntries).toHaveLength(1);
    if (result.expiredAllowlistEntries.length > 0) {
      expect(result.expiredAllowlistEntries[0]!.id).toBe('5678'); // String now due to canonical format
      expect(result.expiredAllowlistEntries[0]!.allowlistStatus).toBe('expired');
    } else {
      fail('Expected expiredAllowlistEntries to have at least one entry');
    }

    // Expiring soon entries
    expect(result.expiringEntries).toHaveLength(1);
    if (result.expiringEntries.length > 0) {
      expect(result.expiringEntries[0]!.id).toBe('7890'); // String now due to canonical format
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
      expires: '2099-01-01T00:00:00Z',
    },
  ]);

  test('should correctly analyze audit report with allowlist', () => {
    const result = analyzeAuditReport(mockNpmAuditJson, mockAllowlistJson, currentDate);

    expect(result.vulnerabilities).toHaveLength(1);
    if (result.vulnerabilities.length > 0) {
      expect(result.vulnerabilities[0]!.id).toBe('9012'); // String now due to canonical format
    } else {
      fail('Expected vulnerabilities to have at least one entry');
    }

    expect(result.allowedVulnerabilities).toHaveLength(1);
    if (result.allowedVulnerabilities.length > 0) {
      expect(result.allowedVulnerabilities[0]!.id).toBe('1234'); // String now due to canonical format
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

describe('Structured Error Logging', () => {
  let loggerErrorSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();
    loggerDebugSpy = jest.spyOn(logger, 'debug').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
    loggerDebugSpy.mockRestore();
  });

  describe('parseNpmAuditJsonCanonical error logging', () => {
    test('should log structured error for JSON parse failure', () => {
      const invalidJson = '{ invalid json }';

      expect(() => parseNpmAuditJsonCanonical(invalidJson)).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to parse npm audit output as JSON',
        expect.objectContaining({
          function_name: 'parseNpmAuditJsonCanonical',
          module_name: 'audit-filter/core',
          error_type: 'JSON_PARSE_ERROR',
          input_length: invalidJson.length,
          input_source: 'npm_audit_output',
        }),
        expect.any(Error)
      );
    });

    test('should log structured error for unsupported audit format', () => {
      const _unsupportedFormat = JSON.stringify({
        unknown_structure: {
          some_field: 'some_value',
        },
      });

      expect(() => parseNpmAuditJsonCanonical(_unsupportedFormat)).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Unsupported npm audit format detected',
        expect.objectContaining({
          function_name: 'parseNpmAuditJsonCanonical',
          module_name: 'audit-filter/core',
          error_type: 'UNSUPPORTED_FORMAT',
          input_length: _unsupportedFormat.length,
          has_advisories: false,
          has_vulnerabilities: false,
        }),
        expect.any(Error)
      );
    });

    test('should log structured error for invalid object type', () => {
      const _arrayInput = JSON.stringify([1, 2, 3]);

      expect(() => parseNpmAuditJsonCanonical(_arrayInput)).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Invalid npm audit output structure',
        expect.objectContaining({
          function_name: 'parseNpmAuditJsonCanonical',
          module_name: 'audit-filter/core',
          error_type: 'INVALID_STRUCTURE',
          input_type: 'array',
          expected_type: 'object',
        }),
        expect.any(Error)
      );
    });

    test('should log debug information for successful parsing', () => {
      const validJson = JSON.stringify({
        vulnerabilities: {},
        metadata: {
          vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
        },
      });

      parseNpmAuditJsonCanonical(validJson);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Parsing npm audit JSON output',
        expect.objectContaining({
          function_name: 'parseNpmAuditJsonCanonical',
          module_name: 'audit-filter/core',
          input_length: validJson.length,
        })
      );
    });
  });

  describe('parseAndValidateAllowlist error logging', () => {
    test('should log structured error for JSON parse failure', () => {
      const invalidJson = '{ invalid allowlist json }';

      expect(() => parseAndValidateAllowlist(invalidJson)).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to parse allowlist file as JSON',
        expect.objectContaining({
          function_name: 'parseAndValidateAllowlist',
          module_name: 'audit-filter/core',
          error_type: 'JSON_PARSE_ERROR',
          input_length: invalidJson.length,
          input_source: 'allowlist_file',
        }),
        expect.any(Error)
      );
    });

    test('should log structured error for schema validation failure', () => {
      const invalidSchema = JSON.stringify([
        { id: 'test', package: 'test' }, // Missing required fields
      ]);

      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Allowlist validation failed',
        expect.objectContaining({
          function_name: 'parseAndValidateAllowlist',
          module_name: 'audit-filter/core',
          error_type: 'SCHEMA_VALIDATION_ERROR',
          validation_errors_count: expect.any(Number),
          entry_count: 1,
        }),
        expect.any(Error)
      );
    });

    test('should log debug information for successful parsing', () => {
      const validAllowlist = JSON.stringify([
        {
          id: 'test-id',
          package: 'test-package',
          reason: 'test reason',
          expires: '2099-12-31T00:00:00Z',
        },
      ]);

      parseAndValidateAllowlist(validAllowlist);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Parsing and validating allowlist file',
        expect.objectContaining({
          function_name: 'parseAndValidateAllowlist',
          module_name: 'audit-filter/core',
          input_length: validAllowlist.length,
        })
      );
    });

    test('should log debug for null allowlist (no file)', () => {
      const result = parseAndValidateAllowlist(null);

      expect(result).toEqual([]);
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'No allowlist file provided, using empty allowlist',
        expect.objectContaining({
          function_name: 'parseAndValidateAllowlist',
          module_name: 'audit-filter/core',
        })
      );
    });
  });

  describe('sensitive data protection', () => {
    test('should not log sensitive file contents in error logs', () => {
      const sensitiveContent = '{ "secret": "api-key-12345", "password": "secret123" }';

      expect(() => parseNpmAuditJsonCanonical(sensitiveContent)).toThrow();

      // Verify that the actual content is not logged
      const logCall = loggerErrorSpy.mock.calls[0];
      const logMessage = logCall[0];
      const logContext = logCall[1];

      expect(logMessage).not.toContain('api-key-12345');
      expect(logMessage).not.toContain('secret123');
      expect(JSON.stringify(logContext)).not.toContain('api-key-12345');
      expect(JSON.stringify(logContext)).not.toContain('secret123');
    });
  });

  describe('context consistency', () => {
    test('should include all mandatory context fields in error logs', () => {
      const invalidJson = '{ invalid }';

      expect(() => parseNpmAuditJsonCanonical(invalidJson)).toThrow();

      const logContext = loggerErrorSpy.mock.calls[0][1];

      // Verify all mandatory fields are present
      expect(logContext).toHaveProperty('function_name');
      expect(logContext).toHaveProperty('module_name');
      expect(logContext).toHaveProperty('error_type');
      expect(logContext.function_name).toBe('parseNpmAuditJsonCanonical');
      expect(logContext.module_name).toBe('audit-filter/core');
    });
  });
});
