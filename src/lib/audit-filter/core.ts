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

  // Try npm v7+ format first (most common/current)
  const modernResult = RawNpmV7PlusAuditSchema.safeParse(parsedJson);
  if (modernResult.success) {
    return normalizeV7PlusData(modernResult.data);
  }

  // Fall back to npm v6 format
  const legacyResult = RawNpmV6AuditSchema.safeParse(parsedJson);
  if (legacyResult.success) {
    return normalizeV6Data(legacyResult.data);
  }

  // If all schemas fail, provide detailed error information
  const errorDetails = [
    `npm v7+ format validation errors: ${modernResult.error.message}`,
    `npm v6 format validation errors: ${legacyResult.error.message}`,
  ].join('\n');

  const hasAdvisories = parsedJson && typeof parsedJson === 'object' && 'advisories' in parsedJson;
  const hasVulnerabilities =
    parsedJson && typeof parsedJson === 'object' && 'vulnerabilities' in parsedJson;

  logger.error(
    'Unsupported npm audit format detected',
    {
      function_name: 'parseNpmAuditJsonCanonical',
      module_name: 'audit-filter/core',
      error_type: 'UNSUPPORTED_FORMAT',
      input_length: jsonString.length,
      has_advisories: hasAdvisories,
      has_vulnerabilities: hasVulnerabilities,
    },
    new Error('Unsupported npm audit format')
  );

  throw new Error(
    `The provided npm audit JSON does not match any supported format. ` +
      `Please ensure you are using a compatible npm version.\n\n` +
      `Validation details:\n${errorDetails}`
  );
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
