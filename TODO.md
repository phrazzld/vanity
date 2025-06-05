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

- [x] **T038 · Refactor · P1: Rename or relocate Jest configuration files that Jest mistakenly runs as tests**
  - **Action:**
    1. Remove or rename jest.config.js and jest.setup.js files from **tests** directories
    2. Move setup.ts files outside of **tests** directories if they're not actual tests
    3. Ensure Jest configuration files don't match test discovery patterns
  - **Done-when:**
    1. No Jest configuration files are discovered as test suites
    2. Test setup and configuration works correctly
    3. Jest only runs actual test files, not configuration files
  - **Depends-on:** [T035]

## CI Pipeline Fixes

- [x] **T039 · Bugfix · P0: Add TypeScript declarations for image file modules**

  - **Action:**
    1. Create `src/types/images.d.ts` with module declarations for image file extensions
    2. Add declarations for .webp, .png, .jpg, .jpeg, .gif, .svg file imports
    3. Ensure TypeScript recognizes image imports as valid modules with string default exports
    4. Update tsconfig.json to include the new type declaration file if needed
  - **Done-when:**
    1. TypeScript type checking passes for all image imports in projects page
    2. CI Build and Test step completes successfully
    3. No TS2307 "Cannot find module" errors for image files
  - **Depends-on:** none

- [x] **T040 · Investigation · P1: Review and validate image import patterns**

  - **Action:**
    1. Analyze current import pattern `@/../public/images/...` vs Next.js standard `/images/...`
    2. Verify image files exist at expected paths in CI environment
    3. Test that images load correctly in browser after TypeScript fix
    4. Document findings on import pattern effectiveness and performance
  - **Done-when:**
    1. Image import patterns are validated as working correctly
    2. No broken images or 404 errors in deployed application
    3. Performance impact (if any) is documented
  - **Depends-on:** [T039]

- [x] **T041 · Enhancement · P2: Consider optimizing image import patterns for Next.js**

  - **Action:**
    1. Evaluate changing from `@/../public/images/...` to Next.js standard patterns
    2. Research best practices for static asset imports in Next.js applications
    3. Create implementation plan if changes are beneficial
    4. Consider using Next.js Image component for better optimization
  - **Done-when:**
    1. Analysis complete on optimal image import strategy
    2. Recommendation documented with pros/cons
    3. Implementation plan created if changes are recommended
  - **Depends-on:** [T040]

## Critical Security Infrastructure Fixes

- [x] **T042 · Bugfix · P0: Fix package.json to use correct security audit script**

  - **Action:**
    1. Change `build:audit-filter` script to compile `scripts/audit-filter-new.ts` instead of old version
    2. Update `security:scan` script to execute `dist/scripts/audit-filter-new.js`
  - **Done-when:**
    1. package.json compiles the new robust audit script
    2. security:scan command uses the correct compiled script
    3. npm run security:scan executes without errors
  - **Depends-on:** none

- [x] **T043 · Bugfix · P0: Update CI workflow to use correct audit script**

  - **Action:**
    1. Modify `.github/workflows/ci.yml` line 176 to call `dist/scripts/audit-filter-new.js`
    2. Ensure CI security step uses the robust audit implementation
  - **Done-when:**
    1. CI workflow executes the correct audit script
    2. Security scanning step in CI uses new robust logic
  - **Depends-on:** [T042]

- [x] **T044 · Bugfix · P0: Update pre-push hook to use correct audit script**

  - **Action:**
    1. Modify `.husky/pre-push-security` line 21 to call `dist/scripts/audit-filter-new.js`
    2. Ensure pre-push security validation uses robust implementation
  - **Done-when:**
    1. Pre-push hook executes the correct audit script
    2. Local security validation matches CI behavior
  - **Depends-on:** [T042]

- [x] **T045 · Cleanup · P0: Remove obsolete audit script to prevent confusion**

  - **Action:**
    1. Delete `scripts/audit-filter.ts` (old buggy version)
    2. Rename `scripts/audit-filter-new.ts` to `scripts/audit-filter.ts`
    3. Update build script to use the renamed file
  - **Done-when:**
    1. Only one audit script exists in codebase
    2. No references to obsolete script remain
    3. Security pipeline still functions correctly
  - **Depends-on:** [T042, T043, T044]

- [x] **T046 · Test · P0: Validate security pipeline detects vulnerabilities correctly**

  - **Action:**
    1. Test security scan correctly rejects missing expiration dates
    2. Verify invalid date formats are flagged as expired
    3. Confirm both CI and pre-push hooks block security violations
    4. Test with known vulnerability scenarios
  - **Done-when:**
    1. Security pipeline blocks missing/invalid expiration dates
    2. CI fails appropriately on security violations
    3. Pre-push hook prevents pushing vulnerable code
    4. Test scenarios documented with results
  - **Depends-on:** [T045]

## CI/CD Quality Gate Restoration

- [x] **T047 · Bugfix · P1: Fix pre-push hook to scan pushed files not staged files**

  - **Action:**
    1. Change `FILES_TO_CHECK` in `.husky/pre-push-security` from `git diff --name-only --staged`
    2. Use `git diff --name-only $(git merge-base @{u} HEAD)..HEAD` to get files being pushed
    3. Test hook scans correct file set during push operations
  - **Done-when:**
    1. Pre-push hook scans files actually being pushed
    2. Secret detection covers committed files in push
    3. Hook behavior verified with test push scenarios
  - **Depends-on:** none

- [x] **T048 · Feature · P1: Restore strict TypeScript checking in CI pipeline**

  - **Action:**
    1. Add dedicated CI step to run `npm run build:verify` (strict type checking)
    2. Place step before Testing stage to catch type errors early
    3. Ensure CI fails on unused variables, implicit returns, unsafe indexed access
  - **Done-when:**
    1. CI pipeline runs strict TypeScript checking with tsconfig.typecheck.json
    2. Build fails on code quality violations caught by strict config
    3. Type checking step positioned appropriately in CI workflow
  - **Depends-on:** none

## Type System Consistency Fixes

- [x] **T049 · Bugfix · P2: Align AllowlistEntry.expires type with schema requirements**

  - **Action:**
    1. Change `expires?: string;` to `expires: string;` in `src/lib/audit-filter/types.ts`
    2. Fix any TypeScript errors that arise from making field mandatory
    3. Ensure type definition matches JSON schema validation
  - **Done-when:**
    1. TypeScript type requires expires field (no optional ?)
    2. Type definition consistent with allowlist.schema.ts
    3. No TypeScript compilation errors from the change
  - **Depends-on:** none

- [x] **T050 · Chore · P2: Actually remove skipLibCheck from tsconfig.json**

  - **Action:**
    1. Remove `"skipLibCheck": true` from root tsconfig.json compilerOptions
    2. Fix any type errors that emerge from library type checking
    3. Update T019 status if still marked as completed incorrectly
  - **Done-when:**
    1. skipLibCheck flag completely removed from tsconfig.json
    2. Build passes with library type checking enabled
    3. Any library type issues properly addressed
  - **Depends-on:** none

- [x] **T051 · Investigation · P2: Validate moduleResolution change in tsconfig.json**

  - **Action:**
    1. Test application build and runtime with moduleResolution: "node"
    2. Verify no module resolution issues with Next.js bundling
    3. Consider if "bundler" or "nodenext" would be more appropriate
    4. Document decision and rationale
  - **Done-when:**
    1. Application builds and runs correctly with current setting
    2. Module resolution compatibility confirmed with Next.js
    3. Decision documented with technical justification
  - **Depends-on:** none

## Critical CI Pipeline Fixes (PR #23)

- [x] **T054 · Bugfix · P0: Fix test file null safety violations in Storybook build**

  - **Action:**
    1. Locate test file causing TS2532 errors (likely `src/lib/audit-filter/__tests__/core.enhanced.test.ts` lines 341-342)
    2. Add proper null checks: `expect(result.vulnerabilities).toHaveLength(1)` before array access
    3. Use optional chaining: `result.vulnerabilities[0]?.id` and `result.vulnerabilities[0]?.package`
    4. Verify test still validates intended behavior with safety checks
  - **Done-when:**
    1. No TS2532 "Object is possibly 'undefined'" errors in any test files
    2. Test assertions maintain their validation purpose
    3. Storybook webpack compilation includes test files without errors
  - **Depends-on:** none

- [x] **T055 · Bugfix · P0: Fix useListState hook implicit any types**

  - **Action:**
    1. Add explicit type parameters to `useListState` function in `src/app/hooks/useListState.ts`
    2. Replace any implicit `any` types on lines 25 and 36 with proper generic constraints
    3. Ensure all function parameters have explicit type annotations
    4. Add return type annotation for the hook
  - **Done-when:**
    1. No TS7006 "Parameter implicitly has 'any' type" errors in useListState.ts
    2. Hook maintains full type safety and inference
    3. TypeScript strict mode compilation passes
  - **Depends-on:** none

- [x] **T056 · Cleanup · P0: Remove unused variables in scripts to fix build warnings**

  - **Action:**
    1. Fix `scripts/validate-security-pipeline.js:58` - remove or use 'error' variable
    2. Fix `scripts/migrate-all-data.js:96` - prefix unused catch parameter with underscore: `catch (_e)`
    3. Fix `scripts/migrate-all-data.js:13` - remove 'findAllIndices' if truly unused
    4. Fix `scripts/full-data-migration.js:120` - prefix with underscore: `catch (_e)`
    5. Fix `scripts/csv-output.js:29` - remove 'endMarker' if unused or add underscore prefix
    6. Fix `.lintstagedrc.js:14` - prefix with underscore: `catch (_e)`
  - **Done-when:**
    1. No ESLint unused variable warnings in any script files
    2. Webpack compilation completes without warnings
    3. All catch parameters follow naming convention for intentionally unused variables
  - **Depends-on:** none

- [x] **T057 · Investigation · P1: Verify Storybook TypeScript configuration consistency**

  - **Action:**
    1. Check `.storybook/main.ts` TypeScript configuration settings
    2. Compare with root `tsconfig.json` strictness settings
    3. Ensure Storybook file inclusion patterns exclude test files from compilation
    4. Verify Storybook webpack config matches main build TypeScript behavior
  - **Done-when:**
    1. Storybook and main build use consistent TypeScript checking rules
    2. Test files are appropriately excluded from Storybook build if needed
    3. TypeScript behavior is predictable across all build tools
  - **Depends-on:** [T054, T055, T056]

- [x] **T058 · Test · P1: Verify CI pipeline restoration with local testing**

  - **Action:**
    1. Run `npm run build-storybook` locally to verify fixes resolve build failure
    2. Test full CI pipeline steps locally: lint, typecheck, test, build, build-storybook
    3. Verify Vercel deployment succeeds after Storybook build fix
    4. Confirm all pre-push hooks pass with fixed code
  - **Done-when:**
    1. All build steps pass locally without errors or warnings
    2. Storybook builds successfully and serves without issues
    3. CI pipeline requirements satisfied locally before pushing
  - **Depends-on:** [T054, T055, T056]

- [x] **T059 · Prevention · P2: Add Storybook build verification to pre-commit hooks**

  - **Action:**
    1. Update `.lintstagedrc.js` or pre-commit configuration to include Storybook build check
    2. Ensure Storybook TypeScript errors are caught before commit
    3. Add fast feedback for Storybook-specific compilation issues
    4. Document Storybook build requirements in development guidelines
  - **Done-when:**
    1. Pre-commit hooks prevent commits that would break Storybook build
    2. Developers get immediate feedback on Storybook TypeScript issues
    3. CI pipeline failures from Storybook builds are prevented proactively
  - **Depends-on:** [T057, T058]

## Technical Debt Security Cleanup

- [x] **T052 · Security · P3: Remove eval() usage in migration scripts**

  - **Action:**
    1. Replace eval() in `scripts/importData.js` lines 35-36 with safer parsing
    2. Use JSON.parse or regex-based parsing like in migrate-data.js
    3. Test migration scripts work without eval() security risk
  - **Done-when:**
    1. No eval() calls remain in migration scripts
    2. Data migration functionality preserved
    3. Security vulnerability eliminated
  - **Depends-on:** none

- [x] **T053 · Cleanup · P3: Remove redundant npm scripts**

  - **Action:**
    1. Evaluate if `build:verify` and `typecheck` scripts are truly redundant
    2. Remove or consolidate scripts that perform identical functions
    3. Update any references to removed scripts
  - **Done-when:**
    1. No duplicate functionality in npm scripts
    2. All script references updated correctly
    3. Script purposes clearly differentiated
  - **Depends-on:** none

## Critical Build Infrastructure Fixes

- [x] **T060 · Bugfix · P0: Remove orphaned test setup file causing Vercel build failure**

  - **Action:**
    1. Remove `src/lib/audit-filter/setup.ts` file that imports test mocks in production build
    2. Verify Jest configuration correctly uses `jest.setup.js` instead
    3. Confirm no other references to the setup.ts file exist
    4. Test that Vercel build succeeds without the problematic import
  - **Done-when:**
    1. Vercel build passes without "Cannot find module '**mocks**/setupMocks'" error
    2. Jest tests continue to run successfully with existing jest.setup.js
    3. No orphaned test setup files remain in src/ directory
  - **Depends-on:** none

- [x] **T061 · Configuration · P0: Configure Storybook to exclude test files from TypeScript compilation**

  - **Action:**
    1. Update `.storybook/main.ts` TypeScript configuration to exclude test files
    2. Add include/exclude patterns to prevent test file compilation in Storybook
    3. Verify Storybook build ignores **tests** directories and _.test._ files
    4. Test that Storybook build succeeds without TS2532 errors from test files
  - **Done-when:**
    1. Storybook build passes without TypeScript errors from test files
    2. Stories compilation works correctly for actual component files
    3. Test files are properly excluded from Storybook TypeScript checking
  - **Depends-on:** none

- [x] **T062 · Bugfix · P1: Fix remaining test files with TS2532 null safety violations**

  - **Action:**
    1. Systematically review all test files for TS2532 "Object is possibly undefined" errors
    2. Add non-null assertions (!) or proper null checks to array/object access
    3. Focus on files in audit-filter, components, hooks, and app directories
    4. Ensure test logic remains valid after safety fixes
  - **Done-when:**
    1. All test files compile without TS2532 errors in strict TypeScript mode
    2. Test assertions maintain their validation purpose
    3. No "Object is possibly undefined" errors remain in any test file
  - **Depends-on:** [T061]

- [x] **T063 · Prevention · P0: Add build verification to pre-push hook to catch CI failures locally**

  - **Action:**
    1. Create new pre-push hook that runs build verification before security scan
    2. Add `npm run build` and `npm run build-storybook` to pre-push checks
    3. Ensure hook fails fast on build errors with clear error messages
    4. Add option to skip build checks with environment variable if needed
  - **Done-when:**
    1. Pre-push hook catches Vercel and Storybook build failures locally
    2. Developers get immediate feedback on build issues before CI
    3. Build verification runs efficiently without significantly slowing push process
  - **Depends-on:** [T060, T061]

## Critical CI Pipeline Fixes (Security Audit Filter)

- [ ] **T064 · Bugfix · P0: Investigate and diagnose security audit filter build configuration**

  - **Action:**
    1. Examine current `scripts/audit-filter.ts` file and its import dependencies
    2. Check existing TypeScript compilation approach and identify why output file is missing
    3. Verify import paths and module resolution in current build command
    4. Document specific issues found in module resolution
  - **Done-when:**
    1. Root cause of missing compiled file is clearly identified
    2. All import dependencies and path resolution issues are documented
    3. Current build configuration problems are understood
  - **Depends-on:** none

- [ ] **T065 · Refactor · P0: Create proper TypeScript configuration for security scripts**

  - **Action:**
    1. Create dedicated `tsconfig.scripts.json` for security script compilation
    2. Add proper path mapping to resolve `src/lib/audit-filter/*` imports
    3. Configure module resolution and output settings for standalone script compilation
    4. Test locally that TypeScript can resolve all dependencies correctly
  - **Done-when:**
    1. Security script compiles successfully with proper tsconfig
    2. All import paths resolve correctly without errors
    3. Compiled output file is generated in expected location
  - **Depends-on:** [T064]

- [ ] **T066 · Bugfix · P0: Fix security audit filter build command and add verification**

  - **Action:**
    1. Update `package.json` build:audit-filter script to use proper tsconfig
    2. Add output directory creation step to ensure `dist/scripts/` exists
    3. Add verification step to check compiled file exists before attempting execution
    4. Remove `--skipLibCheck` to show actual TypeScript compilation errors
  - **Done-when:**
    1. Build command reliably produces the expected compiled output file
    2. Clear error messages shown if compilation fails
    3. Build process includes verification that output exists
  - **Depends-on:** [T065]

- [ ] **T067 · Enhancement · P0: Add CI build verification and error handling**

  - **Action:**
    1. Update CI workflow to verify compiled file exists after build step
    2. Add proper error handling and reporting for compilation failures
    3. Include debugging information for troubleshooting build issues
    4. Test CI workflow changes to ensure they catch and report failures correctly
  - **Done-when:**
    1. CI workflow includes verification that audit-filter.js exists after compilation
    2. Clear error messages provided when security script build fails
    3. CI failure provides actionable debugging information
  - **Depends-on:** [T066]

- [ ] **T068 · Test · P1: Validate security audit filter fix and add local testing**

  - **Action:**
    1. Test complete security scan process locally to verify fix works
    2. Add npm script for local testing of security audit filter compilation
    3. Verify security scan catches vulnerabilities correctly after fix
    4. Test that CI pipeline runs successfully with fixed configuration
  - **Done-when:**
    1. Security audit filter builds and runs correctly locally
    2. Local testing script allows developers to verify security scan before CI
    3. Full CI pipeline passes with security scan working
  - **Depends-on:** [T067]

- [ ] **T069 · Documentation · P2: Update build process documentation and prevention**

  - **Action:**
    1. Update DEVELOPMENT_SETUP.md with new security script build process
    2. Document TypeScript configuration for security scripts
    3. Add troubleshooting guide for security scan build issues
    4. Document local testing procedures for security audit filter
  - **Done-when:**
    1. Build process documentation is updated with new approach
    2. Developers have clear guidance for working with security scripts
    3. Troubleshooting information available for future issues
  - **Depends-on:** [T068]
