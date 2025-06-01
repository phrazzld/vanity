# T036 Implementation Plan

## Task: Move test fixture files outside **tests** directory structure

### Current State

- **Fixtures location:** `/src/lib/audit-filter/__tests__/fixtures/`
- **Test files importing fixtures:**
  - `core.enhanced.test.ts` imports from `./fixtures/test-data/auditOutputs`
  - `npmAudit.normalizers.test.ts` imports from `./fixtures/test-data/normalizerTestData`
- **Directory structure to move:**
  ```
  fixtures/
  ├── audit-outputs/
  │   ├── README.md
  │   ├── glance.md
  │   └── npm-v6-single-advisory.json
  ├── example-allowlist.json
  ├── glance.md
  └── test-data/
      ├── auditOutputs.ts
      ├── glance.md
      └── normalizerTestData.ts
  ```

### Implementation Steps

1. **Pre-move verification**

   - Run all audit-filter tests to establish baseline
   - Verify current test count and passing status

2. **Move fixtures directory**

   - Use git mv to move fixtures from `__tests__/` to parent directory
   - Command: `git mv src/lib/audit-filter/__tests__/fixtures src/lib/audit-filter/fixtures`

3. **Update import paths in test files**

   - Update `core.enhanced.test.ts`:
     - From: `'./fixtures/test-data/auditOutputs'`
     - To: `'../fixtures/test-data/auditOutputs'`
   - Update `npmAudit.normalizers.test.ts`:
     - From: `'./fixtures/test-data/normalizerTestData'`
     - To: `'../fixtures/test-data/normalizerTestData'`

4. **Update Jest configuration (if needed)**

   - Add fixtures to testPathIgnorePatterns if Jest tries to discover them
   - Update collectCoverageFrom to exclude fixtures if needed

5. **Post-move verification**
   - Run all audit-filter tests to ensure they still pass
   - Verify Jest doesn't try to run fixture files
   - Check that imports resolve correctly

### Test Strategy

- **Before move:** Run `npm test -- src/lib/audit-filter/__tests__` to baseline
- **After each step:** Run same command to verify nothing broke
- **Final verification:** Run full test suite to ensure no side effects

### Risk Mitigation

- Use git mv to preserve history
- Make atomic commits after each successful step
- If issues arise, can revert individual commits

### Expected File Changes

- Directory move: `__tests__/fixtures/` → `fixtures/`
- Import updates in 2 test files
- Potentially jest.config.js if fixtures need exclusion

### Success Criteria

- All tests pass after move
- Fixtures are no longer in **tests** directory
- Jest doesn't attempt to run fixture files
- Import paths work correctly
- Git history preserved for moved files

### Philosophy Alignment

- **Simplicity:** Direct move with minimal changes
- **Explicit:** Clear import path updates
- **Testability:** Maintain all test functionality
- **Automation:** Use git tooling for proper tracking
