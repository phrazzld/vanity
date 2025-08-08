# NPM Audit Output Formats

This document describes the different npm audit JSON output formats across npm versions, their key differences, and migration considerations.

## Version Summary

| npm Version  | Format Version | Key Identifier          | Major Changes                                           |
| ------------ | -------------- | ----------------------- | ------------------------------------------------------- |
| v6.x         | v1             | `advisories` object     | Original format with advisory-centric structure         |
| v7.x - v8.x  | v2             | `auditReportVersion: 2` | Package-centric structure with `vulnerabilities` object |
| v9.x - v10.x | v2             | `auditReportVersion: 2` | Same as v7-8, minor field additions                     |

## npm v6 Format (Legacy)

### Structure

```json
{
  "advisories": {
    "<advisory-id>": {
      "id": 118,
      "module_name": "package-name",
      "severity": "moderate",
      "title": "Vulnerability Title",
      "url": "https://npmjs.com/advisories/118",
      "vulnerable_versions": "<0.6.0",
      "patched_versions": ">=0.6.0",
      "findings": [
        {
          "version": "0.5.0",
          "paths": ["package-a > package-b > vulnerable-package"]
        }
      ]
    }
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 1,
      "high": 0,
      "critical": 0,
      "total": 1
    },
    "dependencies": 1234,
    "devDependencies": 567
  }
}
```

### Key Characteristics

- Advisory-centric: organized by vulnerability ID
- Uses `module_name` instead of `name`
- Simple severity levels
- Basic dependency path information

## npm v7+ Format (Current)

### Structure

```json
{
  "auditReportVersion": 2,
  "vulnerabilities": {
    "package-name": {
      "name": "package-name",
      "severity": "moderate",
      "isDirect": false,
      "via": [
        {
          "source": 1181493,
          "name": "package-name",
          "dependency": "package-name",
          "title": "Vulnerability Title",
          "url": "https://github.com/advisories/GHSA-xxxx",
          "severity": "moderate",
          "cwe": ["CWE-200"],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/..."
          },
          "range": "<0.6.0"
        }
      ],
      "effects": ["dependent-package"],
      "range": "<0.6.0",
      "nodes": ["node_modules/package-name"],
      "fixAvailable": {
        "name": "root-package",
        "version": "2.88.2",
        "isSemVerMajor": false
      }
    }
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 1,
      "high": 0,
      "critical": 0,
      "total": 1
    },
    "dependencies": {
      "prod": 196,
      "dev": 1523,
      "optional": 107,
      "peer": 1,
      "peerOptional": 0,
      "total": 1752
    }
  }
}
```

### Key Characteristics

- Package-centric: organized by package name
- `auditReportVersion: 2` identifier
- Complex `via` field (can be string[] or object[])
- Detailed vulnerability information (CWE, CVSS)
- Rich fix information with semver impact

## Version-Specific Differences

### npm v7 (Released Oct 2020)

- Introduced `auditReportVersion: 2`
- Complete restructure from advisory-centric to package-centric
- Added `fixAvailable` field
- Enhanced dependency chain tracking

### npm v8 (Released Oct 2021)

- Maintained v7 format
- Added optional `cvss` field in via objects
- Improved `cwe` array support
- Minor performance improvements

### npm v9 (Released Oct 2022)

- Maintained core v7+ structure
- Added `funding` metadata (optional)
- Enhanced peer dependency reporting
- Improved workspace support

### npm v10 (Released Oct 2023)

- Maintained v7+ format
- Via field can mix strings and objects
- Additional metadata fields for dependencies
- Better monorepo support

## Migration Considerations

### v6 to v7+ Migration

1. **Key Structure Change**: `advisories` → `vulnerabilities`
2. **Package Names**: `module_name` → `name`
3. **Vulnerability Details**: Simple fields → nested `via` array
4. **Fix Information**: Basic patches → detailed `fixAvailable`

### Handling Mixed Formats

The `via` field in v7+ can contain:

- **Strings**: References to other vulnerable packages (indirect vulnerabilities)
- **Objects**: Detailed vulnerability information (direct sources)

Example:

```json
"via": [
  "@eslint/plugin-kit",  // String reference
  {                      // Detailed object
    "source": 1106734,
    "title": "ReDoS vulnerability",
    // ...
  }
]
```

## Detection Strategy

```javascript
function detectNpmAuditFormat(data) {
  // npm v6: has "advisories" key
  if ('advisories' in data) {
    return 'npm-v6';
  }

  // npm v7+: has "vulnerabilities" key
  if ('vulnerabilities' in data) {
    return 'npm-v7+';
  }

  // Unknown format
  return 'unknown';
}
```

## Testing Recommendations

1. **Create fixtures** for each major version format
2. **Test edge cases**:
   - Empty vulnerability lists
   - Mixed via types (v10+)
   - Missing optional fields
   - Large dependency trees
3. **Validate parsing** across version boundaries
4. **Monitor deprecations** in npm changelog

## References

- [npm v7 Changelog](https://github.com/npm/cli/releases/tag/v7.0.0)
- [npm v8 Changelog](https://github.com/npm/cli/releases/tag/v8.0.0)
- [npm v9 Changelog](https://github.com/npm/cli/releases/tag/v9.0.0)
- [npm v10 Changelog](https://github.com/npm/cli/releases/tag/v10.0.0)
- [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
