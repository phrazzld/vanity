#!/usr/bin/env node
/**
 * Security Pipeline Validation Script
 *
 * This script systematically tests the security audit pipeline to validate
 * that it correctly handles various allowlist scenarios as specified in T046.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ORIGINAL_ALLOWLIST = '.audit-allowlist.json';
const BACKUP_ALLOWLIST = '.audit-allowlist.json.backup';
const TEST_ALLOWLISTS_DIR = 'test-allowlists';

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Missing Expiration Dates',
    file: 'missing-expires.json',
    expectedResult: 'FAIL',
    description: 'Should fail when allowlist entries lack expires field',
  },
  {
    name: 'Invalid Date Formats',
    file: 'invalid-dates.json',
    expectedResult: 'FAIL',
    description: 'Should fail with non-ISO 8601 or malformed dates',
  },
  {
    name: 'Expired Entries',
    file: 'expired-entries.json',
    expectedResult: 'FAIL',
    description: 'Should fail when allowlist entries are expired',
  },
  {
    name: 'Valid Control Case',
    file: 'valid-control.json',
    expectedResult: 'PASS',
    description: 'Should pass with valid future-dated entries',
  },
];

// Results tracking
const results = [];

/**
 * Backup the original allowlist file
 */
function backupOriginalAllowlist() {
  console.log('📋 Backing up original allowlist...');
  try {
    const originalContent = fs.readFileSync(ORIGINAL_ALLOWLIST, 'utf8');
    fs.writeFileSync(BACKUP_ALLOWLIST, originalContent);
    console.log('✅ Original allowlist backed up');
  } catch {
    console.log('ℹ️  No existing allowlist found, creating empty backup');
    fs.writeFileSync(BACKUP_ALLOWLIST, '[]');
  }
}

/**
 * Restore the original allowlist file
 */
function restoreOriginalAllowlist() {
  console.log('🔄 Restoring original allowlist...');
  try {
    const backupContent = fs.readFileSync(BACKUP_ALLOWLIST, 'utf8');
    fs.writeFileSync(ORIGINAL_ALLOWLIST, backupContent);
    fs.unlinkSync(BACKUP_ALLOWLIST);
    console.log('✅ Original allowlist restored');
  } catch (error) {
    console.error('❌ Failed to restore original allowlist:', error.message);
  }
}

/**
 * Replace allowlist with test scenario
 */
function replaceAllowlist(testFile) {
  const testPath = path.join(TEST_ALLOWLISTS_DIR, testFile);
  const testContent = fs.readFileSync(testPath, 'utf8');
  fs.writeFileSync(ORIGINAL_ALLOWLIST, testContent);
}

/**
 * Run security scan and capture result
 */
function runSecurityScan() {
  try {
    console.log('🔒 Running security scan...');
    const output = execSync('npm run security:scan', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      exitCode: 0,
      output: output,
      success: true,
    };
  } catch (error) {
    return {
      exitCode: error.status || 1,
      output: error.stdout || '',
      errorOutput: error.stderr || '',
      success: false,
    };
  }
}

/**
 * Test a single scenario
 */
function testScenario(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log(`📁 Test file: ${scenario.file}`);
  console.log(`🎯 Expected: ${scenario.expectedResult}`);

  try {
    // Replace allowlist with test scenario
    replaceAllowlist(scenario.file);

    // Run security scan
    const result = runSecurityScan();

    // Determine if result matches expectation
    const actualResult = result.success ? 'PASS' : 'FAIL';
    const testPassed = actualResult === scenario.expectedResult;

    const testResult = {
      scenario: scenario.name,
      expected: scenario.expectedResult,
      actual: actualResult,
      passed: testPassed,
      exitCode: result.exitCode,
      output: result.output,
      errorOutput: result.errorOutput || '',
    };

    results.push(testResult);

    // Display result
    if (testPassed) {
      console.log(`✅ PASSED: Got expected ${actualResult}`);
    } else {
      console.log(`❌ FAILED: Expected ${scenario.expectedResult}, got ${actualResult}`);
    }

    // Show sample output
    if (result.output) {
      console.log('📄 Output sample:', result.output.split('\n')[0]);
    }
    if (result.errorOutput) {
      console.log('⚠️  Error sample:', result.errorOutput.split('\n')[0]);
    }

    return testResult;
  } catch (error) {
    console.error(`❌ Test execution failed: ${error.message}`);
    const failedResult = {
      scenario: scenario.name,
      expected: scenario.expectedResult,
      actual: 'ERROR',
      passed: false,
      error: error.message,
    };
    results.push(failedResult);
    return failedResult;
  }
}

/**
 * Generate validation report
 */
function generateReport() {
  console.log('\n📊 VALIDATION REPORT');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log(`Overall: ${passed}/${total} tests passed\n`);

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.scenario}`);
    console.log(`   Expected: ${result.expected}`);
    console.log(`   Actual: ${result.actual}`);
    console.log(`   Result: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
    if (result.exitCode !== undefined) {
      console.log(`   Exit Code: ${result.exitCode}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  });

  // Write detailed report to file
  const reportContent = `# T046 Security Pipeline Validation Report

## Summary
- **Total Tests**: ${total}
- **Passed**: ${passed}
- **Failed**: ${total - passed}
- **Success Rate**: ${Math.round((passed / total) * 100)}%

## Test Results

${results
  .map(
    (result, index) => `
### ${index + 1}. ${result.scenario}

- **Expected**: ${result.expected}
- **Actual**: ${result.actual}  
- **Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- **Exit Code**: ${result.exitCode || 'N/A'}

**Output:**
\`\`\`
${result.output || 'No output'}
\`\`\`

${
  result.errorOutput
    ? `**Error Output:**
\`\`\`
${result.errorOutput}
\`\`\``
    : ''
}

${
  result.error
    ? `**Execution Error:**
\`\`\`
${result.error}
\`\`\``
    : ''
}
`
  )
  .join('\n')}

## Validation Status

${
  passed === total
    ? '✅ **All tests passed** - Security pipeline is working correctly'
    : `❌ **${total - passed} tests failed** - Security pipeline needs attention`
}

Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync('T046-validation-report.md', reportContent);
  console.log('📄 Detailed report saved to T046-validation-report.md');

  return passed === total;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Security Pipeline Validation');
  console.log('🎯 Objective: Validate T042-T045 security fixes work correctly\n');

  try {
    // Setup
    backupOriginalAllowlist();

    // Run all test scenarios
    for (const scenario of TEST_SCENARIOS) {
      testScenario(scenario);
    }

    // Generate report
    const allPassed = generateReport();

    // Summary
    console.log('\n🏁 VALIDATION COMPLETE');
    if (allPassed) {
      console.log('✅ All validation tests passed - Security pipeline working correctly');
      process.exit(0);
    } else {
      console.log('❌ Some validation tests failed - Review report for details');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Validation script failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    restoreOriginalAllowlist();
    console.log('🧹 Cleanup completed');
  }
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Validation interrupted - cleaning up...');
  restoreOriginalAllowlist();
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, testScenario };
