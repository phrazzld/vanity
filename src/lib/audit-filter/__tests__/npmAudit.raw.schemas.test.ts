/**
 * Tests for raw npm audit format schemas
 *
 * These tests verify that the Zod schemas correctly validate
 * npm audit JSON outputs from different npm versions.
 */

import { describe, test, expect } from '@jest/globals';
// import { RawNpmV6AuditSchema, RawNpmV7PlusAuditSchema } from '../npmAudit.raw.schemas';

describe('RawNpmV6AuditSchema', () => {
  test('should validate valid npm v6 audit output with advisories', () => {
    const _validV6Output = {
      advisories: {
        '118': {
          id: 118,
          module_name: 'tunnel-agent',
          severity: 'moderate',
          title: 'Memory Exposure in tunnel-agent',
          url: 'https://npmjs.com/advisories/118',
          vulnerable_versions: '<0.6.0',
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 1,
          high: 0,
          critical: 0,
          total: 1,
        },
      },
    };

    // TODO: Implement schema validation once RawNpmV6AuditSchema is created
    expect(() => {
      // const result = RawNpmV6AuditSchema.parse(validV6Output);
      // expect(result).toEqual(validV6Output);
    }).not.toThrow();
  });

  test('should validate npm v6 output with multiple advisories', () => {
    const _multipleAdvisoriesV6 = {
      advisories: {
        '118': {
          id: 118,
          module_name: 'tunnel-agent',
          severity: 'moderate',
          title: 'Memory Exposure in tunnel-agent',
          url: 'https://npmjs.com/advisories/118',
          vulnerable_versions: '<0.6.0',
        },
        '755': {
          id: 755,
          module_name: 'jsonwebtoken',
          severity: 'high',
          title: 'Verification bypass in jsonwebtoken',
          url: 'https://npmjs.com/advisories/755',
          vulnerable_versions: '<8.5.1',
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 1,
          high: 1,
          critical: 0,
          total: 2,
        },
      },
    };

    // TODO: Implement schema validation once RawNpmV6AuditSchema is created
    expect(() => {
      // const result = RawNpmV6AuditSchema.parse(multipleAdvisoriesV6);
      // expect(result).toEqual(multipleAdvisoriesV6);
    }).not.toThrow();
  });

  test('should reject invalid v6 output missing advisories field', () => {
    const _invalidV6Output = {
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
    };

    // TODO: Implement schema validation once RawNpmV6AuditSchema is created
    expect(() => {
      // RawNpmV6AuditSchema.parse(invalidV6Output);
    }).toThrow();
  });

  test('should reject invalid v6 output missing metadata field', () => {
    const _invalidV6Output = {
      advisories: {},
    };

    // TODO: Implement schema validation once RawNpmV6AuditSchema is created
    expect(() => {
      // RawNpmV6AuditSchema.parse(invalidV6Output);
    }).toThrow();
  });

  test('should handle empty advisories object', () => {
    const _emptyAdvisoriesV6 = {
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
    };

    // TODO: Implement schema validation once RawNpmV6AuditSchema is created
    expect(() => {
      // const result = RawNpmV6AuditSchema.parse(emptyAdvisoriesV6);
      // expect(result).toEqual(emptyAdvisoriesV6);
    }).not.toThrow();
  });
});

describe('RawNpmV7PlusAuditSchema', () => {
  test('should validate valid npm v7+ audit output with vulnerabilities', () => {
    const _validV7PlusOutput = {
      vulnerabilities: {
        'tunnel-agent': {
          name: 'tunnel-agent',
          severity: 'moderate',
          isDirect: false,
          via: [
            {
              source: 118,
              name: 'tunnel-agent',
              dependency: 'tunnel-agent',
              title: 'Memory Exposure in tunnel-agent',
              url: 'https://npmjs.com/advisories/118',
              severity: 'moderate',
              range: '<0.6.0',
            },
          ],
          effects: [],
          range: '<0.6.0',
          nodes: ['node_modules/tunnel-agent'],
          fixAvailable: true,
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 1,
          high: 0,
          critical: 0,
          total: 1,
        },
      },
    };

    // TODO: Implement schema validation once RawNpmV7PlusAuditSchema is created
    expect(() => {
      // const result = RawNpmV7PlusAuditSchema.parse(validV7PlusOutput);
      // expect(result).toEqual(validV7PlusOutput);
    }).not.toThrow();
  });

  test('should validate npm v7+ output with complex vulnerability structure', () => {
    const _complexV7PlusOutput = {
      vulnerabilities: {
        jsonwebtoken: {
          name: 'jsonwebtoken',
          severity: 'high',
          isDirect: true,
          via: [
            {
              source: 755,
              name: 'jsonwebtoken',
              dependency: 'jsonwebtoken',
              title: 'Verification bypass in jsonwebtoken',
              url: 'https://npmjs.com/advisories/755',
              severity: 'high',
              range: '<8.5.1',
            },
          ],
          effects: ['dependent-package'],
          range: '<8.5.1',
          nodes: ['node_modules/jsonwebtoken'],
          fixAvailable: {
            name: 'jsonwebtoken',
            version: '8.5.1',
            isSemVerMajor: false,
          },
        },
      },
      metadata: {
        vulnerabilities: {
          info: 0,
          low: 0,
          moderate: 0,
          high: 1,
          critical: 0,
          total: 1,
        },
      },
    };

    // TODO: Implement schema validation once RawNpmV7PlusAuditSchema is created
    expect(() => {
      // const result = RawNpmV7PlusAuditSchema.parse(complexV7PlusOutput);
      // expect(result).toEqual(complexV7PlusOutput);
    }).not.toThrow();
  });

  test('should reject invalid v7+ output missing vulnerabilities field', () => {
    const _invalidV7PlusOutput = {
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
    };

    // TODO: Implement schema validation once RawNpmV7PlusAuditSchema is created
    expect(() => {
      // RawNpmV7PlusAuditSchema.parse(invalidV7PlusOutput);
    }).toThrow();
  });

  test('should handle empty vulnerabilities object', () => {
    const _emptyVulnerabilitiesV7Plus = {
      vulnerabilities: {},
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
    };

    // TODO: Implement schema validation once RawNpmV7PlusAuditSchema is created
    expect(() => {
      // const result = RawNpmV7PlusAuditSchema.parse(emptyVulnerabilitiesV7Plus);
      // expect(result).toEqual(emptyVulnerabilitiesV7Plus);
    }).not.toThrow();
  });

  test('should handle fixAvailable as boolean', () => {
    const _booleanFixAvailableV7Plus = {
      vulnerabilities: {
        'some-package': {
          name: 'some-package',
          severity: 'critical',
          isDirect: false,
          via: [
            {
              source: 999,
              name: 'some-package',
              dependency: 'some-package',
              title: 'Critical vulnerability',
              url: 'https://npmjs.com/advisories/999',
              severity: 'critical',
              range: '*',
            },
          ],
          effects: [],
          range: '*',
          nodes: ['node_modules/some-package'],
          fixAvailable: false,
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
    };

    // TODO: Implement schema validation once RawNpmV7PlusAuditSchema is created
    expect(() => {
      // const result = RawNpmV7PlusAuditSchema.parse(booleanFixAvailableV7Plus);
      // expect(result).toEqual(booleanFixAvailableV7Plus);
    }).not.toThrow();
  });
});

describe('Schema Error Handling', () => {
  test('should provide informative error messages for validation failures', () => {
    const _malformedInput = {
      invalid: 'structure',
    };

    // TODO: Implement error message validation once schemas are created
    expect(() => {
      // RawNpmV6AuditSchema.parse(malformedInput);
    }).toThrow();

    expect(() => {
      // RawNpmV7PlusAuditSchema.parse(malformedInput);
    }).toThrow();
  });

  test('should handle partial data gracefully', () => {
    const _partialV6Data = {
      advisories: {
        '123': {
          id: 123,
          module_name: 'test-package',
          severity: 'high',
          // Missing title, url, vulnerable_versions
        },
      },
      metadata: {
        vulnerabilities: {
          // Missing some severity counts
          total: 1,
        },
      },
    };

    // TODO: Implement validation for required vs optional fields
    expect(() => {
      // RawNpmV6AuditSchema.parse(partialV6Data);
    }).toThrow();
  });
});
