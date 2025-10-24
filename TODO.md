# TODO: Fix Zustand Mock Activation (P1 Critical)

## Context

**Critical Issue Discovered**: The Zustand manual mock at `src/__mocks__/zustand.ts` is **never actually loaded** because Jest requires an explicit `jest.mock('zustand')` call to activate manual mocks. Without this, all tests import the real Zustand implementation, and the state reset logic never executes.

**Impact**: Test isolation claimed by PR #71 is not actually achieved. Tests pass only because selector pattern fixes prevented infinite loops, not because of proper state isolation.

**Root Cause**: Jest auto-loads mocks from `__mocks__/` directories **only for node_modules** when explicitly mocked. Our mock at `src/__mocks__/zustand.ts` requires manual activation.

**Evidence**: PR review comment from Codex - https://github.com/phrazzld/vanity/pull/71

## Implementation Tasks

- [x] Add jest.mock('zustand') to activate manual mock

  ```
  File: jest.setup.js:181-186 (after browser API mocks section)
  Approach: Add jest.mock('zustand') call immediately after browser mocks
  Location: After IntersectionObserver/ResizeObserver mocks, before store comment
  Code to add:
    // =============================================================================
    // Zustand Manual Mock Activation
    // =============================================================================

    // Activate manual mock from src/__mocks__/zustand.ts
    // Jest requires explicit mock() call for manual mocks to load
    // Without this, tests import real Zustand and state bleeds between tests
    jest.mock('zustand');

  Why needed: Jest only auto-loads __mocks__ for node_modules; manual activation required
  Success criteria: Mock loads, storeResetFns populates, afterEach executes
  Test: Run ui.test.ts - should see mock being used (verify with debug logging)
  Time: 5min
  Work Log:
  - Added jest.mock('zustand') in jest.setup.js at line 194
  - Fixed circular dependency by updating mock imports
  - Changed from 'export * from zustand' to direct import
  - Mock now loads successfully without infinite loop
  Commit: 3662439
  ```

- [x] Add test case to verify store state isolation actually works

  ```
  File: src/store/__tests__/ui.test.ts:470+ (end of test suite)
  Approach: Add new test that would fail without proper state isolation
  Test logic:
    describe('State Isolation', () => {
      it('should reset store state between tests', () => {
        // Set state in first "test"
        const { result: result1 } = renderHook(() => useUIStore(state => ({
          setDarkMode: state.setDarkMode,
          isDarkMode: state.isDarkMode,
        })));

        act(() => {
          result1.current.setDarkMode(true);
        });

        expect(result1.current.isDarkMode).toBe(true);

        // Simulate test boundary - mock should reset state
        // In real scenario, afterEach would run here

        // In second "test", verify state is reset
        const { result: result2 } = renderHook(() => useUIStore(state => ({
          isDarkMode: state.isDarkMode,
        })));

        // If mock is working, state should be reset to initial (false)
        // If mock not working, state would still be true from previous test
        expect(result2.current.isDarkMode).toBe(false);
      });
    });

  Why needed: Explicitly verifies state isolation instead of assuming it works
  Success criteria: Test passes, proves mock resets state between test boundaries
  Note: This test documents the expected behavior for future developers
  Time: 15min
  Work Log:
  - Added two tests in 'State Isolation' describe block
  - Test 1 modifies state, Test 2 verifies it resets
  - Initial attempt used single test with two hooks (failed - state persists within test)
  - Corrected to two separate tests to verify afterEach reset
  - All 18 tests now pass (16 original + 2 new)
  Commit: 3662439
  ```

- [x] Add debug logging to verify mock loading (temporary)

  ```
  File: src/__mocks__/zustand.ts:1 (top of file, after imports)
  Approach: Add console.log at module load and in afterEach
  Code to add:
    // TEMPORARY DEBUG: Verify mock is loading
    console.log('[ZUSTAND MOCK] Manual mock loaded from src/__mocks__/zustand.ts');

    // ... existing code ...

    // In afterEach block, update to:
    afterEach(() => {
      console.log(`[ZUSTAND MOCK] Resetting ${storeResetFns.size} store(s)`);
      act(() => {
        storeResetFns.forEach(resetFn => {
          resetFn();
        });
      });
    });

  Why needed: Empirical verification that mock is actually loading and executing
  Success criteria: Console output appears during test runs
  Test: npm test -- ui.test.ts | grep "ZUSTAND MOCK"
  Note: Remove after verification (next task)
  Time: 3min
  Work Log:
  - Added console.log at module load and in afterEach
  - Verified mock loads: "[ZUSTAND MOCK] Manual mock loaded..."
  - Verified resets run: "[ZUSTAND MOCK] Resetting 1 store(s)"
  - Confirmed afterEach executes after each test
  Commit: 3662439
  ```

- [x] Remove debug logging after verification

  ```
  File: src/__mocks__/zustand.ts
  Approach: Remove console.log statements added in previous task
  Code to remove:
    - console.log('[ZUSTAND MOCK] Manual mock loaded...')
    - console.log(`[ZUSTAND MOCK] Resetting ${storeResetFns.size} store(s)`)

  Why needed: Clean code without debug noise
  Success criteria: No console.log statements in mock, tests still pass
  Time: 2min
  Work Log:
  - Removed console.log from module load
  - Removed console.log from afterEach
  - Added timing documentation to afterEach comment
  - All 345 tests still pass
  Commit: 3662439
  ```

- [x] Update PR #71 technical documentation

  ```
  File: src/__mocks__/zustand.ts:1-12 (header comment)
  Approach: Add note about manual activation requirement
  Update comment to include:
    /**
     * Zustand Mock for Jest Testing
     *
     * Provides automatic state reset between tests to prevent state bleeding.
     * Based on official Zustand testing guide: https://zustand.docs.pmnd.rs/guides/testing
     *
     * IMPORTANT: This manual mock must be explicitly activated in jest.setup.js
     * with jest.mock('zustand'). Jest does NOT auto-load manual mocks from
     * src/__mocks__/ - they require explicit activation.
     *
     * Usage:
     * - jest.setup.js contains jest.mock('zustand') to activate this mock
     * - Jest automatically uses this mock when tests import from 'zustand'
     * - All stores created during tests will be reset after each test
     */

  Why needed: Prevent future confusion about mock activation requirements
  Success criteria: Clear documentation of Jest manual mock behavior
  Time: 5min
  Work Log:
  - Updated header comment with IMPORTANT section
  - Explained jest.mock('zustand') activation requirement
  - Added usage instructions pointing to jest.setup.js
  - Documented timing of afterEach reset
  Commit: 3662439
  ```

## Success Criteria

**Core Fix Verified**:

- ✅ jest.mock('zustand') added to jest.setup.js (line 194)
- ✅ Mock loads during test runs (verified via debug output)
- ✅ afterEach reset logic executes (verified via debug output)
- ✅ storeResetFns Set populates with store instances
- ✅ New test case proves state isolation works (2 tests added)
- ✅ All 16 existing tests still pass
- ✅ Documentation updated to prevent future confusion

**Quality Gates**:

- ✅ Full test suite passes (345 tests - up from 343)
- ✅ No regressions from adding mock activation
- ✅ State isolation proven empirically, not assumed
- ✅ Future developers understand activation requirement

**All tasks completed successfully in commit 3662439**

## Module Boundaries

**Modified Module**: `jest.setup.js`

- **Change**: Add single line jest.mock('zustand')
- **Impact**: Activates manual mock, enables state isolation
- **Risk**: Low - activating intended behavior

**Enhanced Module**: `src/__mocks__/zustand.ts`

- **Change**: Updated documentation only
- **Impact**: Clearer understanding of activation requirements
- **Value**: Prevents future confusion about Jest manual mocks

**New Test**: State isolation verification

- **Ownership**: Proves mock works correctly
- **Value**: Empirical evidence vs assumption

## Time Estimate

Total: 30 minutes

- Mock activation: 5min
- State isolation test: 15min
- Debug logging add/remove: 5min
- Documentation: 5min

## References

- [Jest Manual Mocks Documentation](https://jestjs.io/docs/manual-mocks)
- [Zustand Testing Guide](https://zustand.docs.pmnd.rs/guides/testing)
- [PR #71 Codex Review Comment](https://github.com/phrazzld/vanity/pull/71)

## Notes

**Why This Matters**:

- Without activation, entire PR #71 premise is invalid
- Tests pass for wrong reason (selector fix, not state isolation)
- Future store tests would have same hidden issue
- This is P1 merge-blocking - cannot merge without this fix

**What We're NOT Doing**:

- Moving mock to root `__mocks__/` (works fine in src/ with activation)
- Rewriting tests (they're correct, just need proven isolation)
- Changing mock implementation (implementation is correct)

**Learning**:

- Jest manual mocks require explicit jest.mock() call
- `__mocks__/` auto-loading only works for node_modules
- Always verify mocks load, don't assume
