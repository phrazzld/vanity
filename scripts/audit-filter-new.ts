#!/usr/bin/env node
/**
 * Security vulnerability allowlist filter script - CLI wrapper
 *
 * This script is a wrapper around the core audit-filter logic that handles:
 * - Reading the allowlist file from the filesystem
 * - Executing npm audit --json
 * - Reporting results via console logging
 * - Setting the appropriate exit code
 *
 * The core logic has been extracted to src/lib/audit-filter/core.ts for testability.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import process from 'process';

import { analyzeAuditReport } from '../src/lib/audit-filter/core';
import type { VulnerabilityInfo } from '../src/lib/audit-filter/types';
import { logger, createLogContext } from '../src/lib/logger';
import { nanoid } from 'nanoid';

// Path to the allowlist file
const ALLOWLIST_PATH = join(process.cwd(), '.audit-allowlist.json');

/**
 * Reads the allowlist file from the filesystem
 *
 * @param allowlistPath Path to the allowlist file
 * @returns Content of the allowlist file as a string, or null if not found
 */
function readAllowlistFile(allowlistPath: string): string | null {
  try {
    if (!existsSync(allowlistPath)) {
      console.log(
        'Allowlist file not found. All high/critical vulnerabilities will fail the audit.'
      );
      logger.info(
        'Allowlist file not found, using strict mode',
        createLogContext('scripts/audit-filter-new', 'readAllowlistFile', {
          allowlist_path: allowlistPath,
        })
      );
      return null;
    }

    const content = readFileSync(allowlistPath, 'utf-8');
    logger.info(
      'Successfully loaded allowlist file',
      createLogContext('scripts/audit-filter-new', 'readAllowlistFile', {
        allowlist_path: allowlistPath,
        content_size: content.length,
      })
    );
    return content;
  } catch (error) {
    console.error('Error loading allowlist:', (error as Error).message);
    logger.error(
      'Failed to read allowlist file',
      createLogContext('scripts/audit-filter-new', 'readAllowlistFile', {
        allowlist_path: allowlistPath,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

/**
 * Executes npm audit --json and returns the output
 *
 * @returns The JSON output from npm audit
 */
function executeNpmAudit(): string {
  try {
    return execSync('npm audit --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (error) {
    // npm audit exits with non-zero code when it finds vulnerabilities
    // We need to parse the output and make our own decision
    if (error && typeof error === 'object' && 'stdout' in error) {
      try {
        const stdout = (error as { stdout: string }).stdout;
        return stdout;
      } catch (parseError) {
        console.error('Error parsing npm audit output:', (parseError as Error).message);
        process.exit(1);
      }
    }

    console.error('Error running npm audit:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Logs the results of the analysis
 *
 * @param analysisResult The analysis result to log
 */
function logResults(analysisResult: {
  vulnerabilities: VulnerabilityInfo[];
  allowedVulnerabilities: VulnerabilityInfo[];
  expiredAllowlistEntries: VulnerabilityInfo[];
  expiringEntries: VulnerabilityInfo[];
  isSuccessful: boolean;
}): void {
  const {
    vulnerabilities,
    allowedVulnerabilities,
    expiredAllowlistEntries,
    expiringEntries,
    isSuccessful,
  } = analysisResult;

  if (isSuccessful) {
    console.log('✅ Security scan passed!');

    // Show allowed vulnerabilities
    if (allowedVulnerabilities.length > 0) {
      console.log(`\n${allowedVulnerabilities.length} allowlisted vulnerabilities found:`);
      allowedVulnerabilities.forEach(vuln => {
        console.log(`  - ${vuln.package}@${vuln.id} (${vuln.severity}): ${vuln.title}`);
        console.log(`    Reason: ${vuln.reason}`);
        if (vuln.expiresOn) {
          console.log(`    Expires: ${vuln.expiresOn}`);
        }
      });
    }

    // Show warnings for entries expiring soon
    if (expiringEntries.length > 0) {
      console.log('\n⚠️  Warning: The following allowlist entries will expire within 30 days:');
      expiringEntries.forEach(entry => {
        console.log(`  - ${entry.package}@${entry.id} expires on ${entry.expiresOn}`);
      });
    }
  } else {
    console.error('❌ Security scan failed!');

    // Show new vulnerabilities
    if (vulnerabilities.length > 0) {
      console.error(
        `\nFound ${vulnerabilities.length} non-allowlisted high/critical vulnerabilities:`
      );
      vulnerabilities.forEach(vuln => {
        console.error(`  - ${vuln.package}@${vuln.id} (${vuln.severity}): ${vuln.title}`);
        console.error(`    URL: ${vuln.url}`);
      });
    }

    // Show expired allowlist entries
    if (expiredAllowlistEntries.length > 0) {
      console.error(`\n${expiredAllowlistEntries.length} allowlist entries have expired:`);
      expiredAllowlistEntries.forEach(entry => {
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

/**
 * Main execution function
 */
function main(): void {
  const startTime = Date.now();
  const correlationId = nanoid();

  console.log('🔒 Running npm audit with allowlist filtering...');

  logger.info(
    'Security audit script started',
    createLogContext('scripts/audit-filter-new', 'main', {
      correlation_id: correlationId,
      allowlist_path: ALLOWLIST_PATH,
    })
  );

  try {
    // Read the allowlist file
    const allowlistContent = readAllowlistFile(ALLOWLIST_PATH);

    // Execute npm audit
    const auditOutput = executeNpmAudit();

    // Get current date
    const currentDate = new Date();

    // Analyze the audit results
    const analysisResult = analyzeAuditReport(auditOutput, allowlistContent, currentDate);

    // Log the results
    logResults(analysisResult);

    logger.info(
      'Security audit script completed',
      createLogContext('scripts/audit-filter-new', 'main', {
        correlation_id: correlationId,
        execution_time: Date.now() - startTime,
        success: analysisResult.isSuccessful,
        vulnerabilities_found: analysisResult.vulnerabilities.length,
        allowed_vulnerabilities: analysisResult.allowedVulnerabilities.length,
        expired_entries: analysisResult.expiredAllowlistEntries.length,
      })
    );

    // Exit with appropriate code
    process.exit(analysisResult.isSuccessful ? 0 : 1);
  } catch (error) {
    console.error('Error analyzing audit results:', (error as Error).message);
    logger.error(
      'Security audit script failed',
      createLogContext('scripts/audit-filter-new', 'main', {
        correlation_id: correlationId,
        execution_time: Date.now() - startTime,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

// Execute the script
main();
