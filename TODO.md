# TODO: Security and Cleanup Sprint

## Context

- **Approach**: Three independent, high-impact removals (security, dead code, unused deps)
- **Key Files**: docker-compose.yml, unused hooks (2 files + 2 test files), package.json
- **Patterns**: Follow git rm for tracked files, npm uninstall for deps
- **Bundle Impact**: 10-15% reduction (~15-25KB gzipped)
- **Security**: Eliminates hardcoded credentials in git history

## Implementation Tasks

### Module 1: Security - Remove Hardcoded Credentials

- [ ] Remove docker-compose.yml with hardcoded postgres password
  ```
  Files: docker-compose.yml:11-12 (git tracked, in history since 9222e32)
  Approach: git rm docker-compose.yml (database removed per package.json:9-22)
  Success: File removed from working tree and staged for deletion, no hardcoded credentials present
  Test: Security scan passes (pnpm run security:audit), git status shows deletion staged
  Module: Infrastructure configuration - removing legacy database setup
  Rationale: Database removed in favor of markdown files, docker-compose serves no purpose
  Time: 5min
  ```

### Module 2: Dead Code Elimination - Unused Hooks

- [ ] Delete useFormState hook and tests (668 lines total)

  ```
  Files:
    - src/hooks/useFormState.ts (234 lines)
    - src/hooks/__tests__/useFormState.test.ts (435 lines)
  Approach: git rm both files (zero imports found in src/app or src/components)
  Success: Files deleted, TypeScript compilation passes, test suite runs without errors
  Test: npm test && npm run typecheck (verify no broken imports)
  Module: Form state management - speculative abstraction never used
  Evidence: grep -r "useFormState" src/{app,components} → No matches outside hooks/
  Time: 5min
  ```

- [ ] Delete useSearchFilters hook and tests (863 lines total)
  ```
  Files:
    - src/hooks/useSearchFilters.ts (305 lines)
    - src/hooks/__tests__/useSearchFilters.test.ts (558 lines)
  Approach: git rm both files (replaced by useReadingsFilter for actual use case)
  Success: Files deleted, TypeScript compilation passes, all tests pass
  Test: npm test && npm run typecheck (existing useReadingsFilter tests cover actual functionality)
  Module: Generic search/filter abstraction - over-engineered for simple needs
  Evidence: useReadingsFilter (909 lines) provides focused functionality actually needed
  Time: 5min
  ```

### Module 3: Bundle Optimization - Unused Dependencies

- [ ] Remove unused production dependencies

  ```
  Files: package.json:136-145
  Approach: npm uninstall date-fns date-fns-tz zod
  Success: Dependencies removed from package.json, no build/test failures
  Test:
    - npm run build (verify no import errors)
    - npm test (all tests pass)
    - Check bundle size reduction in build output
  Module: Dependency management - removing unused libraries
  Evidence:
    - date-fns: No imports in src/ (grep -r "from 'date-fns" src/)
    - date-fns-tz: No imports in src/
    - zod: No imports in src/ (validation not needed for static markdown)
  Exception: nanoid still used in src/__mocks__/nanoid.ts for test determinism
  Bundle Impact: ~15-25KB gzipped (date-fns: 539KB, zod: significant)
  Time: 10min
  ```

- [ ] Move nanoid to devDependencies (used only in test mocks)
  ```
  Files: package.json, src/__mocks__/nanoid.ts:1
  Approach: npm uninstall nanoid && npm install --save-dev nanoid
  Success: nanoid in devDependencies, mock still functions, tests pass
  Test: npm test (verify src/__mocks__/nanoid.ts still provides deterministic IDs)
  Module: Test infrastructure - correctly categorize mock dependency
  Rationale: nanoid only imported in src/__mocks__/, not production code
  Time: 5min
  ```

## Validation Strategy

**Module Testing**:

- Each task can be validated independently
- No integration between tasks (parallel-ready)
- Binary success: command succeeds or fails

**Acceptance Criteria**:

1. Security: `git status` shows docker-compose.yml deleted, no hardcoded credentials remain
2. Dead Code: `npm run typecheck` passes, `npm test` passes (zero broken imports)
3. Bundle: `npm run build` succeeds with smaller bundle sizes in output

**Full Pipeline**:

```bash
npm run typecheck && npm test && npm run build && pnpm run security:audit
```

## Design Iteration

After completion: Review remaining hooks/ directory for other unused abstractions

## Automation Opportunities

Future: Add CI check to fail if unused dependencies detected (e.g., depcheck or similar)

## Notes

- **No Process Tasks**: This is pure implementation (deletion = code change)
- **Parallel Ready**: All three modules independent (security, hooks, deps)
- **Time Budget**: 30 minutes total for all tasks
- **Risk**: Very low - all deletions verified safe by grep/testing
- **Rollback**: Simple git revert if issues discovered
