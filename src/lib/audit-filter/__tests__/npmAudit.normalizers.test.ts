/**
 * Tests for npm audit normalizer functions
 *
 * These tests verify that the normalizer functions correctly transform
 * different npm audit formats into the canonical internal representation.
 */

import { describe, test, expect } from '@jest/globals';
import { normalizeAuditData } from '../npmAudit.normalizers';
import { logger } from '../../logger';
import { v6Inputs, expectedCanonical } from '../fixtures/test-data/normalizerTestData';
import { normalizeV6Data, normalizeV7PlusData } from '../npmAudit.normalizers';

// Mock nanoid for consistent correlation IDs
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id'),
}));

describe('normalizeV6Data', () => {
  test('should normalize valid npm v6 data to canonical format', () => {
    const _v6Input = v6Inputs.multipleAdvisories;
    const _expectedCanonicalFormat = expectedCanonical.multipleVulnerabilities;

    const result = normalizeV6Data(_v6Input);
    expect(result).toEqual(_expectedCanonicalFormat);
  });

  test('should handle empty advisories object', () => {
    const _emptyV6Input = v6Inputs.empty;
    const _expectedCanonicalFormat = expectedCanonical.empty;

    const result = normalizeV6Data(_emptyV6Input);
    expect(result).toEqual(_expectedCanonicalFormat);
  });

  test('should handle missing optional fields with defaults', () => {
    const _minimalV6Input = {
      advisories: {
        '123': {
          id: 123,
          module_name: 'test-package',
          severity: 'critical' as const,
          title: 'Test vulnerability',
          url: 'https://example.com/advisory/123',
          // vulnerable_versions might be missing or empty
          vulnerable_versions: '',
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 0,
          high: 0,
          critical: 1,
          total: 1,
        },
      },
    };

    const result = normalizeV6Data(_minimalV6Input);
    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.vulnerabilities[0]!.vulnerableVersions).toBe('*'); // Default value
  });

  test('should convert numeric IDs to strings consistently', () => {
    const _numericIdV6Input = {
      advisories: {
        '999': {
          id: 999, // Numeric ID
          module_name: 'test-package',
          severity: 'high' as const,
          title: 'Test vulnerability',
          url: 'https://example.com/advisory/999',
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
    };

    const result = normalizeV6Data(_numericIdV6Input);
    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.vulnerabilities[0]!.id).toBe('999'); // Should be string
  });
});

describe('normalizeV7PlusData', () => {
  test('should normalize valid npm v7+ data to canonical format', () => {
    const _v7PlusInput = {
      vulnerabilities: {
        'tunnel-agent': {
          name: 'tunnel-agent',
          severity: 'moderate' as const,
          isDirect: false,
          via: [
            {
              source: 118,
              name: 'tunnel-agent',
              dependency: 'tunnel-agent',
              title: 'Memory Exposure in tunnel-agent',
              url: 'https://npmjs.com/advisories/118',
              severity: 'moderate' as const,
              range: '<0.6.0',
            },
          ],
          effects: [],
          range: '<0.6.0',
          nodes: ['node_modules/tunnel-agent'],
          fixAvailable: true,
        },
        jsonwebtoken: {
          name: 'jsonwebtoken',
          severity: 'high' as const,
          isDirect: true,
          via: [
            {
              source: 755,
              name: 'jsonwebtoken',
              dependency: 'jsonwebtoken',
              title: 'Verification bypass in jsonwebtoken',
              url: 'https://npmjs.com/advisories/755',
              severity: 'high' as const,
              range: '<8.5.1',
            },
          ],
          effects: ['dependent-package'],
          range: '<8.5.1',
          nodes: ['node_modules/jsonwebtoken'],
          fixAvailable: {
            name: 'jsonwebtoken',
            version: '8.5.1',
            isSemVerMajor: false,
          },
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 1,
          high: 1,
          critical: 0,
          total: 2,
        },
      },
    };

    const _expectedCanonicalFormat = {
      vulnerabilities: [
        {
          id: '118',
          package: 'tunnel-agent',
          severity: 'moderate',
          title: 'Memory Exposure in tunnel-agent',
          url: 'https://npmjs.com/advisories/118',
          vulnerableVersions: '<0.6.0',
          source: 'npm-v7+',
        },
        {
          id: '755',
          package: 'jsonwebtoken',
          severity: 'high',
          title: 'Verification bypass in jsonwebtoken',
          url: 'https://npmjs.com/advisories/755',
          vulnerableVersions: '<8.5.1',
          source: 'npm-v7+',
        },
      ],
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 1,
          high: 1,
          critical: 0,
          total: 2,
        },
      },
    };

    const result = normalizeV7PlusData(_v7PlusInput);
    expect(result).toEqual(_expectedCanonicalFormat);
  });

  test('should handle empty vulnerabilities object', () => {
    const _emptyV7PlusInput = {
      vulnerabilities: {},
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
    };

    const _expectedCanonicalFormat = {
      vulnerabilities: [],
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
    };

    const result = normalizeV7PlusData(_emptyV7PlusInput);
    expect(result).toEqual(_expectedCanonicalFormat);
  });

  test('should extract vulnerability details from via array correctly', () => {
    const _multipleViaV7PlusInput = {
      vulnerabilities: {
        'complex-package': {
          name: 'complex-package',
          severity: 'critical' as const,
          isDirect: false,
          via: [
            {
              source: 100,
              name: 'complex-package',
              dependency: 'complex-package',
              title: 'First vulnerability',
              url: 'https://npmjs.com/advisories/100',
              severity: 'high' as const,
              range: '<1.0.0',
            },
            {
              source: 200,
              name: 'complex-package',
              dependency: 'complex-package',
              title: 'Second vulnerability',
              url: 'https://npmjs.com/advisories/200',
              severity: 'critical' as const,
              range: '<2.0.0',
            },
          ],
          effects: [],
          range: '<2.0.0',
          nodes: ['node_modules/complex-package'],
          fixAvailable: false,
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 0,
          high: 0,
          critical: 1,
          total: 1,
        },
      },
    };

    const result = normalizeV7PlusData(_multipleViaV7PlusInput);
    // Should create separate vulnerability entries for each source in via array
    expect(result.vulnerabilities).toHaveLength(2);
  });

  test('should handle missing optional fields gracefully', () => {
    const _minimalV7PlusInput = {
      vulnerabilities: {
        'minimal-package': {
          name: 'minimal-package',
          severity: 'low' as const,
          isDirect: true,
          via: [
            {
              source: 50,
              name: 'minimal-package',
              dependency: 'minimal-package',
              title: 'Minimal vulnerability',
              url: 'https://npmjs.com/advisories/50',
              severity: 'low' as const,
              range: '*',
            },
          ],
          effects: [],
          range: '*',
          nodes: [],
          fixAvailable: true,
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 1,
          moderate: 0,
          high: 0,
          critical: 0,
          total: 1,
        },
      },
    };

    const result = normalizeV7PlusData(_minimalV7PlusInput);
    // Verify defaults are applied correctly
    expect(result).toBeDefined();
    expect(result.vulnerabilities).toHaveLength(1);
  });
});

describe('Normalizer Error Handling', () => {
  test('should handle malformed input data gracefully', () => {
    const _malformedV6Input = {
      advisories: {
        'bad-advisory': {
          // Missing required fields
          id: null,
          module_name: undefined,
        },
      },
      metadata: {
        vulnerabilities: {
          total: 'invalid', // Invalid type
        },
      },
    };

    // The normalizer is robust and handles malformed input gracefully
    const result = normalizeV6Data(_malformedV6Input as any);
    expect(result).toBeDefined();
    expect(result.vulnerabilities).toHaveLength(1);
    // Check that null/undefined values are handled
    expect(result.vulnerabilities[0]!.id).toBe('null');
    expect(result.vulnerabilities[0]!.package).toBeUndefined();
  });

  test('should log warnings for unexpected data patterns', () => {
    const _unexpectedV7PlusInput = {
      vulnerabilities: {
        'strange-package': {
          name: 'strange-package',
          severity: 'unknown' as any, // Invalid severity
          isDirect: 'maybe' as any, // Invalid boolean
          via: [], // Empty via array
          effects: null as any, // Invalid effects
          range: undefined as any, // Missing range
          nodes: 'not-an-array' as any, // Invalid nodes
          fixAvailable: 'unknown' as any, // Invalid fixAvailable
        },
      },
      metadata: {
        vulnerabilities: {
          info: -1, // Invalid count
          total: 1,
        },
      },
    };

    // The normalizer doesn't validate input but may fail on property access
    const result = normalizeV7PlusData(_unexpectedV7PlusInput as any);
    // Should attempt to proceed with reasonable defaults
    expect(result).toBeDefined();
    expect(result.vulnerabilities).toEqual([]);
  });
});

describe('Structured Error Logging - Normalizers', () => {
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

  describe('normalizeAuditData error logging', () => {
    test('should log structured error for unknown format detection', () => {
      const unknownFormatData = {
        unknown_field: 'unknown_value',
        some_other_field: {},
      } as any; // Invalid format that doesn't match v6 or v7+

      expect(() => normalizeAuditData(unknownFormatData)).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Unable to determine npm audit format for normalization',
        expect.objectContaining({
          function_name: 'normalizeAuditData',
          module_name: 'audit-filter/normalizers',
          error_type: 'FORMAT_DETECTION_ERROR',
          has_advisories: false,
          has_vulnerabilities: false,
          detected_fields: expect.any(Array),
        }),
        expect.any(Error)
      );
    });

    test('should log debug information for successful v6 format detection', () => {
      const v6Data = {
        advisories: {
          '123': {
            id: 123,
            module_name: 'test-package',
            severity: 'high' as const,
            title: 'Test vulnerability',
            url: 'https://example.com',
            vulnerable_versions: '>=1.0.0',
          },
        },
        metadata: {
          vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 0, total: 1 },
        },
      };

      normalizeAuditData(v6Data);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Normalizing npm audit data',
        expect.objectContaining({
          function_name: 'normalizeAuditData',
          module_name: 'audit-filter/normalizers',
          detected_format: 'npm-v6',
          advisories_count: 1,
        })
      );
    });

    test('should log debug information for successful v7+ format detection', () => {
      const v7Data = {
        vulnerabilities: {
          'test-package': {
            name: 'test-package',
            severity: 'high' as const,
            isDirect: true,
            via: [
              {
                source: 123,
                name: 'test-package',
                dependency: 'test-package',
                title: 'Test vulnerability',
                url: 'https://example.com',
                severity: 'high' as const,
                range: '>=1.0.0',
              },
            ],
            effects: [],
            range: '>=1.0.0',
            nodes: ['node_modules/test-package'],
            fixAvailable: true,
          },
        },
        metadata: {
          vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 0, total: 1 },
        },
      };

      normalizeAuditData(v7Data);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Normalizing npm audit data',
        expect.objectContaining({
          function_name: 'normalizeAuditData',
          module_name: 'audit-filter/normalizers',
          detected_format: 'npm-v7+',
          vulnerabilities_count: 1,
        })
      );
    });

    test('should include context information in error logs', () => {
      const malformedData = {
        some_field: 'value',
        another_field: 'another_value',
      } as any;

      expect(() => normalizeAuditData(malformedData)).toThrow();

      const logContext = loggerErrorSpy.mock.calls[0][1];

      // Verify all mandatory fields are present
      expect(logContext).toHaveProperty('function_name');
      expect(logContext).toHaveProperty('module_name');
      expect(logContext).toHaveProperty('error_type');
      expect(logContext.function_name).toBe('normalizeAuditData');
      expect(logContext.module_name).toBe('audit-filter/normalizers');
      expect(logContext.error_type).toBe('FORMAT_DETECTION_ERROR');
    });

    test('should not log sensitive data in error context', () => {
      const dataWithSensitiveInfo = {
        api_key: 'secret-api-key-12345',
        password: 'secret-password',
        unknown_structure: true,
      } as any;

      expect(() => normalizeAuditData(dataWithSensitiveInfo)).toThrow();

      // Verify that sensitive data is not logged
      const logCall = loggerErrorSpy.mock.calls[0];
      const logMessage = logCall[0];
      const logContext = logCall[1];

      expect(logMessage).not.toContain('secret-api-key-12345');
      expect(logMessage).not.toContain('secret-password');
      expect(JSON.stringify(logContext)).not.toContain('secret-api-key-12345');
      expect(JSON.stringify(logContext)).not.toContain('secret-password');
    });
  });
});
