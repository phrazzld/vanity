# T035 Implementation Plan

## Task: Fix Jest test discovery pattern to exclude non-test files

### Problem

Jest is incorrectly discovering and attempting to run non-test files as test suites, including:

- Test fixture files (`auditOutputs.ts`, `normalizerTestData.ts`)
- Configuration files (`jest.config.js`, `jest.setup.js`, `setup.ts`)

### Solution Approach

Update Jest configuration in `jest.config.js` to use explicit `testMatch` patterns that only discover actual test files.

### Implementation Steps

1. Review current Jest configuration
2. Add explicit `testMatch` patterns to include only `*.test.ts` and `*.spec.ts` files
3. Ensure configuration excludes fixture files, setup files, and config files
4. Test the configuration to verify it only discovers actual test files

### Expected Changes

- Update `jest.config.js` with proper `testMatch` configuration
- Maintain all existing test functionality while excluding non-test files

### Success Criteria

- Jest only discovers files matching `*.test.ts` or `*.spec.ts` patterns
- Pre-push hooks pass without "Test suite failed to run" errors for non-test files
- All legitimate test files continue to run correctly

### Philosophy Adherence

- Simplicity: Use explicit patterns rather than complex exclusion rules
- Automation: Fix CI/CD pipeline to prevent future test discovery issues
- Quality Gates: Ensure configuration maintains test coverage and functionality
