/**
 * Tests for allowlist schema definition
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { allowlistSchema } from '../allowlist.schema';
import type { AllowlistEntry } from '../types';

describe('allowlistSchema', () => {
  let ajv: Ajv;
  let validateAllowlist: (data: unknown) => data is AllowlistEntry[];

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    validateAllowlist = ajv.compile<AllowlistEntry[]>(allowlistSchema);
  });

  test('should validate valid allowlist with all fields', () => {
    const validAllowlist = [
      {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2099-12-31T00:00:00Z',
        notes: 'Optional notes',
        reviewedOn: '2023-01-01T00:00:00Z',
      },
    ];

    expect(validateAllowlist(validAllowlist)).toBe(true);
    expect(validateAllowlist.errors).toBeNull();
  });

  test('should validate valid allowlist with only required fields', () => {
    const validAllowlist = [
      {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2099-12-31T00:00:00Z',
      },
    ];

    expect(validateAllowlist(validAllowlist)).toBe(true);
    expect(validateAllowlist.errors).toBeNull();
  });

  test('should validate empty allowlist array', () => {
    const emptyAllowlist: AllowlistEntry[] = [];

    expect(validateAllowlist(emptyAllowlist)).toBe(true);
    expect(validateAllowlist.errors).toBeNull();
  });

  test('should reject non-array input', () => {
    const notArray = { item: 'not an array' };

    expect(validateAllowlist(notArray)).toBe(false);
    expect(validateAllowlist.errors).not.toBeNull();
    expect(validateAllowlist.errors?.[0]?.message).toContain('must be array');
  });

  test('should reject entries missing required fields', () => {
    const missingFields = [
      {
        package: 'test-package',
        reason: 'Test reason',
        expires: '2099-12-31T23:59:59.000Z',
        // Missing id
      },
    ];

    expect(validateAllowlist(missingFields)).toBe(false);
    expect(validateAllowlist.errors).not.toBeNull();
    expect(validateAllowlist.errors?.[0]?.message).toContain("must have required property 'id'");
  });

  test('should reject entries with empty required fields', () => {
    const emptyFields = [
      {
        id: '',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2099-12-31T00:00:00Z',
      },
    ];

    expect(validateAllowlist(emptyFields)).toBe(false);
    expect(validateAllowlist.errors).not.toBeNull();
    expect(validateAllowlist.errors?.[0]?.message).toContain(
      'must NOT have fewer than 1 characters'
    );
  });

  test('should reject entries with invalid date formats', () => {
    const invalidDate = [
      {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: 'not-a-date',
      },
    ];

    expect(validateAllowlist(invalidDate)).toBe(false);
    expect(validateAllowlist.errors).not.toBeNull();
    expect(validateAllowlist.errors?.[0]?.message).toContain('must match format "date-time"');
  });

  test('should reject entries with wrong data types', () => {
    const wrongTypes = [
      {
        id: 123, // Should be string
        package: 'test-package',
        reason: 'Test reason',
        expires: '2099-12-31T00:00:00Z',
      },
    ];

    expect(validateAllowlist(wrongTypes)).toBe(false);
    expect(validateAllowlist.errors).not.toBeNull();
    expect(validateAllowlist.errors?.[0]?.message).toContain('must be string');
  });

  test('should reject entries with additional properties', () => {
    const extraProperties = [
      {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2099-12-31T00:00:00Z',
        extraField: 'not allowed', // Should be rejected
      },
    ];

    expect(validateAllowlist(extraProperties)).toBe(false);
    expect(validateAllowlist.errors).not.toBeNull();
    expect(validateAllowlist.errors?.[0]?.message).toContain('must NOT have additional properties');
  });

  test('should allow null optional fields', () => {
    const nullOptionals = [
      {
        id: 'GHSA-1234',
        package: 'test-package',
        reason: 'Test reason',
        expires: '2099-12-31T00:00:00Z',
        notes: null,
        reviewedOn: null,
      },
    ];

    expect(validateAllowlist(nullOptionals)).toBe(true);
    expect(validateAllowlist.errors).toBeNull();
  });
});
