/**
 * Types for the audit-filter module
 *
 * This file contains type definitions for the audit-filter module,
 * including interfaces for allowlist entries, npm audit results,
 * and analysis results.
 */

/**
 * Represents an entry in the allowlist file
 */
export interface AllowlistEntry {
  id: string;
  package: string;
  reason: string;
  notes?: string;
  expires?: string;
  reviewedOn?: string;
}

/**
 * Represents a vulnerability advisory from npm audit
 */
export interface Advisory {
  id: number | string;
  module_name: string;
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  url: string;
  vulnerable_versions: string;
}

/**
 * Represents the result of npm audit --json
 */
export interface NpmAuditResult {
  advisories: { [key: string]: Advisory };
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
  };
}

/**
 * Detailed information about a vulnerability
 */
export interface VulnerabilityInfo {
  id: string | number;
  package: string;
  severity: string;
  title: string;
  url: string;
  allowlistStatus: 'new' | 'expired' | 'allowed';
  reason?: string;
  expiresOn?: string;
}

/**
 * Complete analysis result from processing npm audit output
 * against the allowlist
 */
export interface AnalysisResult {
  vulnerabilities: VulnerabilityInfo[];
  allowedVulnerabilities: VulnerabilityInfo[];
  expiredAllowlistEntries: VulnerabilityInfo[];
  expiringEntries: VulnerabilityInfo[];
  isSuccessful: boolean;
}

/**
 * Canonical vulnerability representation
 *
 * This is the standardized internal format that all npm audit formats
 * are normalized to, regardless of the original npm version format.
 */
export interface CanonicalVulnerability {
  id: string;
  package: string;
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  url: string;
  vulnerableVersions: string;
  source: 'npm-v6' | 'npm-v7+';
}

/**
 * Canonical npm audit report representation
 *
 * This is the standardized internal format that replaces NpmAuditResult
 * for the new schema-driven parsing approach. All npm audit formats
 * are normalized to this structure.
 */
export interface CanonicalNpmAuditReport {
  vulnerabilities: CanonicalVulnerability[];
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
  };
}
