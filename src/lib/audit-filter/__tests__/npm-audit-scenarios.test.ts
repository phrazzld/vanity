/**
 * Tests for npm audit output scenarios
 *
 * These tests verify the audit-filter module correctly handles different
 * npm audit output formats and vulnerability scenarios.
 */

import { parseNpmAuditJson, analyzeAuditReport } from '../core';
import {
  createCleanAuditResult,
  createHighVulnerabilitiesAuditResult,
  createCriticalVulnerabilitiesAuditResult,
  createMixedVulnerabilitiesAuditResult,
  createMalformedAuditResult,
  createEmptyAuditResult,
  createMockAllowlist,
} from '../__mocks__/mockHelpers';

// Import fail from Jest to be used in conditionals

const { fail } = expect as any;

// Set up a reference date for testing
const CURRENT_DATE = new Date('2023-01-01');

// Create test allowlist entries
const VALID_ALLOWLIST = createMockAllowlist([
  {
    id: '1234',
    package: 'vulnerable-package-1',
    reason: 'Test reason 1',
    expires: '2099-01-01',
  },
  {
    id: '9012',
    package: 'vulnerable-package-3',
    reason: 'Test reason 3',
    expires: '2099-01-01',
  },
]);

describe('npm audit output parsing', () => {
  test('should parse clean audit output', () => {
    const cleanAudit = createCleanAuditResult();
    const result = parseNpmAuditJson(cleanAudit);

    expect(result).toHaveProperty('advisories');
    expect(result).toHaveProperty('metadata.vulnerabilities');
    expect(Object.keys(result.advisories)).toHaveLength(0);
    expect(result.metadata.vulnerabilities.total).toBe(0);
    expect(result.metadata.vulnerabilities.high).toBe(0);
    expect(result.metadata.vulnerabilities.critical).toBe(0);
  });

  test('should parse audit output with high vulnerabilities', () => {
    const highVulnAudit = createHighVulnerabilitiesAuditResult();
    const result = parseNpmAuditJson(highVulnAudit);

    expect(Object.keys(result.advisories)).toHaveLength(2);
    expect(result.metadata.vulnerabilities.high).toBe(2);
    expect(result.metadata.vulnerabilities.critical).toBe(0);

    // Check that specific vulnerabilities exist and are correctly structured
    expect(result.advisories['1234']).toBeDefined();
    expect(result.advisories['5678']).toBeDefined();

    // Verify vulnerability details
    if (result.advisories['1234']) {
      expect(result.advisories['1234'].module_name).toBe('vulnerable-package-1');
      expect(result.advisories['1234'].severity).toBe('high');
    } else {
      fail('Expected advisory 1234 to exist');
    }
  });

  test('should parse audit output with critical vulnerabilities', () => {
    const criticalVulnAudit = createCriticalVulnerabilitiesAuditResult();
    const result = parseNpmAuditJson(criticalVulnAudit);

    expect(Object.keys(result.advisories)).toHaveLength(1);
    expect(result.metadata.vulnerabilities.high).toBe(0);
    expect(result.metadata.vulnerabilities.critical).toBe(1);

    // Verify vulnerability details
    if (result.advisories['9012']) {
      expect(result.advisories['9012'].module_name).toBe('vulnerable-package-3');
      expect(result.advisories['9012'].severity).toBe('critical');
    } else {
      fail('Expected advisory 9012 to exist');
    }
  });

  test('should parse audit output with mixed severity vulnerabilities', () => {
    const mixedVulnAudit = createMixedVulnerabilitiesAuditResult();
    const result = parseNpmAuditJson(mixedVulnAudit);

    expect(Object.keys(result.advisories)).toHaveLength(3);
    expect(result.metadata.vulnerabilities.high).toBe(1);
    expect(result.metadata.vulnerabilities.critical).toBe(1);
    expect(result.metadata.vulnerabilities.moderate).toBe(1);
    expect(result.metadata.vulnerabilities.total).toBe(3);

    // Verify all severity types are present
    const severities = Object.values(result.advisories).map(adv => adv.severity);
    expect(severities).toContain('moderate');
    expect(severities).toContain('high');
    expect(severities).toContain('critical');
  });

  test('should throw error for malformed JSON', () => {
    const malformedAudit = createMalformedAuditResult();
    expect(() => parseNpmAuditJson(malformedAudit)).toThrow(
      'Failed to parse npm audit output as JSON'
    );
  });

  test('should throw error for empty output', () => {
    const emptyAudit = createEmptyAuditResult();
    expect(() => parseNpmAuditJson(emptyAudit)).toThrow();
  });

  test('should throw error for missing advisories field', () => {
    const missingAdvisories = JSON.stringify({
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

    expect(() => parseNpmAuditJson(missingAdvisories)).toThrow(
      'missing or invalid advisories field'
    );
  });

  test('should throw error for missing metadata field', () => {
    const missingMetadata = JSON.stringify({
      advisories: {},
    });

    expect(() => parseNpmAuditJson(missingMetadata)).toThrow('missing or invalid metadata field');
  });

  test('should throw error for missing vulnerabilities field', () => {
    const missingVulnerabilities = JSON.stringify({
      advisories: {},
      metadata: {},
    });

    expect(() => parseNpmAuditJson(missingVulnerabilities)).toThrow(
      'missing or invalid metadata.vulnerabilities field'
    );
  });

  test('should handle audit output with non-object advisories', () => {
    // Create an audit with advisories as an array (invalid format)
    const invalidAdvisories = JSON.stringify({
      advisories: [],
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

    expect(() => parseNpmAuditJson(invalidAdvisories)).toThrow(
      'missing or invalid advisories field'
    );
  });
});

describe('npm audit output analysis', () => {
  test('should correctly analyze clean audit output', () => {
    const cleanAudit = createCleanAuditResult();
    const result = analyzeAuditReport(cleanAudit, VALID_ALLOWLIST, CURRENT_DATE);

    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(true);
  });

  test('should correctly analyze audit with high vulnerabilities', () => {
    const highVulnAudit = createHighVulnerabilitiesAuditResult();
    const result = analyzeAuditReport(highVulnAudit, VALID_ALLOWLIST, CURRENT_DATE);

    // Should find one allowed vulnerability and one new vulnerability
    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.allowedVulnerabilities).toHaveLength(1);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(false); // Fails due to non-allowlisted vulnerability

    // Verify the allowed vulnerability is the one in the allowlist
    if (result.allowedVulnerabilities.length > 0) {
      expect(result.allowedVulnerabilities[0].id).toBe(1234);
      expect(result.allowedVulnerabilities[0].package).toBe('vulnerable-package-1');
      expect(result.allowedVulnerabilities[0].allowlistStatus).toBe('allowed');
    } else {
      fail('Expected allowedVulnerabilities to have at least one entry');
    }

    // Verify the new vulnerability is the one not in the allowlist
    if (result.vulnerabilities.length > 0) {
      expect(result.vulnerabilities[0].id).toBe(5678);
      expect(result.vulnerabilities[0].package).toBe('vulnerable-package-2');
      expect(result.vulnerabilities[0].allowlistStatus).toBe('new');
    } else {
      fail('Expected vulnerabilities to have at least one entry');
    }
  });

  test('should correctly analyze audit with critical vulnerabilities', () => {
    const criticalVulnAudit = createCriticalVulnerabilitiesAuditResult();
    const result = analyzeAuditReport(criticalVulnAudit, VALID_ALLOWLIST, CURRENT_DATE);

    // The critical vulnerability is in the allowlist
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(1);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(true);

    // Verify the allowed vulnerability details
    if (result.allowedVulnerabilities.length > 0) {
      expect(result.allowedVulnerabilities[0].id).toBe(9012);
      expect(result.allowedVulnerabilities[0].package).toBe('vulnerable-package-3');
      expect(result.allowedVulnerabilities[0].severity).toBe('critical');
      expect(result.allowedVulnerabilities[0].allowlistStatus).toBe('allowed');
    } else {
      fail('Expected allowedVulnerabilities to have at least one entry');
    }
  });

  test('should ignore moderate and low severity vulnerabilities', () => {
    const mixedVulnAudit = createMixedVulnerabilitiesAuditResult();
    const result = analyzeAuditReport(mixedVulnAudit, VALID_ALLOWLIST, CURRENT_DATE);

    // Should only include high and critical vulnerabilities in the result
    const totalVulnerabilities =
      result.vulnerabilities.length +
      result.allowedVulnerabilities.length +
      result.expiredAllowlistEntries.length;

    // The mixed vulnerabilities include moderate (which should be ignored)
    expect(totalVulnerabilities).toBe(2); // Only high and critical

    // Verify we don't have any moderate vulnerabilities in any category
    const allVulnerabilities = [
      ...result.vulnerabilities,
      ...result.allowedVulnerabilities,
      ...result.expiredAllowlistEntries,
    ];

    const hasModerateSeverity = allVulnerabilities.some(v => v.severity === 'moderate');
    expect(hasModerateSeverity).toBe(false);
  });

  test('should handle audit with all vulnerabilities in allowlist', () => {
    // Create a custom allowlist that covers all vulnerabilities in our test data
    const completeAllowlist = createMockAllowlist([
      {
        id: '1234',
        package: 'vulnerable-package-1',
        reason: 'Test reason 1',
        expires: '2099-01-01',
      },
      {
        id: '5678',
        package: 'vulnerable-package-2',
        reason: 'Test reason 2',
        expires: '2099-01-01',
      },
      {
        id: '9012',
        package: 'vulnerable-package-3',
        reason: 'Test reason 3',
        expires: '2099-01-01',
      },
    ]);

    const highVulnAudit = createHighVulnerabilitiesAuditResult();
    const result = analyzeAuditReport(highVulnAudit, completeAllowlist, CURRENT_DATE);

    // All vulnerabilities should be allowed, none new or expired
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(2);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(true);
  });

  test('should handle missing allowlist', () => {
    const highVulnAudit = createHighVulnerabilitiesAuditResult();
    const result = analyzeAuditReport(highVulnAudit, null, CURRENT_DATE);

    // All high/critical vulnerabilities should be reported as new when no allowlist
    expect(result.vulnerabilities).toHaveLength(2);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(false);
  });

  test('should handle empty allowlist', () => {
    const highVulnAudit = createHighVulnerabilitiesAuditResult();
    const emptyAllowlist = createMockAllowlist([]);
    const result = analyzeAuditReport(highVulnAudit, emptyAllowlist, CURRENT_DATE);

    // All high/critical vulnerabilities should be reported as new with empty allowlist
    expect(result.vulnerabilities).toHaveLength(2);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(false);
  });

  test('should pass with no vulnerabilities and missing allowlist', () => {
    const cleanAudit = createCleanAuditResult();
    const result = analyzeAuditReport(cleanAudit, null, CURRENT_DATE);

    // No vulnerabilities means success, even with no allowlist
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(true);
  });
});
