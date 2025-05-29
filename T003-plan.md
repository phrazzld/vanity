# T003 - Implement Jest tests for npm audit output scenarios

## Overview

This document outlines the plan for implementing comprehensive Jest tests for npm audit output scenarios for the audit-filter script. The goal is to ensure all potential npm audit output formats are properly handled by our filter, including both success and failure cases.

## Existing State

The audit-filter module has:

1. The main script (`scripts/audit-filter.ts`) that runs npm audit and filters results
2. A refactored core module (`src/lib/audit-filter/core.ts`) with pure functions
3. Type definitions (`src/lib/audit-filter/types.ts`)
4. Mock implementations for external dependencies:
   - `child_process` for npm audit execution
   - `fs` for file system operations
5. Some existing tests for both core functions and integration

## Testing Requirements

According to the task, we need to:

1. Write tests covering various npm audit output scenarios:
   - No vulnerabilities (clean result)
   - High/critical vulnerabilities
   - Allowlisted items
   - Mix of allowlisted and non-allowlisted vulnerabilities
   - Expired allowlist entries
2. Mock npm audit responses with different output formats:
   - Standard output
   - Error scenarios
   - Malformed outputs
   - Empty results

The tests should contribute to the >90% code coverage goal for the feature.

## Testing Approach

Following the project's Development Philosophy and TypeScript guidance:

1. We'll implement tests using Jest (the project's chosen test framework)
2. We'll utilize the existing mock infrastructure for `child_process` and `fs`
3. Tests will focus on behavior, not implementation details
4. We'll mock only true external dependencies (fs, child_process) as per policy
5. We'll use the provided mock helpers to create realistic test scenarios
6. We'll ensure tests are independent, isolated, and repeatable

## Implementation Plan

We will create the following test files:

1. **`src/lib/audit-filter/__tests__/npm-audit-scenarios.test.ts`**:

   - Tests for handling various npm audit output formats
   - Verifies parsing and processing of different vulnerability types
   - Tests scenarios like clean audit, high/critical vulnerabilities, mixed severities

2. **`src/lib/audit-filter/__tests__/allowlist-integration.test.ts`**:

   - Tests for interactions between npm audit outputs and allowlist entries
   - Scenarios like vulnerabilities with matching allowlist, expired allowlist, etc.
   - Verifies correct classification and status reporting

3. Update existing integration test with more comprehensive scenarios.

## Test Scenarios

We will implement tests for the following scenarios:

### 1. npm Audit Output Scenarios

- Clean npm audit (no vulnerabilities)
- Audit with high severity vulnerabilities
- Audit with critical vulnerabilities
- Audit with mixed severity vulnerabilities (including moderate/low which should be ignored)
- Malformed npm audit output JSON
- Empty npm audit output
- Unexpected format that still contains the required fields
- Missing required fields in the audit output

### 2. Allowlist Integration Scenarios

- Clean audit with empty allowlist
- Audit with all high/critical vulnerabilities in allowlist (should pass)
- Audit with only some vulnerabilities in allowlist (should fail)
- Audit with vulnerabilities that have expired allowlist entries (should fail)
- Audit with vulnerabilities with allowlist entries expiring soon (should pass with warning)
- Interactions with malformed allowlist
- Edge cases for date handling (leap years, timezone issues)

## Implementation Details

- Use the mock helpers from `src/lib/audit-filter/__mocks__/` to create test scenarios
- Ensure tests validate both successful and failure paths
- Verify correct status code returns (0 for pass, 1 for fail)
- Test the classification of vulnerabilities into the correct categories
- Ensure all code paths in the core.ts module are covered

## Success Criteria

- All npm audit scenarios are covered by tests
- Tests contribute to >90% code coverage goal
- Tests align with the project's testing philosophy
- Tests focus on behavior, not implementation details
- Tests verify both happy path and error conditions
