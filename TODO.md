# TODO

Current actionable tasks for the vanity project.

## Completed Projects

### ✅ Reading Status Simplification & Audiobook Enhancement (Jan 2025)

**Status:** Complete - All 20 tasks finished successfully

- Migrated from 3-state (reading/finished/dropped) to 2-state (reading/finished) system
- Added audiobook support with 🎧 hover indicators and keyboard accessibility
- Implemented comprehensive CLI tools for reading management (add/update/delete)
- Achieved WCAG 2.1 AA compliance with full accessibility testing
- Updated all documentation and maintained 299 passing tests

## Active Tasks

## CI Pipeline Simplification (Critical)

### Remove Flaky Performance Tests

**Problem:** Performance tests measuring jsdom render times are fundamentally flawed - they don't reflect real browser performance, require complex environment detection, and create false positives that block legitimate work. Real performance issues wouldn't be caught by these tests anyway.

- [x] **Delete all performance test files**
  - Target files: `src/app/components/readings/__tests__/ReadingCard.performance.test.tsx`
  - Target files: `src/app/components/readings/__tests__/ReadingsList.performance.test.tsx`
  - Target files: Any other `*.performance.test.*` files found via `find . -name "*.performance.test.*"`
  - Success criteria: All performance test files removed from codebase
  - Rationale: jsdom render times ≠ browser performance. These tests provide negative value.

  ```
  Work Log:
  - ✅ Deleted ReadingCard.performance.test.tsx
  - ✅ Deleted ReadingsList.performance.test.tsx
  - ✅ No other performance test files found in codebase
  ```

- [x] **Remove performance test imports and references**
  - Search pattern: `grep -r "performance.test" --include="*.json" --include="*.js" --include="*.ts"`
  - Check jest.config.js for any performance-specific configurations
  - Check package.json scripts for performance-specific test commands
  - Success criteria: No references to performance tests remain in configuration

  ```
  Work Log:
  - ✅ No performance test imports found in configuration files
  - ✅ jest.config.js has no performance-specific configurations
  - ✅ package.json has no performance test scripts
  - Found references in scripts that will be deleted in next task:
    * scripts/hover-performance-test.js
    * scripts/react-performance-validation.js
  - Note: src/lib/__tests__/data.test.ts has misleading test name but is not a performance test
  ```

- [x] **Simplify pre-push hook to remove coverage overhead**
  - File: `.husky/pre-push`
  - Current issue: Runs `npm run test:coverage` which adds 20-30% overhead
  - Change to: `npm test` (no coverage during pre-push)
  - Keep coverage for CI builds where it matters
  - Success criteria: Pre-push runs tests without coverage collection

  ```
  Work Log:
  - ✅ Changed line 244: 'npm run test:coverage' → 'npm test'
  - ✅ Updated echo message to reflect no coverage
  - ✅ Simplified error handling to remove coverage-specific checks
  - ✅ Tests now run without coverage overhead (20-30% speedup)
  ```

- [x] **Remove performance validation scripts**
  - Target files: `scripts/hover-performance-test.js`
  - Target files: `scripts/react-performance-validation.js`
  - Target files: `scripts/bundle-size-analysis.js` (keep if it provides value beyond performance)
  - Target docs: `docs/hover-performance-validation.md`
  - Success criteria: All performance-specific validation removed

  ```
  Work Log:
  - ✅ Deleted scripts/hover-performance-test.js
  - ✅ Deleted scripts/react-performance-validation.js
  - ✅ Deleted scripts/bundle-size-analysis.js (specific to audiobook analysis, not general)
  - ✅ Deleted docs/hover-performance-validation.md
  ```

- [x] **Clean up performance-related TODO entries**
  - Remove completed performance validation tasks from this file
  - Archive work logs that reference performance testing
  - Success criteria: TODO.md reflects current reality without performance test cruft

  ```
  Work Log:
  - ✅ Removed entire "Performance & Quality Validation" section (70+ lines)
  - ✅ All completed performance tasks and work logs removed
  - ✅ TODO.md now clean and focused on remaining work
  ```

### Focus CI on What Matters

- [ ] **Audit remaining CI checks for value**
  - Keep: TypeScript type checking (catches real errors)
  - Keep: ESLint (maintains code quality)
  - Keep: Build verification (ensures deployable code)
  - Keep: Functional tests (ensures features work)
  - Keep: Accessibility tests (ensures WCAG compliance)
  - Keep: Security scans (prevents vulnerabilities)
  - Question: Edge Runtime compatibility check - is this catching real issues?
  - Success criteria: Document which checks provide value vs noise

- [ ] **Consider real performance monitoring (if needed)**
  - Option 1: Add Lighthouse CI for Core Web Vitals (measures what users experience)
  - Option 2: Integrate real user monitoring (RUM) in production
  - Option 3: Do nothing - bundle size monitoring may be sufficient
  - Success criteria: Decision documented with rationale

- [ ] **Update CI documentation**
  - Remove references to performance tests
  - Document why they were removed (jsdom ≠ real performance)
  - Add guidance on what types of tests belong in CI
  - Success criteria: Clear documentation prevents re-introduction of bad patterns

### Verification

- [ ] **Test simplified CI pipeline locally**
  - Run: `npm test` (should pass without performance tests)
  - Run: `git push` (should complete faster without coverage)
  - Success criteria: All remaining tests pass, push completes successfully

- [ ] **Monitor CI in production**
  - Push changes and verify GitHub Actions complete successfully
  - Check that build times improve without performance tests
  - Success criteria: CI is faster and more reliable

## Notes

- For other feature requests and long-term planning, see [BACKLOG.md](BACKLOG.md)
- For architectural decisions, see [docs/](docs/) directory
- **Priority**: CI simplification is blocking current work - fix immediately
- **Secondary Priority**: Book cover recovery - 128+ broken images need fixing
