/**
 * Common utilities for mocking external dependencies in tests
 * 
 * This module provides helper functions for setting up and managing mocks
 * for the audit-filter tests. It includes:
 * - Type definitions for mock scenarios
 * - Factory functions for creating mock data
 * - Utilities for resetting mocks between tests
 */

import type { SpawnSyncReturns } from 'child_process';

/**
 * Mock file system state
 */
export interface MockFileSystem {
  // Map of file paths to their contents
  files: Record<string, string>;
}

/**
 * Mock npm audit output scenarios
 */
export interface NpmAuditMockScenarios {
  // Clean result with no vulnerabilities
  clean: string;
  // Result with high severity vulnerabilities
  withHighVulnerabilities: string;
  // Result with critical severity vulnerabilities
  withCriticalVulnerabilities: string;
  // Result with mixed severity vulnerabilities
  withMixedVulnerabilities: string;
  // Malformed JSON output
  malformedJson: string;
  // Empty output
  empty: string;
}

/**
 * Factory function to create a mock npm audit clean result
 */
export function createCleanAuditResult(): string {
  return JSON.stringify({
    advisories: {},
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0,
        total: 0,
      },
    },
  });
}

/**
 * Factory function to create a mock npm audit result with high vulnerabilities
 */
export function createHighVulnerabilitiesAuditResult(): string {
  return JSON.stringify({
    advisories: {
      '1234': {
        id: 1234,
        module_name: 'vulnerable-package-1',
        severity: 'high',
        title: 'Remote Code Execution',
        url: 'https://example.com/vuln/1234',
        vulnerable_versions: '>=1.0.0 <2.0.0',
      },
      '5678': {
        id: 5678,
        module_name: 'vulnerable-package-2',
        severity: 'high',
        title: 'Prototype Pollution',
        url: 'https://example.com/vuln/5678',
        vulnerable_versions: '<1.5.0',
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 2,
        critical: 0,
        total: 2,
      },
    },
  });
}

/**
 * Factory function to create a mock npm audit result with critical vulnerabilities
 */
export function createCriticalVulnerabilitiesAuditResult(): string {
  return JSON.stringify({
    advisories: {
      '9012': {
        id: 9012,
        module_name: 'vulnerable-package-3',
        severity: 'critical',
        title: 'Remote Code Execution',
        url: 'https://example.com/vuln/9012',
        vulnerable_versions: '>=1.0.0 <3.0.0',
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 1,
        total: 1,
      },
    },
  });
}

/**
 * Factory function to create a mock npm audit result with mixed severity vulnerabilities
 */
export function createMixedVulnerabilitiesAuditResult(): string {
  return JSON.stringify({
    advisories: {
      '1234': {
        id: 1234,
        module_name: 'vulnerable-package-1',
        severity: 'high',
        title: 'Remote Code Execution',
        url: 'https://example.com/vuln/1234',
        vulnerable_versions: '>=1.0.0 <2.0.0',
      },
      '5678': {
        id: 5678,
        module_name: 'vulnerable-package-2',
        severity: 'moderate',
        title: 'Information Disclosure',
        url: 'https://example.com/vuln/5678',
        vulnerable_versions: '<1.5.0',
      },
      '9012': {
        id: 9012,
        module_name: 'vulnerable-package-3',
        severity: 'critical',
        title: 'Remote Code Execution',
        url: 'https://example.com/vuln/9012',
        vulnerable_versions: '>=1.0.0 <3.0.0',
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 1,
        high: 1,
        critical: 1,
        total: 3,
      },
    },
  });
}

/**
 * Factory function to create a mock malformed npm audit result
 */
export function createMalformedAuditResult(): string {
  return '{malformed json';
}

/**
 * Factory function to create a mock empty npm audit result
 */
export function createEmptyAuditResult(): string {
  return '';
}

/**
 * Create standard npm audit mock scenarios
 */
export function createNpmAuditMockScenarios(): NpmAuditMockScenarios {
  return {
    clean: createCleanAuditResult(),
    withHighVulnerabilities: createHighVulnerabilitiesAuditResult(),
    withCriticalVulnerabilities: createCriticalVulnerabilitiesAuditResult(),
    withMixedVulnerabilities: createMixedVulnerabilitiesAuditResult(),
    malformedJson: createMalformedAuditResult(),
    empty: createEmptyAuditResult(),
  };
}

/**
 * Factory function to create a mock allowlist file content
 */
export function createMockAllowlist(entries: Array<{
  id: string;
  package: string;
  reason: string;
  expires?: string;
  notes?: string;
  reviewedOn?: string;
}>): string {
  return JSON.stringify(entries);
}

/**
 * Create a mock execSync error object
 */
export function createExecSyncError(
  command: string,
  stdout: string,
  stderr = '',
  status = 1,
  signal: NodeJS.Signals | null = null
): SpawnSyncReturns<string> & Error {
  const error = new Error(`Command failed: ${command}`) as SpawnSyncReturns<string> & Error;
  error.status = status;
  error.signal = signal;
  error.output = [null, stdout, stderr];
  error.pid = 1234;
  error.stdout = stdout;
  error.stderr = stderr;
  return error;
}

/**
 * Create default mock file system state
 */
export function createDefaultMockFileSystem(): MockFileSystem {
  const allowlistEntries = [
    {
      id: '1234',
      package: 'vulnerable-package-1',
      reason: 'False positive, fixed in our usage',
      expires: '2099-12-31',
    },
    {
      id: '9012',
      package: 'vulnerable-package-3',
      reason: 'Working on upgrade',
      expires: '2023-06-30',
      notes: 'Priority: High - Upgrade blocked by dependency X',
    },
  ];

  return {
    files: {
      '/path/to/.audit-allowlist.json': createMockAllowlist(allowlistEntries),
      '/path/to/empty-allowlist.json': '[]',
      '/path/to/malformed-allowlist.json': '{malformed json',
    },
  };
}

/**
 * Reset all mocks to their initial state
 * Call this in beforeEach to ensure test isolation
 */
export function resetAllMocks(): void {
  jest.resetAllMocks();
}