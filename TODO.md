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

- [ ] **T010 · Refactor · P1: Improve npm audit output parsing**

  - **Action:**
    1. Make parsing more robust against different npm audit formats
    2. Handle format variations gracefully
  - **Done-when:**
    1. Parser handles various npm versions' output
    2. Tests verify compatibility with multiple formats
  - **Depends-on:** [T001]

- [ ] **T011 · Feature · P1: Add structured error logging**
  - **Action:**
    1. Ensure all error conditions produce structured logs
    2. Include context like filenames, error types in logs
  - **Done-when:**
    1. All error conditions produce consistent, structured output
    2. Tests verify error logging behavior
  - **Depends-on:** [T012]

## Observability & Logging

- [ ] **T012 · Refactor · P1: Implement structured logging**

  - **Action:**
    1. Replace all console.log/error calls with structured logger
    2. Use winston, pino, or project standard library
  - **Done-when:**
    1. No console.log/error calls remain in production code
    2. All logs are structured and machine-parseable
  - **Depends-on:** [T001]

- [ ] **T013 · Feature · P1: Add standard fields to all logs**

  - **Action:**
    1. Ensure all logs include timestamp, level, service name, message
    2. Add correlation ID support where applicable
  - **Done-when:**
    1. All logs follow a consistent structure
    2. Required fields are present in all log entries
  - **Depends-on:** [T012]

- [ ] **T014 · Feature · P1: Sanitize sensitive data in logs**
  - **Action:**
    1. Ensure vulnerability details are not exposed in CI logs
    2. Log only minimal identifiers (package, ID, severity)
  - **Done-when:**
    1. CI logs don't contain detailed vulnerability information
    2. Sensitive data is properly redacted
  - **Depends-on:** [T012]

## Date Handling & Timezone Safety

- [ ] **T015 · Feature · P1: Standardize date operations on UTC**

  - **Action:**
    1. Integrate a robust date library (date-fns or similar)
    2. Ensure all date operations use UTC consistently
  - **Done-when:**
    1. All date handling is timezone-independent
    2. Tests verify correct behavior across timezones
  - **Depends-on:** none

- [ ] **T016 · Refactor · P1: Make expiration logic timezone-independent**
  - **Action:**
    1. Update expiration checking to use UTC dates
    2. Ensure consistent behavior regardless of server timezone
  - **Done-when:**
    1. Expiration checks produce same results regardless of timezone
    2. Tests verify timezone independence
  - **Depends-on:** [T006, T015]

## Type Safety Improvements

- [ ] **T017 · Refactor · P1: Replace unsafe type assertions**

  - **Action:**
    1. Remove `as` casts where possible
    2. Add proper type guards and runtime validation
  - **Done-when:**
    1. Minimal type assertions remain in codebase
    2. Those that do are documented and justified
  - **Depends-on:** [T001]

- [ ] **T018 · Chore · P2: Include security script in main TypeScript checking**

  - **Action:**
    1. Update tsconfig.json to include audit-filter.ts
    2. Ensure it's checked by the main project typechecker
  - **Done-when:**
    1. audit-filter.ts is type-checked with main project
    2. CI type checking includes security scripts
  - **Depends-on:** none

- [ ] **T019 · Chore · P2: Remove --skipLibCheck from build**
  - **Action:**
    1. Remove skipLibCheck from build processes
    2. Fix any type errors that arise
  - **Done-when:**
    1. Build passes without skipLibCheck flag
  - **Depends-on:** [T018]

## CI/CD Integration

- [ ] **T020 · Feature · P2: Add security scan to pre-push hook**

  - **Action:**
    1. Update pre-push Git hook to run security scan
    2. Ensure fast feedback on failures
  - **Done-when:**
    1. Pushing code with security issues is blocked
    2. Clear error messages guide developers
  - **Depends-on:** [T012]

- [ ] **T021 · Test · P2: Verify CI pass/fail behavior**
  - **Action:**
    1. Create test cases that demonstrate CI passing and failing
    2. Document evidence of proper CI behavior
  - **Done-when:**
    1. Pass/fail scenarios are documented with evidence
    2. CI behavior is proven to work as expected
  - **Depends-on:** [T003, T004]

## Documentation & Developer Experience

- [ ] **T022 · Docs · P2: Update allowlist documentation**

  - **Action:**
    1. Document allowlist schema requirements
    2. Clarify expiration policy and date format
  - **Done-when:**
    1. Documentation is clear and complete
    2. Examples match actual requirements
  - **Depends-on:** [T006, T007, T008]

- [ ] **T023 · Docs · P2: Document structured logging**
  - **Action:**
    1. Document logging format and required fields
    2. Explain log level usage
  - **Done-when:**
    1. Logging approach is well-documented
  - **Depends-on:** [T013]

## Technical Debt & Cleanup

- [ ] **T024 · Chore · P3: Remove example data from production**

  - **Action:**
    1. Replace example entries in allowlist with documentation
    2. Move examples to documentation or test fixtures
  - **Done-when:**
    1. No example data in production allowlist
  - **Depends-on:** [T022]

- [ ] **T025 · Chore · P3: Add Node.js version specification**

  - **Action:**
    1. Add engines field to package.json
    2. Document supported Node.js versions
  - **Done-when:**
    1. Node.js version constraints are documented
  - **Depends-on:** none

- [ ] **T026 · Chore · P3: Streamline build verification**

  - **Action:**
    1. Remove redundant build verification steps
    2. Consolidate verification processes where possible
  - **Done-when:**
    1. Build process is efficient with no redundancy
  - **Depends-on:** none

- [ ] **T027 · Chore · P3: Clean up planning artifacts**

  - **Action:**
    1. Remove temporary planning files
    2. Archive completed documentation
  - **Done-when:**
    1. No unused planning files remain
  - **Depends-on:** none

- [ ] **T028 · Chore · P1: Fix ESLint configuration for test files**
  - **Action:**
    1. Update ESLint configuration to properly handle Jest globals and Node.js globals
    2. Refactor test files to use proper ESLint comments or configurations
    3. Ensure all test files pass linting without warnings
  - **Done-when:**
    1. All test files pass ESLint checks without errors/warnings
    2. No need to use --no-verify when committing test files
  - **Depends-on:** [T002]

## Assumptions & Clarifications Needed

- [ ] What is the approved structured logging library for this project?
- [ ] What should be the exact schema for allowlist entries?
- [ ] What is the minimum supported Node.js version?
- [ ] Should allowlist expiration be enforced at midnight UTC or any time on the expiration date?
- [ ] Which npm versions need to be supported by the audit output parser?
