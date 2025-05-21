#!/usr/bin/env node
/**
 * Security vulnerability allowlist filter script
 *
 * This script runs npm audit --json, filters the results against an allowlist,
 * and exits with an error code only for non-allowlisted high/critical vulnerabilities.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import process from 'process';

// Path to the allowlist file
const ALLOWLIST_PATH = join(process.cwd(), '.audit-allowlist.json');

// TypeScript interfaces
interface AllowlistEntry {
  id: string;
  package: string;
  reason: string;
  notes?: string;
  expires?: string;
  reviewedOn?: string;
}

interface Advisory {
  id: number | string;
  module_name: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  url: string;
  vulnerable_versions: string;
}

interface NpmAuditResult {
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

interface VulnerabilityInfo {
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
 * Loads and parses the allowlist file
 */
function loadAllowlist(): AllowlistEntry[] {
  try {
    if (!existsSync(ALLOWLIST_PATH)) {
      console.log(
        'Allowlist file not found. All high/critical vulnerabilities will fail the audit.'
      );
      return [];
    }

    const allowlistContent = readFileSync(ALLOWLIST_PATH, 'utf-8');
    return JSON.parse(allowlistContent) as AllowlistEntry[];
  } catch (error) {
    console.error('Error loading allowlist:', (error as Error).message);
    return [];
  }
}

/**
 * Executes npm audit --json and returns the parsed results
 */
function runNpmAudit(): NpmAuditResult {
  try {
    const auditOutput = execSync('npm audit --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return JSON.parse(auditOutput) as NpmAuditResult;
  } catch (error) {
    // npm audit exits with non-zero code when it finds vulnerabilities
    // We need to parse the output and make our own decision
    if (error && typeof error === 'object' && 'stdout' in error) {
      try {
        const stdout = (error as { stdout: string }).stdout;
        return JSON.parse(stdout) as NpmAuditResult;
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
 * Checks if an allowlist entry has expired
 */
function isAllowlistEntryExpired(entry: AllowlistEntry): boolean {
  if (!entry.expires) return false;

  const expirationDate = new Date(entry.expires);
  const today = new Date();

  return expirationDate < today;
}

/**
 * Checks if an allowlist entry will expire soon (within the next 30 days)
 */
function willExpireSoon(entry: AllowlistEntry): boolean {
  if (!entry.expires) return false;

  const expirationDate = new Date(entry.expires);
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  return expirationDate > today && expirationDate <= thirtyDaysFromNow;
}

/**
 * Finds a matching allowlist entry for a vulnerability
 */
function findAllowlistEntry(
  advisory: Advisory,
  allowlist: AllowlistEntry[]
): AllowlistEntry | undefined {
  return allowlist.find(
    entry => entry.id === advisory.id.toString() && entry.package === advisory.module_name
  );
}

/**
 * Main function that runs the audit and filters results
 */
function main() {
  console.log('🔒 Running npm audit with allowlist filtering...');

  // Load the allowlist
  const allowlist = loadAllowlist();

  // Run npm audit
  const auditResult = runNpmAudit();

  // Process vulnerabilities
  const vulnerabilities: VulnerabilityInfo[] = [];
  const allowedVulnerabilities: VulnerabilityInfo[] = [];
  const expiredAllowlistEntries: VulnerabilityInfo[] = [];

  // Track if any allowlist entries are expiring soon
  const expiringEntries: VulnerabilityInfo[] = [];

  // Process each advisory
  for (const advisoryId in auditResult.advisories) {
    const advisory = auditResult.advisories[advisoryId];

    // Skip if advisory is undefined or doesn't have a severity property
    if (!advisory || typeof advisory !== 'object') {
      continue;
    }

    // We only care about high and critical vulnerabilities
    if (advisory.severity !== 'high' && advisory.severity !== 'critical') {
      continue;
    }

    // Find matching allowlist entry
    const allowlistEntry = findAllowlistEntry(advisory, allowlist);

    if (!allowlistEntry) {
      // New vulnerability not in allowlist
      vulnerabilities.push({
        id: advisory.id,
        package: advisory.module_name,
        severity: advisory.severity,
        title: advisory.title,
        url: advisory.url,
        allowlistStatus: 'new',
      });
    } else if (isAllowlistEntryExpired(allowlistEntry)) {
      // Expired allowlist entry
      expiredAllowlistEntries.push({
        id: advisory.id,
        package: advisory.module_name,
        severity: advisory.severity,
        title: advisory.title,
        url: advisory.url,
        allowlistStatus: 'expired',
        reason: allowlistEntry.reason,
        expiresOn: allowlistEntry.expires,
      });
    } else {
      // Allowed vulnerability
      allowedVulnerabilities.push({
        id: advisory.id,
        package: advisory.module_name,
        severity: advisory.severity,
        title: advisory.title,
        url: advisory.url,
        allowlistStatus: 'allowed',
        reason: allowlistEntry.reason,
        expiresOn: allowlistEntry.expires,
      });

      // Check if it will expire soon
      if (willExpireSoon(allowlistEntry)) {
        expiringEntries.push({
          id: advisory.id,
          package: advisory.module_name,
          severity: advisory.severity,
          title: advisory.title,
          url: advisory.url,
          allowlistStatus: 'allowed',
          reason: allowlistEntry.reason,
          expiresOn: allowlistEntry.expires,
        });
      }
    }
  }

  // Display results
  if (vulnerabilities.length === 0 && expiredAllowlistEntries.length === 0) {
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

    process.exit(0);
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

    process.exit(1);
  }
}

main();
