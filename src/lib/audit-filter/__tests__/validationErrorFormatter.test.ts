/**
 * Tests for validation error formatter
 */

import type { ErrorObject } from 'ajv';
import { formatAllowlistValidationErrors } from '../validationErrorFormatter';
import { logger } from '../../logger';

// Mock nanoid for consistent correlation IDs
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id'),
}));

describe('formatAllowlistValidationErrors', () => {
  test('should handle empty errors array', () => {
    const errors: ErrorObject[] = [];
    const result = formatAllowlistValidationErrors(errors);
    expect(result).toBe('Unknown validation error');
  });

  test('should format single missing required property error', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/0',
        schemaPath: '#/items/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property 'id'",
        data: {},
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Entry at index 0');
    expect(result).toContain("missing required property 'id'");
  });

  test('should format minLength validation error', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/0/id',
        schemaPath: '#/items/properties/id/minLength',
        keyword: 'minLength',
        params: { limit: 1 },
        message: 'must NOT have fewer than 1 characters',
        data: '',
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Entry at index 0');
    expect(result).toContain('field id');
    expect(result).toContain('cannot be empty');
  });

  test('should format date format validation error', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/0/expires',
        schemaPath: '#/items/properties/expires/format',
        keyword: 'format',
        params: { format: 'date' },
        message: 'must match format "date"',
        data: 'not-a-date',
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Entry at index 0');
    expect(result).toContain('field expires');
    expect(result).toContain('must be a valid date in YYYY-MM-DD format');
  });

  test('should format type validation error', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/0/id',
        schemaPath: '#/items/properties/id/type',
        keyword: 'type',
        params: { type: 'string' },
        message: 'must be string',
        data: 123,
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Entry at index 0');
    expect(result).toContain('field id');
    expect(result).toContain('must be a string');
  });

  test('should format additional properties error', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/0',
        schemaPath: '#/items/additionalProperties',
        keyword: 'additionalProperties',
        params: { additionalProperty: 'extraField' },
        message: 'must NOT have additional properties',
        data: { extraField: 'value' },
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Entry at index 0');
    expect(result).toContain("has unexpected property 'extraField'");
  });

  test('should format array type error at root level', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '',
        schemaPath: '#/type',
        keyword: 'type',
        params: { type: 'array' },
        message: 'must be array',
        data: { not: 'array' },
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Allowlist must be an array');
  });

  test('should format multiple errors for same entry', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/0',
        schemaPath: '#/items/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property 'id'",
        data: {},
      },
      {
        instancePath: '/0',
        schemaPath: '#/items/required',
        keyword: 'required',
        params: { missingProperty: 'package' },
        message: "must have required property 'package'",
        data: {},
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Entry at index 0');
    expect(result).toContain("missing required property 'id'");
    expect(result).toContain("missing required property 'package'");
  });

  test('should format errors for multiple entries', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/0',
        schemaPath: '#/items/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property 'id'",
        data: {},
      },
      {
        instancePath: '/1/expires',
        schemaPath: '#/items/properties/expires/format',
        keyword: 'format',
        params: { format: 'date' },
        message: 'must match format "date"',
        data: 'invalid-date',
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Entry at index 0');
    expect(result).toContain('Entry at index 1');
    expect(result).toContain("missing required property 'id'");
    expect(result).toContain('must be a valid date');
  });

  test('should handle unknown error types gracefully', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/0/unknown',
        schemaPath: '#/items/properties/unknown/unknown',
        keyword: 'unknown' as any,
        params: {},
        message: 'unknown error type',
        data: 'value',
      },
    ];

    const result = formatAllowlistValidationErrors(errors);
    expect(result).toContain('Entry at index 0');
    expect(result).toContain('field unknown');
    expect(result).toContain('unknown error type');
  });
});

describe('Structured Error Logging - Validation Error Formatter', () => {
  let loggerDebugSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerDebugSpy = jest.spyOn(logger, 'debug').mockImplementation();
    loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation();
  });

  afterEach(() => {
    loggerDebugSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  describe('formatAllowlistValidationErrors operational logging', () => {
    test('should log debug information for error processing', () => {
      const errors: ErrorObject[] = [
        {
          instancePath: '/0',
          schemaPath: '#/items/required',
          keyword: 'required',
          params: { missingProperty: 'id' },
          message: "must have required property 'id'",
          data: {},
        },
        {
          instancePath: '/1/expires',
          schemaPath: '#/items/properties/expires/format',
          keyword: 'format',
          params: { format: 'date' },
          message: 'must match format "date"',
          data: 'invalid-date',
        },
      ];

      formatAllowlistValidationErrors(errors);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Processing validation errors for formatting',
        expect.objectContaining({
          function_name: 'formatAllowlistValidationErrors',
          module_name: 'audit-filter/validationErrorFormatter',
          total_errors: 2,
          error_types: expect.arrayContaining(['required', 'format']),
          affected_entries: expect.arrayContaining([0, 1]),
        })
      );
    });

    test('should log warning for unknown error types', () => {
      const errors: ErrorObject[] = [
        {
          instancePath: '/0/field',
          schemaPath: '#/items/properties/field/unknown',
          keyword: 'unknown' as any,
          params: {},
          message: 'unknown error type',
          data: 'value',
        },
      ];

      formatAllowlistValidationErrors(errors);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Unknown validation error type encountered',
        expect.objectContaining({
          function_name: 'formatAllowlistValidationErrors',
          module_name: 'audit-filter/validationErrorFormatter',
          unknown_keyword: 'unknown',
          instance_path: '/0/field',
          error_message: 'unknown error type',
        })
      );
    });

    test('should handle empty errors array without logging', () => {
      const errors: ErrorObject[] = [];

      formatAllowlistValidationErrors(errors);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'No validation errors to format',
        expect.objectContaining({
          function_name: 'formatAllowlistValidationErrors',
          module_name: 'audit-filter/validationErrorFormatter',
        })
      );
    });

    test('should aggregate error statistics correctly', () => {
      const errors: ErrorObject[] = [
        {
          instancePath: '/0',
          schemaPath: '#/items/required',
          keyword: 'required',
          params: { missingProperty: 'id' },
          message: "must have required property 'id'",
          data: {},
        },
        {
          instancePath: '/0',
          schemaPath: '#/items/required',
          keyword: 'required',
          params: { missingProperty: 'package' },
          message: "must have required property 'package'",
          data: {},
        },
        {
          instancePath: '/1/expires',
          schemaPath: '#/items/properties/expires/format',
          keyword: 'format',
          params: { format: 'date' },
          message: 'must match format "date"',
          data: 'invalid-date',
        },
      ];

      formatAllowlistValidationErrors(errors);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Processing validation errors for formatting',
        expect.objectContaining({
          function_name: 'formatAllowlistValidationErrors',
          module_name: 'audit-filter/validationErrorFormatter',
          total_errors: 3,
          error_types: expect.arrayContaining(['required', 'format']),
          affected_entries: expect.arrayContaining([0, 1]),
          error_type_counts: expect.objectContaining({
            required: 2,
            format: 1,
          }),
        })
      );
    });

    test('should not log sensitive data from error objects', () => {
      const errors: ErrorObject[] = [
        {
          instancePath: '/0/secret_field',
          schemaPath: '#/items/properties/secret_field/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
          data: { secret: 'api-key-12345', password: 'secret123' },
        },
      ];

      formatAllowlistValidationErrors(errors);

      // Verify that sensitive data is not logged
      const logCall = loggerDebugSpy.mock.calls[0];
      const logMessage = logCall[0];
      const logContext = logCall[1];

      expect(logMessage).not.toContain('api-key-12345');
      expect(logMessage).not.toContain('secret123');
      expect(JSON.stringify(logContext)).not.toContain('api-key-12345');
      expect(JSON.stringify(logContext)).not.toContain('secret123');
    });
  });
});
