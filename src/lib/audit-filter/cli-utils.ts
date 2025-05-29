/**
 * CLI utilities for audit-filter
 *
 * Extracted functions from the main CLI script to enable testing
 * without actually running the full CLI process.
 */

import { execSync } from 'child_process';
import { analyzeAuditReport } from './core';
import { logger } from '../logger';
import type { AnalysisResult, VulnerabilityInfo } from './types';

/**
 * Sanitized vulnerability data for logging (removes sensitive details)
 */
interface SanitizedVulnerability {
  package: string;
  id: string | number;
  severity: string;
}

/**
 * Type guard to check if an error is from execSync with stdout
 */
function isExecSyncError(error: unknown): error is { stdout: string; status?: number } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'stdout' in error &&
    typeof (error as Record<string, unknown>).stdout === 'string'
  );
}

/**
 * Sanitize vulnerability data for logging to prevent sensitive data exposure
 * Only includes minimal identifiers as per T014 requirements
 */
function sanitizeVulnerabilityForLogging(vuln: VulnerabilityInfo): SanitizedVulnerability {
  return {
    package: vuln.package,
    id: vuln.id,
    severity: vuln.severity,
    // title, url, reason, and other details are excluded to prevent sensitive data exposure
  };
}

/**
 * Execute npm audit and return the output
 *
 * @returns JSON string output from npm audit command
 */
export function executeNpmAudit(): string {
  logger.debug('Executing npm audit command', {
    function_name: 'executeNpmAudit',
    module_name: 'audit-filter/cli-utils',
    command: 'npm audit --json',
  });

  try {
    const output = execSync('npm audit --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    logger.debug('npm audit command completed successfully', {
      function_name: 'executeNpmAudit',
      module_name: 'audit-filter/cli-utils',
      output_length: output.length,
    });

    return output;
  } catch (error) {
    // npm audit exits with non-zero code when it finds vulnerabilities
    // We need to parse the output and make our own decision
    if (isExecSyncError(error)) {
      logger.debug('npm audit returned vulnerabilities (expected)', {
        function_name: 'executeNpmAudit',
        module_name: 'audit-filter/cli-utils',
        output_length: error.stdout.length,
        exit_code: error.status,
      });

      return error.stdout;
    }

    // If it's not the expected error format, rethrow
    const errorMessage = `Error executing npm audit: ${error instanceof Error ? error.message : 'Unknown error'}`;
    logger.error(
      'npm audit execution failed',
      {
        function_name: 'executeNpmAudit',
        module_name: 'audit-filter/cli-utils',
      },
      error instanceof Error ? error : new Error(String(error))
    );

    throw new Error(errorMessage);
  }
}

/**
 * Analyze npm audit results against an allowlist
 *
 * @param auditOutput - The JSON output from npm audit
 * @param allowlistContent - The JSON content of the allowlist, or null if not found
 * @param currentDate - The current date for expiration checks
 * @returns Analysis results
 */
export function analyzeResults(
  auditOutput: string,
  allowlistContent: string | null,
  currentDate: Date
): AnalysisResult {
  logger.debug('Analyzing audit results', {
    function_name: 'analyzeResults',
    module_name: 'audit-filter/cli-utils',
    has_allowlist: allowlistContent !== null,
    audit_output_length: auditOutput.length,
    analysis_date: currentDate.toISOString(),
  });

  const result = analyzeAuditReport(auditOutput, allowlistContent, currentDate);

  logger.info('Audit analysis completed', {
    function_name: 'analyzeResults',
    module_name: 'audit-filter/cli-utils',
    is_successful: result.isSuccessful,
    vulnerabilities_count: result.vulnerabilities.length,
    allowed_vulnerabilities_count: result.allowedVulnerabilities.length,
    expired_entries_count: result.expiredAllowlistEntries.length,
    expiring_entries_count: result.expiringEntries.length,
  });

  return result;
}

/**
 * Determine the appropriate exit code based on analysis results
 *
 * @param results - The analysis results
 * @returns 0 for success, 1 for failures
 */
export function getExitCode(results: AnalysisResult): number {
  // Exit with code 1 if there are new vulnerabilities or expired allowlist entries
  const exitCode = results.isSuccessful ? 0 : 1;

  logger.debug('Determined exit code', {
    function_name: 'getExitCode',
    module_name: 'audit-filter/cli-utils',
    exit_code: exitCode,
    is_successful: results.isSuccessful,
    reason: results.isSuccessful ? 'scan_passed' : 'vulnerabilities_or_expired_entries_found',
  });

  return exitCode;
}

/**
 * Display results to the console
 *
 * @param results - The analysis results to display
 * @param useLegacyOutput - If true, use legacy console output for backward compatibility
 */
export function displayResults(results: AnalysisResult, useLegacyOutput = false): void {
  // Always use structured logging for operational visibility
  logStructuredResults(results);

  // Use legacy output if requested (for CLI or test compatibility)
  if (useLegacyOutput) {
    displayLegacyResults(results);
  }
}

/**
 * Display results using structured logging
 */
function logStructuredResults(results: AnalysisResult): void {
  if (results.isSuccessful) {
    logger.info('Security scan passed', {
      function_name: 'logStructuredResults',
      module_name: 'audit-filter/cli-utils',
      scan_result: 'success',
      allowed_vulnerabilities_count: results.allowedVulnerabilities.length,
      expiring_entries_count: results.expiringEntries.length,
    });

    // Log allowed vulnerabilities for operational visibility
    if (results.allowedVulnerabilities.length > 0) {
      logger.info(`Found ${results.allowedVulnerabilities.length} allowlisted vulnerabilities`, {
        function_name: 'logStructuredResults',
        module_name: 'audit-filter/cli-utils',
        vulnerabilities: results.allowedVulnerabilities.map(sanitizeVulnerabilityForLogging),
      });
    }

    // Log warnings for entries expiring soon
    if (results.expiringEntries.length > 0) {
      logger.warn('Allowlist entries expiring within 30 days', {
        function_name: 'logStructuredResults',
        module_name: 'audit-filter/cli-utils',
        expiring_entries: results.expiringEntries.map(entry => ({
          package: entry.package,
          id: entry.id,
          severity: entry.severity,
          // expires_on removed to avoid potential sensitive timing information
        })),
      });
    }
  } else {
    logger.error('Security scan failed', {
      function_name: 'logStructuredResults',
      module_name: 'audit-filter/cli-utils',
      scan_result: 'failure',
      vulnerabilities_count: results.vulnerabilities.length,
      expired_entries_count: results.expiredAllowlistEntries.length,
    });

    // Log new vulnerabilities
    if (results.vulnerabilities.length > 0) {
      logger.error(
        `Found ${results.vulnerabilities.length} non-allowlisted high/critical vulnerabilities`,
        {
          function_name: 'logStructuredResults',
          module_name: 'audit-filter/cli-utils',
          vulnerabilities: results.vulnerabilities.map(sanitizeVulnerabilityForLogging),
        }
      );
    }

    // Log expired allowlist entries
    if (results.expiredAllowlistEntries.length > 0) {
      logger.error(`${results.expiredAllowlistEntries.length} allowlist entries have expired`, {
        function_name: 'logStructuredResults',
        module_name: 'audit-filter/cli-utils',
        expired_entries: results.expiredAllowlistEntries.map(sanitizeVulnerabilityForLogging),
      });
    }
  }
}

/**
 * Display results using legacy console output for backward compatibility
 */
function displayLegacyResults(results: AnalysisResult): void {
  if (results.isSuccessful) {
    console.log('✅ Security scan passed!');

    // Show allowed vulnerabilities
    if (results.allowedVulnerabilities.length > 0) {
      console.log(`\n${results.allowedVulnerabilities.length} allowlisted vulnerabilities found:`);
      results.allowedVulnerabilities.forEach(vuln => {
        console.log(`  - ${vuln.package}@${vuln.id} (${vuln.severity}): ${vuln.title}`);
        console.log(`    Reason: ${vuln.reason}`);
        if (vuln.expiresOn) {
          console.log(`    Expires: ${vuln.expiresOn}`);
        }
      });
    }

    // Show warnings for entries expiring soon
    if (results.expiringEntries.length > 0) {
      console.log('\n⚠️  Warning: The following allowlist entries will expire within 30 days:');
      results.expiringEntries.forEach(entry => {
        console.log(`  - ${entry.package}@${entry.id} expires on ${entry.expiresOn}`);
      });
    }
  } else {
    console.error('❌ Security scan failed!');

    // Show new vulnerabilities
    if (results.vulnerabilities.length > 0) {
      console.error(
        `\nFound ${results.vulnerabilities.length} non-allowlisted high/critical vulnerabilities:`
      );
      results.vulnerabilities.forEach(vuln => {
        console.error(`  - ${vuln.package}@${vuln.id} (${vuln.severity}): ${vuln.title}`);
        console.error(`    URL: ${vuln.url}`);
      });
    }

    // Show expired allowlist entries
    if (results.expiredAllowlistEntries.length > 0) {
      console.error(`\n${results.expiredAllowlistEntries.length} allowlist entries have expired:`);
      results.expiredAllowlistEntries.forEach(entry => {
        console.error(`  - ${entry.package}@${entry.id} (${entry.severity}): ${entry.title}`);
        console.error(`    Reason was: ${entry.reason}`);
        console.error(`    Expired on: ${entry.expiresOn}`);
      });
    }

    console.error('\nTo fix this issue:');
    console.error('1. Update dependencies to resolve vulnerabilities');
    console.error('2. Or add entries to .audit-allowlist.json with proper justification');
  }
}
