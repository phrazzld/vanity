# CI Resolution Plan

## Problem Statement

The CI is failing due to 21 snapshot test failures across 2 test files in the Vanity project. The snapshots are failing in the CI environment but pass locally.

## Root Cause Analysis

1. **Snapshot Mismatch**: The test snapshots stored in the repository don't match what the tests are generating in CI
2. **Missing Snapshots**: Recent commit removed snapshot files as obsolete, but tests still require them
3. **Environment Differences**: Potential differences between local and CI environments affecting rendered output

## Resolution Strategy

### Immediate Actions

1. **Restore Snapshot Files**
   - The snapshots were incorrectly identified as obsolete and removed
   - Need to regenerate the correct snapshot files
2. **Update Snapshots Locally**
   - Run `npm test -- -u` to update all snapshots
   - Commit the updated snapshot files to the repository
3. **Verify Snapshot Content**
   - Ensure the generated snapshots match expected component rendering
   - Check for environment-specific differences

### Technical Steps

1. **Generate New Snapshots**

   ```bash
   npm test -- -u src/app/components/__tests__/SearchBar.snapshot.test.tsx src/app/components/__tests__/DarkModeToggle.snapshot.test.tsx
   ```

2. **Verify Generated Files**

   - Check that snapshot files are created in `src/app/components/__tests__/__snapshots__/`
   - Ensure content looks correct

3. **Commit Snapshot Files**

   - Stage the new snapshot files
   - Create a commit with proper conventional commit message

4. **Push Changes**
   - Push the commit to trigger CI
   - Verify CI passes

## Prevention Measures

1. **Snapshot Management**
   - Don't delete snapshot files without verifying they're truly obsolete
   - Always run tests locally before committing snapshot changes
2. **CI/Local Parity**
   - Ensure local test runs match CI environment
   - Use `CI=true npm test` locally to simulate CI behavior

## Expected Outcome

- All snapshot tests pass in CI
- PR can be merged successfully
- Future snapshot management is more careful

## Risk Mitigation

- If snapshots continue to fail, investigate environment differences
- Consider using visual regression testing tools for more stability
- Document snapshot update process in CONTRIBUTING.md
