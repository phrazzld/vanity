/**
 * JSON Schema definition for allowlist file validation
 *
 * This module defines the formal schema for allowlist entries using JSON Schema
 * to ensure consistent validation and clear documentation of the expected structure.
 */

/**
 * JSON Schema for validating allowlist entries
 *
 * Defines the structure and validation rules for allowlist files:
 * - Must be an array of allowlist entries
 * - Each entry must have required fields: id, package, reason, expires
 * - Optional fields: notes, reviewedOn
 * - Strict validation with no additional properties allowed
 * - Date fields must be in ISO 8601 UTC format (e.g., 2024-01-01T00:00:00Z)
 */
export const allowlistSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1,
      },
      package: {
        type: 'string',
        minLength: 1,
      },
      reason: {
        type: 'string',
        minLength: 1,
      },
      expires: {
        type: 'string',
        format: 'date-time', // ISO 8601 UTC format from ajv-formats
      },
      notes: {
        type: 'string',
        nullable: true,
      },
      reviewedOn: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
    },
    required: ['id', 'package', 'reason', 'expires'],
    additionalProperties: false,
  },
} as const;
