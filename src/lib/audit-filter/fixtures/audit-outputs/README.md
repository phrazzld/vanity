# NPM Audit Output Test Fixtures

This directory contains example npm audit outputs in various formats to support testing of the audit-filter parsing functionality.

## File Structure

- `npm-v6-*.json` - Examples of npm v6 audit output format
- `npm-v7-*.json` - Examples of npm v7+ audit output format
- `canonical-*.json` - Expected canonical format after parsing

## Usage

These fixtures document the expected structure of npm audit outputs and can be used in tests to verify parsing behavior across different npm versions.

## NPM Version Differences

### npm v6 Format

- Uses `advisories` object with numeric IDs as keys
- Contains `module_name` field for package names
- Metadata includes vulnerability counts by severity

### npm v7+ Format

- Uses `vulnerabilities` object with package names as keys
- Contains `via` array for vulnerability details
- Includes `fixAvailable` information
- More detailed dependency chain information
