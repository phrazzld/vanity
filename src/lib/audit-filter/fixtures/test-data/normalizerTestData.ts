/**
 * Test data for npm audit normalizer tests
 *
 * These data structures document the expected inputs and outputs
 * for the normalizer functions across different npm versions.
 */

// npm v6 format test inputs
export const v6Inputs = {
  multipleAdvisories: {
    advisories: {
      '118': {
        id: 118,
        module_name: 'tunnel-agent',
        severity: 'moderate' as const,
        title: 'Memory Exposure in tunnel-agent',
        url: 'https://npmjs.com/advisories/118',
        vulnerable_versions: '<0.6.0',
      },
      '755': {
        id: 755,
        module_name: 'jsonwebtoken',
        severity: 'high' as const,
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
  },

  empty: {
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
  },

  minimal: {
    advisories: {
      '100': {
        id: 100,
        module_name: 'test-pkg',
        severity: 'low' as const,
      },
    },
    metadata: {
      vulnerabilities: {
        low: 1,
        total: 1,
      },
    },
  },

  numericId: {
    advisories: {
      '999': {
        id: 999,
        module_name: 'numeric-test',
        severity: 'critical' as const,
      },
    },
    metadata: {
      vulnerabilities: {
        critical: 1,
        total: 1,
      },
    },
  },
};

// npm v7+ format test inputs
export const v7PlusInputs = {
  multipleVulnerabilities: {
    vulnerabilities: {
      'tunnel-agent': {
        name: 'tunnel-agent',
        severity: 'moderate' as const,
        isDirect: false,
        via: [
          {
            source: 118,
            name: 'tunnel-agent',
            dependency: 'tunnel-agent',
            title: 'Memory Exposure',
            url: 'https://github.com/advisories/GHSA-xc7v-wxcw-j472',
            severity: 'moderate' as const,
            cwe: ['CWE-201'],
            cvss: {
              score: 5.3,
              vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
            },
            range: '<0.6.0',
          },
        ],
        effects: [],
        range: '<0.6.0',
        nodes: ['node_modules/tunnel-agent'],
        fixAvailable: true,
      },
      jsonwebtoken: {
        name: 'jsonwebtoken',
        severity: 'high' as const,
        isDirect: true,
        via: [
          {
            source: 755,
            name: 'jsonwebtoken',
            dependency: 'jsonwebtoken',
            title: 'Verification bypass',
            url: 'https://npmjs.com/advisories/755',
            severity: 'high' as const,
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
        moderate: 1,
        high: 1,
        critical: 0,
        total: 2,
      },
    },
  },

  empty: {
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
  },

  multipleVia: {
    vulnerabilities: {
      'multi-vuln': {
        name: 'multi-vuln',
        severity: 'critical' as const,
        isDirect: false,
        via: [
          {
            source: 100,
            name: 'multi-vuln',
            dependency: 'multi-vuln',
            title: 'First vulnerability',
            url: 'https://example.com/advisory/100',
            severity: 'high' as const,
            range: '<1.0.0',
          },
          {
            source: 101,
            name: 'multi-vuln',
            dependency: 'multi-vuln',
            title: 'Second vulnerability',
            url: 'https://example.com/advisory/101',
            severity: 'critical' as const,
            range: '<2.0.0',
          },
        ],
        effects: [],
        range: '<2.0.0',
        nodes: ['node_modules/multi-vuln'],
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
  },

  minimal: {
    vulnerabilities: {
      'minimal-pkg': {
        name: 'minimal-pkg',
        severity: 'low' as const,
        via: [
          {
            source: 200,
            title: 'Minimal vulnerability',
          },
        ],
      },
    },
    metadata: {
      vulnerabilities: {
        low: 1,
        total: 1,
      },
    },
  },
};

// Invalid/edge case test inputs
export const invalidInputs = {
  malformedV6: {
    advisories: {
      '100': {
        // Missing required fields
        severity: 'high' as const,
      },
    },
  },

  unexpectedV7Plus: {
    vulnerabilities: {
      'test-pkg': {
        name: 'test-pkg',
        // Missing via array
      },
    },
  },
};

// Expected canonical outputs
export const expectedCanonical = {
  multipleVulnerabilities: {
    vulnerabilities: [
      {
        id: '118',
        package: 'tunnel-agent',
        severity: 'moderate' as const,
        title: 'Memory Exposure in tunnel-agent',
        url: 'https://npmjs.com/advisories/118',
        vulnerableVersions: '<0.6.0',
        source: 'npm-v6' as const,
      },
      {
        id: '755',
        package: 'jsonwebtoken',
        severity: 'high' as const,
        title: 'Verification bypass in jsonwebtoken',
        url: 'https://npmjs.com/advisories/755',
        vulnerableVersions: '<8.5.1',
        source: 'npm-v6' as const,
      },
    ],
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
  },

  empty: {
    vulnerabilities: [],
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
  },
};
