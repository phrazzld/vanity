/**
 * Normalizer functions for npm audit formats
 *
 * These functions transform different npm audit JSON formats into
 * the canonical internal representation for consistent processing.
 */

import type { RawNpmV6Audit, RawNpmV7PlusAudit } from './npmAudit.raw.schemas';
import type { CanonicalNpmAuditReport, CanonicalVulnerability } from './types';
import { logger } from '../logger';

/**
 * Normalize npm v6 audit data to canonical format
 *
 * @param rawData The validated npm v6 audit data
 * @returns Canonical npm audit report
 */
export function normalizeV6Data(rawData: RawNpmV6Audit): CanonicalNpmAuditReport {
  const vulnerabilities: CanonicalVulnerability[] = [];

  // Transform advisories object to vulnerabilities array
  for (const [, advisory] of Object.entries(rawData.advisories)) {
    vulnerabilities.push({
      id: String(advisory.id), // Ensure ID is always a string
      package: advisory.module_name,
      severity: advisory.severity,
      title: advisory.title,
      url: advisory.url,
      vulnerableVersions: advisory.vulnerable_versions || '*', // Default if empty
      source: 'npm-v6',
    });
  }

  return {
    vulnerabilities,
    metadata: {
      vulnerabilities: {
        info: rawData.metadata.vulnerabilities.info || 0,
        low: rawData.metadata.vulnerabilities.low || 0,
        moderate: rawData.metadata.vulnerabilities.moderate || 0,
        high: rawData.metadata.vulnerabilities.high || 0,
        critical: rawData.metadata.vulnerabilities.critical || 0,
        total: rawData.metadata.vulnerabilities.total || 0,
      },
    },
  };
}

/**
 * Normalize npm v7+ audit data to canonical format
 *
 * @param rawData The validated npm v7+ audit data
 * @returns Canonical npm audit report
 */
export function normalizeV7PlusData(rawData: RawNpmV7PlusAudit): CanonicalNpmAuditReport {
  const vulnerabilities: CanonicalVulnerability[] = [];

  // Transform vulnerabilities object to vulnerabilities array
  for (const [packageName, vulnerability] of Object.entries(rawData.vulnerabilities)) {
    // In npm v7+, each package can have multiple vulnerabilities through the "via" array
    // We need to extract each individual vulnerability source
    for (const viaItem of vulnerability.via) {
      vulnerabilities.push({
        id: String(viaItem.source), // Use the source advisory ID
        package: packageName,
        severity: viaItem.severity,
        title: viaItem.title,
        url: viaItem.url,
        vulnerableVersions: viaItem.range || '*', // Use range as vulnerable versions
        source: 'npm-v7+',
      });
    }
  }

  return {
    vulnerabilities,
    metadata: {
      vulnerabilities: {
        info: rawData.metadata.vulnerabilities.info || 0,
        low: rawData.metadata.vulnerabilities.low || 0,
        moderate: rawData.metadata.vulnerabilities.moderate || 0,
        high: rawData.metadata.vulnerabilities.high || 0,
        critical: rawData.metadata.vulnerabilities.critical || 0,
        total: rawData.metadata.vulnerabilities.total || 0,
      },
    },
  };
}

/**
 * Normalize any supported npm audit format to canonical format
 *
 * This is a convenience function that determines the format and applies
 * the appropriate normalizer.
 *
 * @param rawData The raw npm audit data (format auto-detected)
 * @returns Canonical npm audit report
 * @throws Error if the format cannot be determined
 */
export function normalizeAuditData(
  rawData: RawNpmV6Audit | RawNpmV7PlusAudit
): CanonicalNpmAuditReport {
  // Type guard to determine which format we're dealing with
  if ('advisories' in rawData) {
    const advisoriesCount = Object.keys(rawData.advisories).length;
    logger.debug('Normalizing npm audit data', {
      function_name: 'normalizeAuditData',
      module_name: 'audit-filter/normalizers',
      detected_format: 'npm-v6',
      advisories_count: advisoriesCount,
    });
    return normalizeV6Data(rawData);
  } else if ('vulnerabilities' in rawData) {
    const vulnerabilitiesCount = Object.keys(rawData.vulnerabilities).length;
    logger.debug('Normalizing npm audit data', {
      function_name: 'normalizeAuditData',
      module_name: 'audit-filter/normalizers',
      detected_format: 'npm-v7+',
      vulnerabilities_count: vulnerabilitiesCount,
    });
    return normalizeV7PlusData(rawData);
  } else {
    // Extract information about the unknown format for debugging
    const hasAdvisories = rawData && typeof rawData === 'object' && 'advisories' in rawData;
    const hasVulnerabilities =
      rawData && typeof rawData === 'object' && 'vulnerabilities' in rawData;
    const detectedFields = rawData && typeof rawData === 'object' ? Object.keys(rawData) : [];

    logger.error(
      'Unable to determine npm audit format for normalization',
      {
        function_name: 'normalizeAuditData',
        module_name: 'audit-filter/normalizers',
        error_type: 'FORMAT_DETECTION_ERROR',
        has_advisories: hasAdvisories,
        has_vulnerabilities: hasVulnerabilities,
        detected_fields: detectedFields,
      },
      new Error('Format detection failed')
    );

    throw new Error('Unable to determine npm audit format for normalization');
  }
}
