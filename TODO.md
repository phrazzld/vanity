# Audit Filter Enhancement Todo List

## Foundations: Core Refactoring & Testing

- [x] **T001 · Refactor · P0: Refactor `audit-filter.ts` for testability**

  - **Action:**
    1. Extract all core logic into pure functions/classes, decoupling from CLI entry point
    2. Ensure all dependencies (fs, child_process, etc.) are injected or mockable
    3. Make core functions exportable and testable in isolation
  - **Done-when:**
    1. CLI entry point delegates entirely to imported functions
    2. Core functionality can be imported and tested without running the CLI
  - **Depends-on:** none

- [x] **T002 · Test · P0: Set up mocking for external dependencies**

  - **Action:**
    1. Implement Jest mocks for `child_process.execSync`, `fs.readFileSync`, and `fs.existsSync`
    2. Ensure consistent mock behavior across all tests
  - **Done-when:**
    1. All tests run without touching filesystem or spawning real processes
    2. Mock configurations are reusable across test suites
  - **Depends-on:** [T001]

- [x] **T003 · Test · P0: Implement Jest tests for npm audit output scenarios**

  - **Action:**
    1. Write tests covering no vulnerabilities, high/critical vulnerabilities, and allowlisted items
    2. Mock npm audit responses with different output formats
  - **Done-when:**
    1. All npm audit scenarios are covered by tests
    2. Tests contribute to >90% code coverage goal
  - **Depends-on:** [T001, T002]

- [x] **T004 · Test · P0: Implement Jest tests for allowlist file scenarios**

  - **Action:**
    1. Write tests covering missing, empty, malformed, and invalid schema allowlist files
    2. Test expiration date behavior, including invalid formats
  - **Done-when:**
    1. All allowlist file scenarios are covered by tests
    2. Tests contribute to >90% code coverage goal
  - **Depends-on:** [T001, T002, T009]

- [x] **T005 · Test · P0: Implement tests for exit codes and logging output**
  - **Action:**
    1. Verify correct exit codes for success, vulnerability found, and error conditions
    2. Validate logging output format and content for each scenario
  - **Done-when:**
    1. Exit code behavior is fully tested
    2. Logging output tests are implemented
  - **Depends-on:** [T001, T002]

## Security Policy Enforcement

- [x] **T006 · Bugfix · P0: Enforce expiration dates on allowlist entries**

  - **Action:**
    1. Update `isAllowlistEntryExpired` to treat undefined/missing expiration dates as expired
    2. Add validation to ensure all allowlist entries have valid expiration dates
  - **Done-when:**
    1. Allowlist entries without expiration dates fail validation
    2. Unit tests verify this specific behavior
  - **Depends-on:** [T001]

- [x] **T007 · Feature · P0: Implement schema validation for allowlist file**

  - **Action:**
    1. Add zod or ajv for schema validation
    2. Define a formal schema for the allowlist JSON structure
  - **Done-when:**
    1. Allowlist file is validated against a defined schema
    2. Invalid files are rejected with clear error messages
  - **Depends-on:** [T001]

- [x] **T008 · Feature · P0: Validate required fields and date formats**
  - **Action:**
    1. Enforce presence of required fields (id, package, reason, expires)
    2. Add strict validation for date format (ISO 8601 UTC)
  - **Done-when:**
    1. All required fields are enforced by schema
    2. Invalid date formats are rejected
  - **Depends-on:** [T007]

## Error Handling & Robustness

- [x] **T009 · Feature · P1: Exit with clear error on corrupt allowlist**

  - **Action:**
    1. Add proper error handling for malformed JSON in allowlist
    2. Ensure descriptive error messages are shown
  - **Done-when:**
    1. Script exits with non-zero status on corrupt allowlist
    2. Error message clearly indicates the nature of the problem
  - **Depends-on:** [T007, T008]

- [x] **T010 · Refactor · P1: Improve npm audit output parsing**

  - **Action:**
    1. Make parsing more robust against different npm audit formats
    2. Handle format variations gracefully
  - **Done-when:**
    1. Parser handles various npm versions' output
    2. Tests verify compatibility with multiple formats
  - **Depends-on:** [T001]

- [x] **T011 · Feature · P1: Add structured error logging**
  - **Action:**
    1. Ensure all error conditions produce structured logs
    2. Include context like filenames, error types in logs
  - **Done-when:**
    1. All error conditions produce consistent, structured output
    2. Tests verify error logging behavior
  - **Depends-on:** [T012]

## Observability & Logging

- [x] **T012 · Refactor · P1: Implement structured logging**

  - **Action:**
    1. Replace all console.log/error calls with structured logger
    2. Use winston, pino, or project standard library
  - **Done-when:**
    1. No console.log/error calls remain in production code
    2. All logs are structured and machine-parseable
  - **Depends-on:** [T001]

- [x] **T013 · Feature · P1: Add standard fields to all logs**

  - **Action:**
    1. Ensure all logs include timestamp, level, service name, message
    2. Add correlation ID support where applicable
  - **Done-when:**
    1. All logs follow a consistent structure
    2. Required fields are present in all log entries
  - **Depends-on:** [T012]

- [x] **T014 · Feature · P1: Sanitize sensitive data in logs**
  - **Action:**
    1. Ensure vulnerability details are not exposed in CI logs
    2. Log only minimal identifiers (package, ID, severity)
  - **Done-when:**
    1. CI logs don't contain detailed vulnerability information
    2. Sensitive data is properly redacted
  - **Depends-on:** [T012]

## Date Handling & Timezone Safety

- [x] **T015 · Feature · P1: Standardize date operations on UTC**

  - **Action:**
    1. Integrate a robust date library (date-fns or similar)
    2. Ensure all date operations use UTC consistently
  - **Done-when:**
    1. All date handling is timezone-independent
    2. Tests verify correct behavior across timezones
  - **Depends-on:** none

- [x] **T016 · Refactor · P1: Make expiration logic timezone-independent**
  - **Action:**
    1. Update expiration checking to use UTC dates
    2. Ensure consistent behavior regardless of server timezone
  - **Done-when:**
    1. Expiration checks produce same results regardless of timezone
    2. Tests verify timezone independence
  - **Depends-on:** [T006, T015]

## Type Safety Improvements

- [x] **T017 · Refactor · P1: Replace unsafe type assertions**

  - **Action:**
    1. Remove `as` casts where possible
    2. Add proper type guards and runtime validation
  - **Done-when:**
    1. Minimal type assertions remain in codebase
    2. Those that do are documented and justified
  - **Depends-on:** [T001]

- [x] **T018 · Chore · P2: Include security script in main TypeScript checking**

  - **Action:**
    1. Update tsconfig.json to include audit-filter.ts
    2. Ensure it's checked by the main project typechecker
  - **Done-when:**
    1. audit-filter.ts is type-checked with main project
    2. CI type checking includes security scripts
  - **Depends-on:** none

- [x] **T019 · Chore · P2: Remove --skipLibCheck from build**
  - **Action:**
    1. Remove skipLibCheck from build processes
    2. Fix any type errors that arise
  - **Done-when:**
    1. Build passes without skipLibCheck flag
  - **Depends-on:** [T018]

## CI/CD Integration

- [x] **T020 · Feature · P2: Add security scan to pre-push hook**

  - **Action:**
    1. Update pre-push Git hook to run security scan
    2. Ensure fast feedback on failures
  - **Done-when:**
    1. Pushing code with security issues is blocked
    2. Clear error messages guide developers
  - **Depends-on:** [T012]

- [x] **T021 · Test · P2: Verify CI pass/fail behavior**
  - **Action:**
    1. Create test cases that demonstrate CI passing and failing
    2. Document evidence of proper CI behavior
  - **Done-when:**
    1. Pass/fail scenarios are documented with evidence
    2. CI behavior is proven to work as expected
  - **Depends-on:** [T003, T004]

## Documentation & Developer Experience

- [x] **T022 · Docs · P2: Update allowlist documentation**

  - **Action:**
    1. Document allowlist schema requirements
    2. Clarify expiration policy and date format
  - **Done-when:**
    1. Documentation is clear and complete
    2. Examples match actual requirements
  - **Depends-on:** [T006, T007, T008]

- [x] **T023 · Docs · P2: Document structured logging**
  - **Action:**
    1. Document logging format and required fields
    2. Explain log level usage
  - **Done-when:**
    1. Logging approach is well-documented
  - **Depends-on:** [T013]

## Technical Debt & Cleanup

- [x] **T024 · Chore · P3: Remove example data from production**

  - **Action:**
    1. Replace example entries in allowlist with documentation
    2. Move examples to documentation or test fixtures
  - **Done-when:**
    1. No example data in production allowlist
  - **Depends-on:** [T022]

- [x] **T025 · Chore · P3: Add Node.js version specification**

  - **Action:**
    1. Add engines field to package.json
    2. Document supported Node.js versions
  - **Done-when:**
    1. Node.js version constraints are documented
  - **Depends-on:** none

- [x] **T026 · Chore · P3: Streamline build verification**

  - **Action:**
    1. Remove redundant build verification steps
    2. Consolidate verification processes where possible
  - **Done-when:**
    1. Build process is efficient with no redundancy
  - **Depends-on:** none

- [x] **T027 · Chore · P3: Clean up planning artifacts**

  - **Action:**
    1. Remove temporary planning files
    2. Archive completed documentation
  - **Done-when:**
    1. No unused planning files remain
  - **Depends-on:** none

- [x] **T028 · Chore · P1: Fix ESLint configuration for test files**

  - **Action:**
    1. Update ESLint configuration to properly handle Jest globals and Node.js globals
    2. Refactor test files to use proper ESLint comments or configurations
    3. Ensure all test files pass linting without warnings
  - **Done-when:**
    1. All test files pass ESLint checks without errors/warnings
    2. No need to use --no-verify when committing test files
  - **Depends-on:** [T002]

- [x] **T029 · Chore · P2: Clean up unused test variables**
  - **Action:**
    1. Review all test files for unused variables and either use them or prefix with underscore
    2. Convert unused test data into reusable test fixtures or remove if not needed
    3. Ensure all test files pass linting without unused variable warnings
  - **Done-when:**
    1. No unused variable warnings remain in test files
    2. Test data is properly organized and reusable
  - **Depends-on:** [T028]

## Pre-Push Hook Fixes

- [x] **T035 · Bugfix · P1: Fix Jest test discovery pattern to exclude non-test files**

  - **Action:**
    1. Update Jest configuration to only discover actual test files (_.test.ts, _.spec.ts)
    2. Exclude data files, configuration files, and setup files from test discovery
    3. Add proper testMatch patterns to prevent Jest from running non-test files
  - **Done-when:**
    1. Jest only discovers and runs actual test files
    2. Test fixture files and configuration files are not executed as tests
    3. Pre-push hooks pass without "Test suite failed to run" errors
  - **Depends-on:** none

- [x] **T036 · Refactor · P1: Move test fixture files outside **tests** directory structure**

  - **Action:**
    1. Move fixtures/test-data/ directory from src/lib/audit-filter/**tests**/ to src/lib/audit-filter/
    2. Update all import paths in test files to reference the new location
    3. Ensure Jest ignores the new fixtures location for test discovery
  - **Done-when:**
    1. Test fixture files are no longer in **tests** directories
    2. All test imports work correctly with new paths
    3. Jest does not attempt to run fixture files as tests
  - **Depends-on:** [T035]

- [x] **T037 · Bugfix · P2: Fix nanoid ES module import issues in remaining integration tests**

  - **Action:**
    1. Add proper nanoid mocking to integration test files that still fail
    2. Update Jest configuration to handle nanoid ES module imports consistently
    3. Ensure all audit-filter tests can run in Jest environment
  - **Done-when:**
    1. All integration tests run without ES module import errors
    2. Nanoid is properly mocked across all test suites
    3. No "Cannot use import statement outside a module" errors remain
  - **Depends-on:** [T035, T036]

- [ ] **T038 · Refactor · P1: Rename or relocate Jest configuration files that Jest mistakenly runs as tests**
  - **Action:**
    1. Remove or rename jest.config.js and jest.setup.js files from **tests** directories
    2. Move setup.ts files outside of **tests** directories if they're not actual tests
    3. Ensure Jest configuration files don't match test discovery patterns
  - **Done-when:**
    1. No Jest configuration files are discovered as test suites
    2. Test setup and configuration works correctly
    3. Jest only runs actual test files, not configuration files
  - **Depends-on:** [T035]
