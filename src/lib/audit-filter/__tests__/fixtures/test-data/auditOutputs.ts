/**
 * Test data builders for npm audit outputs
 *
 * These builders provide reusable test data for different npm audit scenarios
 * and versions. They document the expected structure of npm audit outputs.
 */

export const npmV6Outputs = {
  singleAdvisory: {
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
  },

  multipleAdvisories: {
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
  },

  clean: {
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
};

export const npmV7PlusOutputs = {
  singleVulnerability: {
    vulnerabilities: {
      'tunnel-agent': {
        name: 'tunnel-agent',
        severity: 'moderate',
        isDirect: false,
        fixAvailable: {
          name: 'request',
          version: '2.88.2',
          isSemVerMajor: false,
        },
        via: [
          {
            source: 1181493,
            name: 'tunnel-agent',
            dependency: 'tunnel-agent',
            title: 'Memory Exposure',
            url: 'https://github.com/advisories/GHSA-xc7v-wxcw-j472',
            severity: 'moderate',
            cwe: ['CWE-201'],
            cvss: {
              score: 5.3,
              vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
            },
            range: '<0.6.0',
          },
        ],
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
  },

  complexVulnerability: {
    vulnerabilities: {
      minimist: {
        name: 'minimist',
        severity: 'critical',
        isDirect: false,
        fixAvailable: {
          name: 'mocha',
          version: '10.2.0',
          isSemVerMajor: true,
        },
        via: [
          {
            source: 1179,
            name: 'minimist',
            dependency: 'minimist',
            title: 'Prototype Pollution',
            url: 'https://github.com/advisories/GHSA-7fhm-mqm4-2wp7',
            severity: 'critical',
            cwe: ['CWE-1321'],
            cvss: {
              score: 9.8,
              vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
            },
            range: '<0.2.4',
          },
        ],
      },
      jsonwebtoken: {
        name: 'jsonwebtoken',
        severity: 'high',
        isDirect: true,
        fixAvailable: true,
        via: [
          {
            source: 755,
            name: 'jsonwebtoken',
            dependency: 'jsonwebtoken',
            title: 'Verification bypass',
            url: 'https://npmjs.com/advisories/755',
            severity: 'high',
            range: '<8.5.1',
          },
        ],
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 1,
        critical: 1,
        total: 2,
      },
    },
  },

  clean: {
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
};

export const expectedCanonicalFormats = {
  singleAdvisory: {
    vulnerabilities: [
      {
        id: '118',
        package: 'tunnel-agent',
        severity: 'moderate',
        title: 'Memory Exposure in tunnel-agent',
        url: 'https://npmjs.com/advisories/118',
        vulnerableVersions: '<0.6.0',
        source: 'npm-v6',
      },
    ],
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
  },
};

// Edge cases and error scenarios
export const edgeCases = {
  malformedJson: 'not valid json',
  emptyJson: '{}',
  nonObjectJson: '[]',
  invalidStructure: {
    someField: 'unexpected structure',
  },
  unsupportedFormat: {
    format: 'unsupported',
    data: 'unknown',
  },
};
