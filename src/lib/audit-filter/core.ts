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
import type {
  AllowlistEntry,
  Advisory,
  NpmAuditResult,
  VulnerabilityInfo,
  AnalysisResult,
} from './types';

// Initialize AJV with formats support for schema validation
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateAllowlist = ajv.compile<AllowlistEntry[]>(allowlistSchema);

/**
 * Parse npm audit --json output into a structured object
 *
 * @param jsonString The JSON string output from npm audit --json
 * @returns Parsed npm audit result
 * @throws Error if the JSON cannot be parsed or has an unexpected structure
 */
export function parseNpmAuditJson(jsonString: string): NpmAuditResult {
  try {
    const parsed = JSON.parse(jsonString) as unknown;

    // Type guard to check if parsed is an object
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid npm audit output: not a valid object');
    }

    // Validate the structure has the required fields
    const typedParsed = parsed as Record<string, unknown>;

    if (
      !typedParsed.advisories ||
      typeof typedParsed.advisories !== 'object' ||
      Array.isArray(typedParsed.advisories)
    ) {
      throw new Error('Invalid npm audit output: missing or invalid advisories field');
    }

    if (
      !typedParsed.metadata ||
      typeof typedParsed.metadata !== 'object' ||
      Array.isArray(typedParsed.metadata)
    ) {
      throw new Error('Invalid npm audit output: missing or invalid metadata field');
    }

    const metadata = typedParsed.metadata as Record<string, unknown>;
    if (
      !metadata.vulnerabilities ||
      typeof metadata.vulnerabilities !== 'object' ||
      Array.isArray(metadata.vulnerabilities)
    ) {
      throw new Error(
        'Invalid npm audit output: missing or invalid metadata.vulnerabilities field'
      );
    }

    // Construct a properly typed result to ensure type safety
    const result: NpmAuditResult = {
      advisories: typedParsed.advisories as { [key: string]: Advisory },
      metadata: {
        vulnerabilities: metadata.vulnerabilities as {
          info: number;
          low: number;
          moderate: number;
          high: number;
          critical: number;
          total: number;
        },
      },
    };

    return result;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse npm audit output as JSON: ${error.message}`);
    }
    throw error;
  }
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
    return [];
  }

  try {
    const parsed = JSON.parse(jsonString) as unknown;

    // Validate against JSON schema using AJV
    if (!validateAllowlist(parsed)) {
      const errorMessages = formatAllowlistValidationErrors(validateAllowlist.errors || []);
      throw new Error(
        `Allowlist file validation failed. The JSON structure does not match the required schema.\n` +
          `${errorMessages}\n` +
          `Please ensure your .audit-allowlist.json file follows the correct format.`
      );
    }

    // If validation passes, parsed is guaranteed to be AllowlistEntry[]
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse allowlist file as JSON. The file contains invalid JSON syntax.\n` +
          `Error details: ${error.message}\n` +
          `Please check your .audit-allowlist.json file for:\n` +
          `  - Missing or extra commas\n` +
          `  - Unclosed brackets or braces\n` +
          `  - Invalid quotes or unescaped characters\n` +
          `  - Trailing commas in arrays or objects`
      );
    }
    throw error;
  }
}

/**
 * Check if an allowlist entry has expired
 *
 * @param entry The allowlist entry to check
 * @param currentDate The current date to check against
 * @returns true if the entry has expired or has no expiration, false otherwise
 */
export function isAllowlistEntryExpired(entry: AllowlistEntry, currentDate: Date): boolean {
  // If there's no expiration date, treat it as expired
  if (!entry.expires) {
    return true;
  }

  const expirationDate = new Date(entry.expires);

  // Invalid date format is treated as expired
  if (isNaN(expirationDate.getTime())) {
    return true;
  }

  return expirationDate < currentDate;
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
  if (!entry.expires) {
    return false;
  }

  const expirationDate = new Date(entry.expires);

  // Invalid date format
  if (isNaN(expirationDate.getTime())) {
    return false;
  }

  // If already expired, it's not "expiring soon"
  if (expirationDate <= currentDate) {
    return false;
  }

  const thresholdDate = new Date(currentDate);
  thresholdDate.setDate(currentDate.getDate() + daysThreshold);

  return expirationDate <= thresholdDate;
}

/**
 * Find a matching allowlist entry for a vulnerability
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
 * Filter vulnerabilities against the allowlist
 *
 * @param auditReport The parsed npm audit report
 * @param allowlist The allowlist entries
 * @param currentDate The current date for expiration checks
 * @returns Analysis result with classified vulnerabilities
 */
export function filterVulnerabilities(
  auditReport: NpmAuditResult,
  allowlist: AllowlistEntry[],
  currentDate: Date
): AnalysisResult {
  const vulnerabilities: VulnerabilityInfo[] = [];
  const allowedVulnerabilities: VulnerabilityInfo[] = [];
  const expiredAllowlistEntries: VulnerabilityInfo[] = [];
  const expiringEntries: VulnerabilityInfo[] = [];

  // Process each advisory
  for (const advisoryId in auditReport.advisories) {
    const advisory = auditReport.advisories[advisoryId];

    // Skip if advisory is undefined or doesn't have a severity property
    if (!advisory || typeof advisory !== 'object') {
      continue;
    }

    // We only care about high and critical vulnerabilities
    if (advisory.severity !== 'high' && advisory.severity !== 'critical') {
      continue;
    }

    // Find matching allowlist entry - advisory is guaranteed to be defined here
    // We need to ensure it's fully typed as an Advisory for the function call
    const allowlistEntry = findAllowlistEntry(advisory, allowlist);

    // Type guard to ensure we don't have nullable values in our objects
    const advisoryWithId = {
      id: advisory.id,
      package: advisory.module_name,
      severity: advisory.severity,
      title: advisory.title,
      url: advisory.url,
      // Non-nullable values as primitive defaults
      vulnerable_versions: advisory.vulnerable_versions || '',
    };

    if (!allowlistEntry) {
      // New vulnerability not in allowlist
      vulnerabilities.push({
        id: advisoryWithId.id,
        package: advisoryWithId.package,
        severity: advisoryWithId.severity,
        title: advisoryWithId.title,
        url: advisoryWithId.url,
        allowlistStatus: 'new',
      });
    } else if (isAllowlistEntryExpired(allowlistEntry, currentDate)) {
      // Expired allowlist entry
      expiredAllowlistEntries.push({
        id: advisoryWithId.id,
        package: advisoryWithId.package,
        severity: advisoryWithId.severity,
        title: advisoryWithId.title,
        url: advisoryWithId.url,
        allowlistStatus: 'expired',
        reason: allowlistEntry.reason,
        expiresOn: allowlistEntry.expires,
      });
    } else {
      // Allowed vulnerability
      allowedVulnerabilities.push({
        id: advisoryWithId.id,
        package: advisoryWithId.package,
        severity: advisoryWithId.severity,
        title: advisoryWithId.title,
        url: advisoryWithId.url,
        allowlistStatus: 'allowed',
        reason: allowlistEntry.reason,
        expiresOn: allowlistEntry.expires,
      });

      // Check if it will expire soon
      if (willExpireSoon(allowlistEntry, currentDate, 30)) {
        expiringEntries.push({
          id: advisoryWithId.id,
          package: advisoryWithId.package,
          severity: advisoryWithId.severity,
          title: advisoryWithId.title,
          url: advisoryWithId.url,
          allowlistStatus: 'allowed',
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
  // Parse the npm audit output
  const auditReport = parseNpmAuditJson(npmAuditJson);

  // Parse and validate the allowlist
  const allowlist = parseAndValidateAllowlist(allowlistJson);

  // Filter and classify vulnerabilities
  return filterVulnerabilities(auditReport, allowlist, currentDate);
}
