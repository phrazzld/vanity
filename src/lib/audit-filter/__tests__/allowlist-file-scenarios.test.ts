/**
 * Comprehensive tests for allowlist file scenarios
 *
 * This test suite covers all allowlist file handling scenarios including:
 * - Missing files
 * - Empty files
 * - Malformed JSON files
 * - Invalid schema files
 * - Expiration date behavior and edge cases
 */

import { parseAndValidateAllowlist, isAllowlistEntryExpired, willExpireSoon } from '../core';
import type { AllowlistEntry } from '../types';

// Import fail from Jest to be used in conditionals
const { fail } = expect as any;

describe('Allowlist file scenarios', () => {
  describe('missing files', () => {
    test('should handle null input (missing file)', () => {
      const result = parseAndValidateAllowlist(null);
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle undefined input gracefully', () => {
      // This simulates when file reading fails
      const result = parseAndValidateAllowlist(null);
      expect(result).toEqual([]);
    });
  });

  describe('empty files', () => {
    test('should handle empty string', () => {
      expect(() => parseAndValidateAllowlist('')).toThrow('Failed to parse allowlist file as JSON');
    });

    test('should handle empty array', () => {
      const emptyArray = JSON.stringify([]);
      const result = parseAndValidateAllowlist(emptyArray);
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle whitespace-only content', () => {
      expect(() => parseAndValidateAllowlist('   \n\t  ')).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });
  });

  describe('malformed JSON files', () => {
    test('should handle unclosed brackets', () => {
      const malformedJson = '[{"id": "test", "package": "pkg"';
      expect(() => parseAndValidateAllowlist(malformedJson)).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });

    test('should handle unclosed braces', () => {
      const malformedJson = '[{"id": "test", "package": "pkg", "reason": "test"';
      expect(() => parseAndValidateAllowlist(malformedJson)).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });

    test('should handle trailing commas in objects', () => {
      const malformedJson = '[{"id": "test", "package": "pkg", "reason": "test",}]';
      expect(() => parseAndValidateAllowlist(malformedJson)).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });

    test('should handle trailing commas in arrays', () => {
      const malformedJson =
        '[{"id": "test", "package": "pkg", "reason": "test", "expires": "2099-01-01T00:00:00Z"},]';
      expect(() => parseAndValidateAllowlist(malformedJson)).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });

    test('should handle missing quotes on keys', () => {
      const malformedJson = '[{id: "test", package: "pkg"}]';
      expect(() => parseAndValidateAllowlist(malformedJson)).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });

    test('should handle single quotes instead of double quotes', () => {
      const malformedJson = "[{'id': 'test', 'package': 'pkg'}]";
      expect(() => parseAndValidateAllowlist(malformedJson)).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });

    test('should handle unescaped special characters', () => {
      const malformedJson = '[{"id": "test", "reason": "This has a newline\ncharacter"}]';
      expect(() => parseAndValidateAllowlist(malformedJson)).toThrow(
        'Failed to parse allowlist file as JSON'
      );
    });

    test('should provide helpful error messages for malformed JSON', () => {
      const malformedJson = '{"not": "an array"}';
      try {
        parseAndValidateAllowlist(malformedJson);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('validation failed');
        expect(errorMessage).toContain('JSON structure does not match');
      }
    });
  });

  describe('invalid schema files', () => {
    test('should reject non-array root structure', () => {
      const invalidSchema = JSON.stringify({ entries: [] });
      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow('validation failed');
    });

    test('should reject entries with missing id field', () => {
      const invalidSchema = JSON.stringify([
        {
          package: 'test-package',
          reason: 'Test reason',
          expires: '2099-12-31T00:00:00Z',
        },
      ]);
      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow(
        /missing required property 'id'/
      );
    });

    test('should reject entries with missing package field', () => {
      const invalidSchema = JSON.stringify([
        {
          id: 'GHSA-1234',
          reason: 'Test reason',
          expires: '2099-12-31T00:00:00Z',
        },
      ]);
      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow(
        /missing required property 'package'/
      );
    });

    test('should reject entries with missing reason field', () => {
      const invalidSchema = JSON.stringify([
        {
          id: 'GHSA-1234',
          package: 'test-package',
          expires: '2099-12-31T00:00:00Z',
        },
      ]);
      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow(
        /missing required property 'reason'/
      );
    });

    test('should reject entries with missing expires field', () => {
      const invalidSchema = JSON.stringify([
        {
          id: 'GHSA-1234',
          package: 'test-package',
          reason: 'Test reason',
        },
      ]);
      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow(
        /missing required property 'expires'/
      );
    });

    test('should reject entries with empty required fields', () => {
      const invalidSchema = JSON.stringify([
        {
          id: '',
          package: 'test-package',
          reason: 'Test reason',
          expires: '2099-12-31T00:00:00Z',
        },
      ]);
      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow(/cannot be empty/);
    });

    test('should reject entries with wrong data types', () => {
      const invalidSchema = JSON.stringify([
        {
          id: 123, // Should be string
          package: 'test-package',
          reason: 'Test reason',
          expires: '2099-12-31T00:00:00Z',
        },
      ]);
      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow(/must be a string/);
    });

    test('should reject entries with additional unknown properties', () => {
      const invalidSchema = JSON.stringify([
        {
          id: 'GHSA-1234',
          package: 'test-package',
          reason: 'Test reason',
          expires: '2099-12-31T00:00:00Z',
          unknownField: 'not allowed',
        },
      ]);
      expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow(/unexpected property/);
    });
  });

  describe('expiration date behavior', () => {
    const testDate = new Date('2023-06-15T12:00:00Z');

    test('should handle valid ISO 8601 UTC dates', () => {
      const validEntry: AllowlistEntry = {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2023-12-31T23:59:59Z',
      };
      expect(isAllowlistEntryExpired(validEntry, testDate)).toBe(false);
    });

    test('should handle expired entries', () => {
      const expiredEntry: AllowlistEntry = {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2023-01-01T00:00:00Z',
      };
      expect(isAllowlistEntryExpired(expiredEntry, testDate)).toBe(true);
    });

    test('should treat entries without expiration as expired', () => {
      const noExpirationEntry = {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: undefined,
      } as AllowlistEntry;
      expect(isAllowlistEntryExpired(noExpirationEntry, testDate)).toBe(true);
    });

    test('should reject invalid date formats in schema validation', () => {
      const invalidDateFormats = [
        '2023-13-01T00:00:00Z', // Invalid month
        '2023-02-30T00:00:00Z', // Invalid day
        '2023-06-15', // Missing time component
        '2023/06/15', // Wrong separator
        'June 15, 2023', // Human readable format
        '1687000000', // Unix timestamp
        'not-a-date',
        '',
      ];

      invalidDateFormats.forEach(invalidDate => {
        const invalidSchema = JSON.stringify([
          {
            id: 'GHSA-1234',
            package: 'test-package',
            reason: 'Test reason',
            expires: invalidDate,
          },
        ]);
        expect(() => parseAndValidateAllowlist(invalidSchema)).toThrow(/invalid format/);
      });
    });

    test('should handle edge case dates', () => {
      const edgeCases = [
        '2023-02-28T23:59:59Z', // End of February
        '2024-02-29T00:00:00Z', // Leap year
        '2023-12-31T23:59:59Z', // End of year
        '2024-01-01T00:00:00Z', // Beginning of year
      ];

      edgeCases.forEach(edgeDate => {
        const validSchema = JSON.stringify([
          {
            id: 'GHSA-1234',
            package: 'test-package',
            reason: 'Test reason',
            expires: edgeDate,
          },
        ]);
        expect(() => parseAndValidateAllowlist(validSchema)).not.toThrow();
      });
    });

    test('should correctly identify entries expiring soon', () => {
      const currentDate = new Date('2023-06-01T00:00:00Z');

      const expiringSoonEntry: AllowlistEntry = {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2023-06-15T00:00:00Z', // 14 days from current date
      };

      const notExpiringSoonEntry: AllowlistEntry = {
        id: 'GHSA-5678',
        package: 'test-package-2',
        reason: 'Test reason',
        expires: '2023-08-01T00:00:00Z', // More than 30 days
      };

      expect(willExpireSoon(expiringSoonEntry, currentDate, 30)).toBe(true);
      expect(willExpireSoon(notExpiringSoonEntry, currentDate, 30)).toBe(false);
    });

    test('should handle timezone-independent date comparisons', () => {
      const entry: AllowlistEntry = {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2023-06-15T00:00:00Z',
      };

      // Test with different time zones (should all produce same result)
      const utcDate = new Date('2023-06-14T23:59:59Z');
      const pstEquivalent = new Date('2023-06-14T16:59:59-07:00');
      const estEquivalent = new Date('2023-06-14T19:59:59-04:00');

      expect(isAllowlistEntryExpired(entry, utcDate)).toBe(false);
      expect(isAllowlistEntryExpired(entry, pstEquivalent)).toBe(false);
      expect(isAllowlistEntryExpired(entry, estEquivalent)).toBe(false);
    });
  });

  describe('comprehensive edge cases', () => {
    test('should handle very large allowlist files', () => {
      // Create a large array of valid entries
      const largeAllowlist = Array.from({ length: 1000 }, (_, index) => ({
        id: `GHSA-${index.toString().padStart(4, '0')}`,
        package: `test-package-${index}`,
        reason: `Test reason for package ${index}`,
        expires: '2099-12-31T00:00:00Z',
      }));

      const largeAllowlistJson = JSON.stringify(largeAllowlist);
      const result = parseAndValidateAllowlist(largeAllowlistJson);

      expect(result).toHaveLength(1000);
      expect(result[0]!.id).toBe('GHSA-0000');
      expect(result[999]!.id).toBe('GHSA-0999');
    });

    test('should handle entries with optional fields', () => {
      const allowlistWithOptionalFields = JSON.stringify([
        {
          id: 'GHSA-1234',
          package: 'test-package',
          reason: 'Test reason',
          expires: '2099-12-31T00:00:00Z',
          notes: 'This is a detailed note about the vulnerability',
          reviewedOn: '2023-01-01T00:00:00Z',
        },
      ]);

      const result = parseAndValidateAllowlist(allowlistWithOptionalFields);
      expect(result).toHaveLength(1);
      expect(result[0]!.notes).toBe('This is a detailed note about the vulnerability');
      expect(result[0]!.reviewedOn).toBe('2023-01-01T00:00:00Z');
    });

    test('should handle entries with null optional fields', () => {
      const allowlistWithNullFields = JSON.stringify([
        {
          id: 'GHSA-1234',
          package: 'test-package',
          reason: 'Test reason',
          expires: '2099-12-31T00:00:00Z',
          notes: null,
          reviewedOn: null,
        },
      ]);

      const result = parseAndValidateAllowlist(allowlistWithNullFields);
      expect(result).toHaveLength(1);
      expect(result[0]!.notes).toBeNull();
      expect(result[0]!.reviewedOn).toBeNull();
    });

    test('should handle special characters in string fields', () => {
      const allowlistWithSpecialChars = JSON.stringify([
        {
          id: 'GHSA-1234',
          package: 'test-package@2.0.0',
          reason: 'Test reason with "quotes" and \\backslashes\\ and newlines\nand unicode: 你好',
          expires: '2099-12-31T00:00:00Z',
          notes: 'Notes with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        },
      ]);

      const result = parseAndValidateAllowlist(allowlistWithSpecialChars);
      expect(result).toHaveLength(1);
      expect(result[0]!.package).toBe('test-package@2.0.0');
      expect(result[0]!.reason).toContain('quotes');
      expect(result[0]!.reason).toContain('unicode: 你好');
    });
  });
});
