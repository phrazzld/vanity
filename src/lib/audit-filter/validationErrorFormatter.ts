/**
 * Error formatting for AJV validation errors
 *
 * This module provides user-friendly error message formatting for allowlist
 * validation failures, converting technical AJV error objects into clear,
 * actionable messages for developers.
 */

import type { ErrorObject } from 'ajv';
import { logger } from '../logger';

/**
 * Format AJV validation errors into user-friendly error messages
 *
 * Processes AJV error objects and converts them into clear, contextual error
 * messages that indicate exactly what went wrong and where.
 *
 * @param errors Array of AJV error objects
 * @returns Formatted error message string
 */
export function formatAllowlistValidationErrors(errors: ErrorObject[]): string {
  if (!errors || errors.length === 0) {
    logger.debug('No validation errors to format', {
      function_name: 'formatAllowlistValidationErrors',
      module_name: 'audit-filter/validationErrorFormatter',
    });
    return 'Unknown validation error';
  }

  // Collect statistics for logging
  const errorTypes = errors.map(err => err.keyword);
  const uniqueErrorTypes = [...new Set(errorTypes)];
  const errorTypeCounts: Record<string, number> = {};
  for (const type of errorTypes) {
    errorTypeCounts[type] = (errorTypeCounts[type] || 0) + 1;
  }

  const affectedEntries = [
    ...new Set(
      errors
        .map(err => {
          const match = err.instancePath.match(/^\/(\d+)/);
          return match && match[1] ? parseInt(match[1], 10) : null;
        })
        .filter(index => index !== null)
    ),
  ];

  logger.debug('Processing validation errors for formatting', {
    function_name: 'formatAllowlistValidationErrors',
    module_name: 'audit-filter/validationErrorFormatter',
    total_errors: errors.length,
    error_types: uniqueErrorTypes,
    affected_entries: affectedEntries,
    error_type_counts: errorTypeCounts,
  });

  const messages: string[] = [];

  for (const error of errors) {
    const message = formatSingleError(error);
    if (message) {
      messages.push(message);
    }
  }

  return messages.join('. ');
}

/**
 * Format a single AJV error into a user-friendly message
 *
 * @param error AJV error object
 * @returns Formatted error message
 */
function formatSingleError(error: ErrorObject): string {
  const { instancePath, keyword, params, message } = error;

  // Handle root-level array validation
  if (instancePath === '' && keyword === 'type' && params?.type === 'array') {
    return 'Allowlist must be an array';
  }

  // Extract entry index from path (e.g., "/0" -> 0, "/1" -> 1)
  const entryIndexMatch = instancePath.match(/^\/(\d+)/);
  const entryIndex = entryIndexMatch?.[1] ? parseInt(entryIndexMatch[1], 10) : null;

  if (entryIndex === null) {
    // Fallback for unexpected path format
    return `Validation error: ${message}`;
  }

  const entryPrefix = `Entry at index ${entryIndex}`;

  // Handle different error types with specific formatting
  switch (keyword) {
    case 'required': {
      const missingProperty = params?.missingProperty as string;
      return `${entryPrefix}: missing required property '${missingProperty}'`;
    }

    case 'minLength': {
      const fieldPath = instancePath.split('/').pop();
      return `${entryPrefix}: field ${fieldPath} cannot be empty`;
    }

    case 'format': {
      const fieldPath = instancePath.split('/').pop();
      const format = params?.format as string;
      if (format === 'date') {
        return `${entryPrefix}: field ${fieldPath} must be a valid date in YYYY-MM-DD format`;
      }
      return `${entryPrefix}: field ${fieldPath} has invalid format (expected ${format})`;
    }

    case 'type': {
      const fieldPath = instancePath.split('/').pop();
      const expectedType = params?.type as string;
      return `${entryPrefix}: field ${fieldPath} must be a ${expectedType}`;
    }

    case 'additionalProperties': {
      const additionalProperty = params?.additionalProperty as string;
      return `${entryPrefix}: has unexpected property '${additionalProperty}'`;
    }

    default: {
      // Log warning for unknown error types
      logger.warn('Unknown validation error type encountered', {
        function_name: 'formatAllowlistValidationErrors',
        module_name: 'audit-filter/validationErrorFormatter',
        unknown_keyword: keyword,
        instance_path: instancePath,
        error_message: message,
      });

      // Handle unknown error types gracefully
      const fieldPath = instancePath.split('/').pop();
      if (fieldPath && fieldPath !== entryIndex.toString()) {
        return `${entryPrefix}: field ${fieldPath} ${message}`;
      }
      return `${entryPrefix}: ${message}`;
    }
  }
}
