/**
 * Core logic for audit-filter
 *
 * This module contains pure functions for processing npm audit results
 * and filtering them against an allowlist. It has no side effects and
 * is designed to be easily testable.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { allowlistSchema } from './allowlist.schema';
import { formatAllowlistValidationErrors } from './validationErrorFormatter';
import { RawNpmV6AuditSchema, RawNpmV7PlusAuditSchema } from './npmAudit.raw.schemas';
import { normalizeV6Data, normalizeV7PlusData } from './npmAudit.normalizers';
import { logger } from '../logger';
import { isExpired, willExpireSoon as willExpireSoonUtc } from './dateUtils';
import type {
  AllowlistEntry,
  Advisory,
  NpmAuditResult,
  CanonicalNpmAuditReport,
  CanonicalVulnerability,
  VulnerabilityInfo,
  AnalysisResult,
} from './types';

// Initialize AJV with formats support for schema validation
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateAllowlist = ajv.compile<AllowlistEntry[]>(allowlistSchema);

/**
 * Type guard to check if a value is a non-null object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Detect the npm audit format version based on the structure
 *
 * @param data The parsed JSON object from npm audit
 * @returns The detected format version or 'unknown'
 */
function detectNpmAuditFormat(data: Record<string, unknown>): 'npm-v6' | 'npm-v7+' | 'unknown' {
  // npm v7+ format has "vulnerabilities" as a top-level key and usually "auditReportVersion"
  // Check this first to prioritize v7+ format when both structures exist
  if ('vulnerabilities' in data && typeof data.vulnerabilities === 'object') {
    return 'npm-v7+';
  }

  // npm v6 format has both "advisories" and "metadata" with "vulnerabilities" as required fields
  if (
    'advisories' in data &&
    typeof data.advisories === 'object' &&
    data.advisories !== null &&
    !Array.isArray(data.advisories) && // Ensure advisories is an object, not an array
    'metadata' in data &&
    typeof data.metadata === 'object' &&
    data.metadata !== null
  ) {
    const meta = data.metadata as Record<string, unknown>;
    if ('vulnerabilities' in meta && typeof meta.vulnerabilities === 'object') {
      return 'npm-v6';
    }
  }

  // Unknown format (including incomplete v6 format)
  return 'unknown';
}

/**
 * Fallback parser that attempts to extract basic vulnerability information
 * from unrecognized npm audit formats
 *
 * @param data The parsed JSON object from npm audit
 * @returns Canonical npm audit report with extracted vulnerabilities
 */
function fallbackParser(data: Record<string, unknown>): CanonicalNpmAuditReport {
  logger.warn('Using fallback parser for unrecognized npm audit format', {
    function_name: 'fallbackParser',
    module_name: 'audit-filter/core',
    top_level_keys: Object.keys(data),
  });

  const vulnerabilities: CanonicalVulnerability[] = [];
  const metadata = {
    vulnerabilities: {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      total: 0,
    },
  };

  // Try to extract metadata if it exists
  if ('metadata' in data && typeof data.metadata === 'object' && data.metadata !== null) {
    const meta = data.metadata as Record<string, unknown>;
    if (
      'vulnerabilities' in meta &&
      typeof meta.vulnerabilities === 'object' &&
      meta.vulnerabilities !== null
    ) {
      const vulnCounts = meta.vulnerabilities as Record<string, unknown>;
      metadata.vulnerabilities = {
        info: Number(vulnCounts.info) || 0,
        low: Number(vulnCounts.low) || 0,
        moderate: Number(vulnCounts.moderate) || 0,
        high: Number(vulnCounts.high) || 0,
        critical: Number(vulnCounts.critical) || 0,
        total: Number(vulnCounts.total) || 0,
      };
    }
  }

  // If no vulnerabilities were found but metadata shows counts, return with metadata only
  if (vulnerabilities.length === 0 && metadata.vulnerabilities.total > 0) {
    logger.warn('Fallback parser found vulnerability counts but could not extract details', {
      function_name: 'fallbackParser',
      module_name: 'audit-filter/core',
      vulnerability_counts: metadata.vulnerabilities,
    });
  }

  return {
    vulnerabilities,
    metadata,
  };
}

/**
 * Parse npm audit --json output into a canonical structured object
 *
 * This function uses schema-driven validation to support multiple npm audit
 * formats (v6, v7+) and normalizes them to a canonical internal representation.
 *
 * @param jsonString The JSON string output from npm audit --json
 * @returns Canonical npm audit report
 * @throws Error if the JSON cannot be parsed or has an unexpected structure
 */
export function parseNpmAuditJsonCanonical(jsonString: string): CanonicalNpmAuditReport {
  logger.debug('Parsing npm audit JSON output', {
    function_name: 'parseNpmAuditJsonCanonical',
    module_name: 'audit-filter/core',
    input_length: jsonString.length,
  });

  // Add console.log to help debug CI failures
  console.log('=== RAW NPM AUDIT JSON OUTPUT ===');
  console.log(jsonString);
  console.log('=== END RAW NPM AUDIT JSON OUTPUT ===');

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (parseError) {
    if (parseError instanceof SyntaxError) {
      logger.error(
        'Failed to parse npm audit output as JSON',
        {
          function_name: 'parseNpmAuditJsonCanonical',
          module_name: 'audit-filter/core',
          error_type: 'JSON_PARSE_ERROR',
          input_length: jsonString.length,
          input_source: 'npm_audit_output',
        },
        parseError
      );
      throw new Error(`Failed to parse npm audit output as JSON: ${parseError.message}`);
    }
    throw parseError;
  }

  // Type guard to check if parsed is an object
  if (!isObject(parsedJson)) {
    const inputType = Array.isArray(parsedJson) ? 'array' : typeof parsedJson;
    logger.error(
      'Invalid npm audit output structure',
      {
        function_name: 'parseNpmAuditJsonCanonical',
        module_name: 'audit-filter/core',
        error_type: 'INVALID_STRUCTURE',
        input_type: inputType,
        expected_type: 'object',
      },
      new Error('Invalid npm audit output: not a valid object')
    );
    throw new Error('Invalid npm audit output: not a valid object');
  }

  // Detect the format before attempting to parse
  let detectedFormat: 'npm-v6' | 'npm-v7+' | 'unknown';
  try {
    detectedFormat = detectNpmAuditFormat(parsedJson);
  } catch (detectionError) {
    console.log('=== FORMAT DETECTION ERROR ===');
    console.log('Error during format detection:', (detectionError as Error).message);
    console.log('Top-level keys:', Object.keys(parsedJson));
    console.log('=== END FORMAT DETECTION ERROR ===');

    logger.error(
      'Error during npm audit format detection',
      {
        function_name: 'parseNpmAuditJsonCanonical',
        module_name: 'audit-filter/core',
        error_type: 'FORMAT_DETECTION_ERROR',
        top_level_keys: Object.keys(parsedJson),
        error_message: (detectionError as Error).message,
      },
      detectionError as Error
    );

    // Default to unknown format if detection fails
    detectedFormat = 'unknown';
  }

  logger.debug('Detected npm audit format', {
    function_name: 'parseNpmAuditJsonCanonical',
    module_name: 'audit-filter/core',
    detected_format: detectedFormat,
  });

  // Parse based on detected format
  switch (detectedFormat) {
    case 'npm-v7+': {
      const result = RawNpmV7PlusAuditSchema.safeParse(parsedJson);
      if (result.success) {
        try {
          return normalizeV7PlusData(result.data);
        } catch (normalizationError) {
          // Log detailed error context for debugging
          console.log('=== NORMALIZATION ERROR (npm v7+) ===');
          console.log('Error:', (normalizationError as Error).message);
          console.log('Stack:', (normalizationError as Error).stack);
          console.log('Data keys:', Object.keys(result.data));
          console.log('=== END NORMALIZATION ERROR ===');

          logger.error(
            'Failed to normalize npm v7+ data after successful validation',
            {
              function_name: 'parseNpmAuditJsonCanonical',
              module_name: 'audit-filter/core',
              error_type: 'NORMALIZATION_ERROR',
              format: 'npm-v7+',
              error_message: (normalizationError as Error).message,
              data_keys: Object.keys(result.data),
            },
            normalizationError as Error
          );

          throw new Error(
            `Failed to normalize npm v7+ data: ${(normalizationError as Error).message}\n\n` +
              `This might indicate a bug in the normalization logic. Please report this issue.`
          );
        }
      }

      // Log validation errors for debugging
      console.log('=== NPM V7+ VALIDATION ERRORS ===');
      console.log(JSON.stringify(result.error.issues, null, 2));
      console.log('=== END VALIDATION ERRORS ===');

      logger.error(
        'Failed to validate npm v7+ format',
        {
          function_name: 'parseNpmAuditJsonCanonical',
          module_name: 'audit-filter/core',
          error_type: 'VALIDATION_ERROR',
          format: 'npm-v7+',
          validation_errors: result.error.issues,
        },
        new Error('npm v7+ format validation failed')
      );

      throw new Error(
        `Detected npm v7+ format but validation failed.\n\n` +
          `Validation errors:\n${JSON.stringify(result.error.issues, null, 2)}`
      );
    }

    case 'npm-v6': {
      const result = RawNpmV6AuditSchema.safeParse(parsedJson);
      if (result.success) {
        try {
          return normalizeV6Data(result.data);
        } catch (normalizationError) {
          // Log detailed error context for debugging
          console.log('=== NORMALIZATION ERROR (npm v6) ===');
          console.log('Error:', (normalizationError as Error).message);
          console.log('Stack:', (normalizationError as Error).stack);
          console.log('Data keys:', Object.keys(result.data));
          console.log('=== END NORMALIZATION ERROR ===');

          logger.error(
            'Failed to normalize npm v6 data after successful validation',
            {
              function_name: 'parseNpmAuditJsonCanonical',
              module_name: 'audit-filter/core',
              error_type: 'NORMALIZATION_ERROR',
              format: 'npm-v6',
              error_message: (normalizationError as Error).message,
              data_keys: Object.keys(result.data),
            },
            normalizationError as Error
          );

          throw new Error(
            `Failed to normalize npm v6 data: ${(normalizationError as Error).message}\n\n` +
              `This might indicate a bug in the normalization logic. Please report this issue.`
          );
        }
      }

      // Log validation errors for debugging
      console.log('=== NPM V6 VALIDATION ERRORS ===');
      console.log(JSON.stringify(result.error.issues, null, 2));
      console.log('=== END VALIDATION ERRORS ===');

      logger.error(
        'Failed to validate npm v6 format',
        {
          function_name: 'parseNpmAuditJsonCanonical',
          module_name: 'audit-filter/core',
          error_type: 'VALIDATION_ERROR',
          format: 'npm-v6',
          validation_errors: result.error.issues,
        },
        new Error('npm v6 format validation failed')
      );

      throw new Error(
        `Detected npm v6 format but validation failed.\n\n` +
          `Validation errors:\n${JSON.stringify(result.error.issues, null, 2)}`
      );
    }

    case 'unknown':
    default: {
      // Add detailed logging of the parsed structure for debugging
      console.log('=== UNKNOWN FORMAT - USING FALLBACK PARSER ===');
      console.log('Top-level keys:', Object.keys(parsedJson).join(', '));
      console.log('=== PARSED JSON STRUCTURE (first 1000 chars) ===');
      console.log(JSON.stringify(parsedJson, null, 2).substring(0, 1000));
      console.log('=== END PARSED JSON STRUCTURE ===');

      logger.warn('Unknown npm audit format detected, attempting fallback parser', {
        function_name: 'parseNpmAuditJsonCanonical',
        module_name: 'audit-filter/core',
        error_type: 'UNKNOWN_FORMAT',
        input_length: jsonString.length,
        top_level_keys: Object.keys(parsedJson),
      });

      try {
        // Attempt to use fallback parser
        const result = fallbackParser(parsedJson);

        console.log('=== FALLBACK PARSER SUCCESS ===');
        console.log(`Extracted ${result.vulnerabilities.length} vulnerabilities`);
        console.log(`Metadata counts: ${JSON.stringify(result.metadata.vulnerabilities)}`);

        return result;
      } catch (fallbackError) {
        logger.error(
          'Fallback parser also failed',
          {
            function_name: 'parseNpmAuditJsonCanonical',
            module_name: 'audit-filter/core',
            error_type: 'FALLBACK_PARSER_ERROR',
          },
          fallbackError as Error
        );

        throw new Error(
          `Unable to parse npm audit format. The JSON structure doesn't match any known format ` +
            `and the fallback parser also failed.\n\n` +
            `Top-level keys found: ${Object.keys(parsedJson).join(', ')}\n` +
            `Expected either 'advisories' (npm v6) or 'vulnerabilities' (npm v7+).\n\n` +
            `Fallback error: ${(fallbackError as Error).message}`
        );
      }
    }
  }
}

/**
 * Legacy-compatible parse function that returns the old NpmAuditResult format
 *
 * @deprecated Use parseNpmAuditJsonCanonical for new code
 * @param jsonString The JSON string output from npm audit --json
 * @returns Legacy npm audit result format for backward compatibility
 * @throws Error if the JSON cannot be parsed or has an unexpected structure
 */
export function parseNpmAuditJson(jsonString: string): NpmAuditResult {
  const canonical = parseNpmAuditJsonCanonical(jsonString);

  // Convert canonical format back to legacy format for compatibility
  const advisories: { [key: string]: Advisory } = {};

  for (const vulnerability of canonical.vulnerabilities) {
    advisories[vulnerability.id] = {
      id: isNaN(Number(vulnerability.id)) ? vulnerability.id : Number(vulnerability.id), // Convert to number if possible for legacy compatibility
      module_name: vulnerability.package,
      severity: vulnerability.severity,
      title: vulnerability.title,
      url: vulnerability.url,
      vulnerable_versions: vulnerability.vulnerableVersions,
    };
  }

  return {
    advisories,
    metadata: canonical.metadata,
  };
}

/**
 * Parse and validate the allowlist JSON content
 *
 * @param jsonString JSON string content of the allowlist file, or null if file not found
 * @returns Array of allowlist entries
 * @throws Error if the JSON cannot be parsed or does not match the expected schema
 */
export function parseAndValidateAllowlist(jsonString: string | null): AllowlistEntry[] {
  // If no allowlist file exists, return an empty array
  if (jsonString === null) {
    logger.debug('No allowlist file provided, using empty allowlist', {
      function_name: 'parseAndValidateAllowlist',
      module_name: 'audit-filter/core',
    });
    return [];
  }

  logger.debug('Parsing and validating allowlist file', {
    function_name: 'parseAndValidateAllowlist',
    module_name: 'audit-filter/core',
    input_length: jsonString.length,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (parseError) {
    if (parseError instanceof SyntaxError) {
      logger.error(
        'Failed to parse allowlist file as JSON',
        {
          function_name: 'parseAndValidateAllowlist',
          module_name: 'audit-filter/core',
          error_type: 'JSON_PARSE_ERROR',
          input_length: jsonString.length,
          input_source: 'allowlist_file',
        },
        parseError
      );

      throw new Error(
        `Failed to parse allowlist file as JSON. The file contains invalid JSON syntax.\n` +
          `Error details: ${parseError.message}\n` +
          `Please check your .audit-allowlist.json file for:\n` +
          `- Missing commas between array elements or object properties\n` +
          `- Unescaped quotes in strings\n` +
          `- Trailing commas (not allowed in JSON)\n` +
          `- Mismatched brackets or braces`
      );
    }
    throw parseError;
  }

  // Validate against JSON schema using AJV
  if (!validateAllowlist(parsed)) {
    const errors = validateAllowlist.errors || [];
    const errorMessages = formatAllowlistValidationErrors(errors);

    logger.error(
      'Allowlist validation failed',
      {
        function_name: 'parseAndValidateAllowlist',
        module_name: 'audit-filter/core',
        error_type: 'SCHEMA_VALIDATION_ERROR',
        validation_errors_count: errors.length,
        entry_count: Array.isArray(parsed) ? parsed.length : 0,
      },
      new Error('Schema validation failed')
    );

    throw new Error(
      `Allowlist file validation failed. The JSON structure does not match the required schema.\n` +
        `${errorMessages}\n` +
        `Please ensure your .audit-allowlist.json file follows the correct format.`
    );
  }

  // If validation passes, parsed is guaranteed to be AllowlistEntry[]
  return parsed;
}

/**
 * Check if an allowlist entry has expired
 *
 * @param entry The allowlist entry to check
 * @param currentDate The current date to check against
 * @returns true if the entry has expired or has no expiration, false otherwise
 */
export function isAllowlistEntryExpired(entry: AllowlistEntry, currentDate: Date): boolean {
  return isExpired(entry.expires, currentDate);
}

/**
 * Check if an allowlist entry will expire soon (within the specified days)
 *
 * @param entry The allowlist entry to check
 * @param currentDate The current date to check against
 * @param daysThreshold Number of days to consider as "expiring soon"
 * @returns true if the entry will expire within the threshold, false otherwise
 */
export function willExpireSoon(
  entry: AllowlistEntry,
  currentDate: Date,
  daysThreshold: number
): boolean {
  return willExpireSoonUtc(entry.expires, currentDate, daysThreshold);
}

/**
 * Find a matching allowlist entry for a vulnerability (canonical format)
 *
 * @param vulnerability The canonical vulnerability to find in the allowlist
 * @param allowlist The list of allowlist entries
 * @returns The matching allowlist entry, or undefined if not found
 */
export function findAllowlistEntryCanonical(
  vulnerability: CanonicalVulnerability,
  allowlist: AllowlistEntry[]
): AllowlistEntry | undefined {
  // First check if vulnerability is defined and has required properties
  if (!vulnerability || !vulnerability.id || !vulnerability.package) {
    return undefined;
  }

  return allowlist.find(
    entry => entry.id === vulnerability.id.toString() && entry.package === vulnerability.package
  );
}

/**
 * Find a matching allowlist entry for a vulnerability (legacy format)
 *
 * @param advisory The advisory to find in the allowlist
 * @param allowlist The list of allowlist entries
 * @returns The matching allowlist entry, or undefined if not found
 */
export function findAllowlistEntry(
  advisory: Advisory,
  allowlist: AllowlistEntry[]
): AllowlistEntry | undefined {
  // First check if advisory is defined and has required properties
  if (!advisory || !advisory.id || !advisory.module_name) {
    return undefined;
  }

  return allowlist.find(
    entry => entry.id === advisory.id.toString() && entry.package === advisory.module_name
  );
}

/**
 * Filter vulnerabilities against the allowlist (canonical format)
 *
 * @param auditReport The canonical npm audit report
 * @param allowlist The allowlist entries
 * @param currentDate The current date for expiration checks
 * @returns Analysis result with classified vulnerabilities
 */
export function filterVulnerabilitiesCanonical(
  auditReport: CanonicalNpmAuditReport,
  allowlist: AllowlistEntry[],
  currentDate: Date
): AnalysisResult {
  const vulnerabilities: VulnerabilityInfo[] = [];
  const allowedVulnerabilities: VulnerabilityInfo[] = [];
  const expiredAllowlistEntries: VulnerabilityInfo[] = [];
  const expiringEntries: VulnerabilityInfo[] = [];

  // Process each vulnerability in the canonical format
  for (const vulnerability of auditReport.vulnerabilities) {
    // Skip if vulnerability is undefined or doesn't have required properties
    if (!vulnerability || typeof vulnerability !== 'object') {
      continue;
    }

    // We only care about high and critical vulnerabilities
    if (vulnerability.severity !== 'high' && vulnerability.severity !== 'critical') {
      continue;
    }

    // Find matching allowlist entry
    const allowlistEntry = findAllowlistEntryCanonical(vulnerability, allowlist);

    // Create vulnerability info object
    const vulnerabilityInfo = {
      id: vulnerability.id,
      package: vulnerability.package,
      severity: vulnerability.severity,
      title: vulnerability.title,
      url: vulnerability.url,
    };

    if (!allowlistEntry) {
      // New vulnerability not in allowlist
      vulnerabilities.push({
        ...vulnerabilityInfo,
        allowlistStatus: 'new' as const,
      });
    } else if (isAllowlistEntryExpired(allowlistEntry, currentDate)) {
      // Expired allowlist entry
      expiredAllowlistEntries.push({
        ...vulnerabilityInfo,
        allowlistStatus: 'expired' as const,
        reason: allowlistEntry.reason,
        expiresOn: allowlistEntry.expires,
      });
    } else {
      // Allowed vulnerability
      allowedVulnerabilities.push({
        ...vulnerabilityInfo,
        allowlistStatus: 'allowed' as const,
        reason: allowlistEntry.reason,
        expiresOn: allowlistEntry.expires,
      });

      // Check if it will expire soon
      if (willExpireSoon(allowlistEntry, currentDate, 30)) {
        expiringEntries.push({
          ...vulnerabilityInfo,
          allowlistStatus: 'allowed' as const,
          reason: allowlistEntry.reason,
          expiresOn: allowlistEntry.expires,
        });
      }
    }
  }

  // Determine if the analysis is successful (no new or expired vulnerabilities)
  const isSuccessful = vulnerabilities.length === 0 && expiredAllowlistEntries.length === 0;

  return {
    vulnerabilities,
    allowedVulnerabilities,
    expiredAllowlistEntries,
    expiringEntries,
    isSuccessful,
  };
}

/**
 * Legacy-compatible filter function for backward compatibility
 *
 * @deprecated Use filterVulnerabilitiesCanonical for new code
 * @param auditReport The legacy npm audit report
 * @param allowlist The allowlist entries
 * @param currentDate The current date for expiration checks
 * @returns Analysis result with classified vulnerabilities
 */
export function filterVulnerabilities(
  auditReport: NpmAuditResult,
  allowlist: AllowlistEntry[],
  currentDate: Date
): AnalysisResult {
  // Convert legacy format to canonical and use the canonical filter
  const canonicalReport: CanonicalNpmAuditReport = {
    vulnerabilities: Object.values(auditReport.advisories).map(advisory => ({
      id: String(advisory.id),
      package: advisory.module_name,
      severity: advisory.severity,
      title: advisory.title,
      url: advisory.url,
      vulnerableVersions: advisory.vulnerable_versions,
      source: 'npm-v6' as const, // Assume legacy format is v6
    })),
    metadata: auditReport.metadata,
  };

  return filterVulnerabilitiesCanonical(canonicalReport, allowlist, currentDate);
}

/**
 * Main function that analyzes npm audit results against an allowlist
 *
 * @param npmAuditJson The JSON output from npm audit --json
 * @param allowlistJson The JSON content of the allowlist file, or null if not found
 * @param currentDate The current date for expiration checks
 * @returns Analysis result with categorized vulnerabilities
 */
export function analyzeAuditReport(
  npmAuditJson: string,
  allowlistJson: string | null,
  currentDate: Date
): AnalysisResult {
  // Parse the npm audit output using the new schema-driven approach
  const auditReport = parseNpmAuditJsonCanonical(npmAuditJson);

  // Parse and validate the allowlist
  const allowlist = parseAndValidateAllowlist(allowlistJson);

  // Filter and classify vulnerabilities using canonical format
  return filterVulnerabilitiesCanonical(auditReport, allowlist, currentDate);
}
