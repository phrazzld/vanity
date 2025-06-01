# T036 Task Details

## Task ID: T036

## Title: Move test fixture files outside **tests** directory structure

## Original Ticket Text:

- [~] **T036 · Refactor · P1: Move test fixture files outside **tests** directory structure**

  - **Action:**
    1. Move fixtures/test-data/ directory from src/lib/audit-filter/**tests**/ to src/lib/audit-filter/
    2. Update all import paths in test files to reference the new location
    3. Ensure Jest ignores the new fixtures location for test discovery
  - **Done-when:**
    1. Test fixture files are no longer in **tests** directories
    2. All test imports work correctly with new paths
    3. Jest does not attempt to run fixture files as tests
  - **Depends-on:** [T035]

## Implementation Approach Analysis Prompt:

Analyze this refactoring task that involves restructuring test fixtures and updating imports. Consider:

1. **Current State Analysis:**

   - What files need to be moved?
   - Which test files import from these fixtures?
   - What is the current directory structure?

2. **Implementation Strategy:**

   - Order of operations for moving files
   - Pattern for updating imports
   - Jest configuration considerations

3. **Risk Assessment:**

   - What could break during this refactoring?
   - How to ensure no test functionality is lost?
   - Rollback strategy if issues arise

4. **Testing Strategy:**

   - How to verify all imports still work?
   - How to ensure Jest doesn't discover moved fixtures?
   - Pre/post move verification steps

5. **Philosophy Alignment:**
   - Keep changes simple and explicit
   - Maintain testability throughout
   - Automate verification where possible
