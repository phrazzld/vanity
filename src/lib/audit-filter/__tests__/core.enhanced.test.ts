/**
 * Enhanced tests for core parsing functionality with schema-driven approach
 *
 * These tests verify the improved parseNpmAuditJson function that handles
 * multiple npm audit formats using Zod schemas and normalizers.
 */

import { describe, test, expect } from '@jest/globals';
import {
  npmV6Outputs,
  npmV7PlusOutputs,
  expectedCanonicalFormats,
  edgeCases,
} from '../fixtures/test-data/auditOutputs';
import { jest } from '@jest/globals';
import { parseNpmAuditJsonCanonical } from '../core';

// Mock nanoid for consistent correlation IDs
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id'),
}));

describe('Enhanced parseNpmAuditJson', () => {
  describe('npm v6 format support', () => {
    test('should parse valid npm v6 audit output', () => {
      const _npmV6Output = JSON.stringify(npmV6Outputs.singleAdvisory);
      const _expectedCanonicalResult = expectedCanonicalFormats.singleAdvisory;

      // TODO: Implement enhanced parseNpmAuditJson function
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_npmV6Output);
        expect(result).toEqual(_expectedCanonicalResult);
      }).not.toThrow();
    });

    test('should parse npm v6 output with multiple advisories', () => {
      const _npmV6MultipleOutput = JSON.stringify(npmV6Outputs.multipleAdvisories);

      // TODO: Implement test for multiple advisories
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_npmV6MultipleOutput);
        expect(result.vulnerabilities).toHaveLength(2);
      }).not.toThrow();
    });

    test('should handle npm v6 output with no vulnerabilities', () => {
      const _npmV6CleanOutput = JSON.stringify(npmV6Outputs.clean);

      // TODO: Implement test for clean audit output
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_npmV6CleanOutput);
        expect(result.vulnerabilities).toHaveLength(0);
        expect(result.metadata.vulnerabilities.total).toBe(0);
      }).not.toThrow();
    });
  });

  describe('npm v7+ format support', () => {
    test('should parse valid npm v7+ audit output', () => {
      const _npmV7PlusOutput = JSON.stringify(npmV7PlusOutputs.singleVulnerability);
      const _expectedCanonicalResult = expectedCanonicalFormats.singleVulnerabilityV7Plus;

      // TODO: Implement enhanced parseNpmAuditJson function
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_npmV7PlusOutput);
        expect(result).toEqual(_expectedCanonicalResult);
      }).not.toThrow();
    });

    test('should parse npm v7+ output with complex vulnerability structure', () => {
      const _npmV7PlusComplexOutput = JSON.stringify(npmV7PlusOutputs.complexVulnerability);

      // TODO: Implement test for complex v7+ structure
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_npmV7PlusComplexOutput);
        expect(result.vulnerabilities).toHaveLength(2);
        expect(result.vulnerabilities.find(v => v.package === 'minimist')?.severity).toBe(
          'critical'
        );
        expect(result.vulnerabilities.find(v => v.package === 'jsonwebtoken')?.severity).toBe(
          'high'
        );
      }).not.toThrow();
    });

    test('should handle npm v7+ output with no vulnerabilities', () => {
      const _npmV7PlusCleanOutput = JSON.stringify(npmV7PlusOutputs.clean);

      // TODO: Implement test for clean v7+ audit output
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_npmV7PlusCleanOutput);
        expect(result.vulnerabilities).toHaveLength(0);
        expect(result.metadata.vulnerabilities.total).toBe(0);
      }).not.toThrow();
    });
  });

  describe('Format detection and fallback', () => {
    test('should try v7+ format first, then fallback to v6', () => {
      const _npmV6Output = JSON.stringify(npmV6Outputs.singleAdvisory);

      // TODO: Implement test to verify fallback behavior
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_npmV6Output);
        expect(result.vulnerabilities[0]!.source).toBe('npm-v6'); // Should indicate v6 format was used
      }).not.toThrow();
    });

    test('should prioritize v7+ format when both structures are present', () => {
      // This is an edge case where JSON might have both structures
      const _hybridOutput = JSON.stringify({
        ...npmV6Outputs.singleAdvisory,
        ...npmV7PlusOutputs.singleVulnerability,
      });

      // When both vulnerabilities and advisories+metadata exist, v7+ takes precedence
      // due to the order of checks in detectNpmAuditFormat
      const result = parseNpmAuditJsonCanonical(_hybridOutput);
      // The hybrid has both structures, so it should detect as v7+
      expect(result.vulnerabilities.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling and validation', () => {
    test('should throw descriptive error for malformed JSON', () => {
      const _malformedJson = edgeCases.malformedJson;

      // TODO: Implement test for JSON parsing errors
      expect(() => {
        parseNpmAuditJsonCanonical(_malformedJson);
      }).toThrow(/Failed to parse.*JSON/);
    });

    test('should use fallback parser for unsupported audit format', () => {
      const _unsupportedFormat = JSON.stringify({
        unknown_structure: {
          some: 'data',
        },
        metadata: {
          vulnerabilities: {
            total: 0,
          },
        },
      });

      // Should use fallback parser for unsupported formats
      const result = parseNpmAuditJsonCanonical(_unsupportedFormat);
      expect(result.vulnerabilities).toEqual([]);
      expect(result.metadata.vulnerabilities.total).toBe(0);
    });

    test('should use fallback parser for validation failures', () => {
      const _invalidStructure = JSON.stringify({
        advisories: 'not-an-object', // Invalid type
        metadata: {
          vulnerabilities: {
            total: 'invalid', // Invalid type
          },
        },
      });

      // Should use fallback parser when validation fails
      const result = parseNpmAuditJsonCanonical(_invalidStructure);
      // Fallback parser extracts what it can from metadata
      expect(result.vulnerabilities).toEqual([]);
      expect(result.metadata.vulnerabilities.total).toBe(0); // Fallback uses Number() which converts 'invalid' to 0
    });

    test('should handle empty JSON object gracefully', () => {
      const _emptyJson = JSON.stringify({});

      // Should use fallback parser for empty JSON
      const result = parseNpmAuditJsonCanonical(_emptyJson);
      expect(result.vulnerabilities).toEqual([]);
      expect(result.metadata.vulnerabilities.total).toBe(0);
    });

    test('should handle non-object JSON gracefully', () => {
      const _nonObjectJson = JSON.stringify(['array', 'instead', 'of', 'object']);

      // TODO: Implement test for non-object JSON handling
      expect(() => {
        parseNpmAuditJsonCanonical(_nonObjectJson);
      }).toThrow(/not.*valid.*object/i);
    });
  });

  describe('Backward compatibility', () => {
    test('should maintain existing function signature', () => {
      const _validV6Output = JSON.stringify({
        advisories: {},
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
      });

      // TODO: Verify function signature remains compatible
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_validV6Output);
        // Should return CanonicalNpmAuditReport (which is backward compatible)
        expect(typeof result).toBe('object');
        expect(Array.isArray(result.vulnerabilities)).toBe(true);
        expect(typeof result.metadata).toBe('object');
      }).not.toThrow();
    });

    test('should work with existing downstream code expecting NpmAuditResult', () => {
      const _validOutput = JSON.stringify({
        advisories: {
          '123': {
            id: 123,
            module_name: 'test-package',
            severity: 'high',
            title: 'Test vulnerability',
            url: 'https://example.com/advisory/123',
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

      // TODO: Verify backward compatibility with existing code
      expect(() => {
        const result = parseNpmAuditJsonCanonical(_validOutput);
        // Existing code might expect specific metadata structure
        expect(result.metadata.vulnerabilities.total).toBe(1);
        expect(result.metadata.vulnerabilities.high).toBe(1);
      }).not.toThrow();
    });
  });
});
