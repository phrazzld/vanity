# Console Usage Categorization & Migration Roadmap

## Analysis Summary

- **Total console.\* instances found:** 238
- **Files containing console.\* calls:** 32
- **High-priority operational files identified:** 16

## Category Definitions

- **A (Operational):** Production code that needs immediate structured logging replacement
- **B (Error):** Error handling that should use structured error logging
- **C (Debug):** Debug/development logging to replace with structured debug logging
- **D (Test-OK):** Test files where console usage is acceptable (mocking, testing console output)
- **E (Scripts-Evaluate):** Scripts requiring individual evaluation for keep/migrate decision

## High-Priority Files (P0 - Critical Path)

### Database Layer (Category A/B)

**Priority: P0 - Replace Immediately**

#### src/lib/db/readings.ts (21 instances)

- Lines 18, 32: A - Operational info logging (fetching operations)
- Lines 35, 76, 216, 243, 263, 279, 288, 299, 322, 343, 355: B - Error logging
- Lines 47, 67, 70, 91, 181, 199, 206, 235, 260, 280, 319, 335, 352: A - Operational flow logging
- **Justification:** Core database operations require structured logging for production observability

#### src/lib/db/quotes.ts (21 instances)

- Lines 17, 22, 25, 46, 98, 116, 149, 163, 179, 191, 208, 229, 245, 262: A - Operational logging
- Lines 31, 94, 130, 166, 194, 232, 265: B - Error logging
- **Justification:** Core database operations critical for application functionality

### API Routes (Category A/B)

**Priority: P0 - Replace Immediately**

#### src/app/api/readings/route.ts (23 instances)

- Lines 146, 154, 162, 190, 195, 202, 205, 247, 286, 324, 368, 401, 426: A - Operational API logging
- Lines 123, 210, 263, 289, 348, 371, 434: B - Error handling
- **Justification:** API endpoints require structured logging for request tracing and debugging

#### src/app/api/quotes/route.ts (21 instances)

- Lines 72, 86, 93, 119, 124, 131, 134, 153, 188, 206, 254, 272, 303: A - Operational API logging
- Lines 138, 168, 191, 236, 257, 308: B - Error handling
- **Justification:** Critical API endpoints for quotes functionality

#### src/app/api/auth/[...nextauth]/route.ts (17 instances)

- Lines 69, 76, 79, 87, 91, 114, 135, 139: A - Auth flow logging
- Lines 51, 144, 146, 149: B - Auth error handling
- **Justification:** Authentication logging critical for security monitoring

### Application Hooks (Category A/B/C)

**Priority: P0 - Replace Immediately**

#### src/app/hooks/useListState.ts (2 instances)

- Line 266: C - Debug logging for data fetching
- Line 284: B - Error handling
- **Justification:** Core hook used throughout application for state management

### Authentication (Category A/B)

**Priority: P0 - Replace Immediately**

#### src/auth.ts (6 instances)

- Lines 24, 25, 26, 46: A - Auth operational logging
- Lines 36, 59: A - Auth failure logging
- **Justification:** Security-critical authentication logging

## Medium-Priority Files (P1)

### Application Components (Category A/B/C)

**Priority: P1 - Replace After Core**

#### src/app/readings/page.tsx (7 instances)

- Lines 56, 60, 69, 92, 132, 188: B - Error handling
- Line 180: C - Debug logging
- **Justification:** User-facing functionality requires error tracking

#### src/app/components/TypewriterQuotes.tsx (6 instances)

- Lines 91, 104, 117: C - Debug logging for API calls
- Lines 130, 175, 279: B - Error handling
- **Justification:** User-facing component with API interactions

#### src/app/admin/page.tsx (1 instance)

- Line 100: B - Error handling
- **Justification:** Admin functionality error tracking

#### src/app/admin/layout.tsx (1 instance)

- Line 45: B - Error handling for auth status
- **Justification:** Admin auth error handling

#### src/app/admin/readings/page.tsx (2 instances)

- Lines 211, 253: B - Error handling for CRUD operations
- **Justification:** Admin CRUD error tracking

#### src/app/admin/quotes/page.tsx (2 instances)

- Lines 156, 198: B - Error handling for CRUD operations
- **Justification:** Admin CRUD error tracking

#### src/app/admin/login/page.tsx (1 instance)

- Line 62: B - Login error handling
- **Justification:** Auth error tracking

#### src/app/components/quotes/QuotesList.tsx (1 instance)

- Line 98: B - Error handling for search highlighting
- **Justification:** Component error handling

#### src/app/components/readings/ReadingsList.tsx (2 instances)

- Lines 54, 140: B - Error handling
- **Justification:** Component error handling

### Library Utilities (Category A/B)

**Priority: P1 - Replace After Core**

#### src/lib/query.ts (3 instances)

- Lines 17, 18, 19: A - Logger configuration for external library
- **Justification:** Part of query logging infrastructure

#### src/hooks/keyboard/useShortcuts.ts (1 instance)

- Line 49: B - Error handling for keyboard shortcuts
- **Justification:** User interaction error handling

## Test Files (Category D - Keep)

**Priority: P3 - Keep As-Is**

#### src/lib/**tests**/logger.test.ts (5 instances)

- Lines 82, 109, 110, 111, 124, 129, 138, 141, 144, 149, 115: D - Test code mocking console
- **Justification:** Testing console output behavior - legitimate test usage

#### src/lib/audit-filter/**tests**/cli-utils.test.ts (8 instances)

- Lines 25, 26, 141, 142, 147, 148: D - Console mocking in tests
- **Justification:** Testing CLI output behavior

#### src/app/hooks/**tests**/useReadingsQuotesList.test.tsx (4 instances)

- Lines 95, 96, 113, 114: D - Console mocking in tests
- **Justification:** Testing error handling behavior

#### src/app/components/readings/**tests**/ReadingsList.test.tsx (1 instance)

- Line 208: D - Commented debug line in test
- **Justification:** Debug code in test (commented)

#### src/lib/audit-filter/**tests**/logging.test.ts (8 instances)

- Lines 17, 27, 51, 53, 79: D - Testing console logging behavior
- **Justification:** Testing logging functionality

#### src/lib/audit-filter/**tests**/cli-integration.test.ts (1 instance)

- Line 40: D - Error logging in test
- **Justification:** Test error handling

#### src/lib/audit-filter/**tests**/integration.test.ts (2 instances)

- Lines 60, 68: D - Test logging
- **Justification:** Integration test logging

## Storybook Files (Category E - Evaluate)

**Priority: P2 - Evaluate for Development Tool Status**

#### src/app/components/DarkModeToggle.stories.ts (2 instances)

- Lines 36, 156: E - Storybook interaction handlers
- **Justification:** Development tool - evaluate if needed for documentation

#### src/app/components/SearchBar.stories.ts (13 instances)

- Lines 344, 350, 356, 372, 378, 384, 437, 495, 524, 551: E - Storybook handlers
- **Justification:** Development tool - likely exempt but document decision

## Scripts (Category E - Evaluate)

**Priority: P2 - Individual Evaluation Required**

#### scripts/audit-filter-new.ts (25 instances)

- All instances: E - CLI script output
- **Decision:** Keep - CLI tools should use console for user interaction
- **Justification:** Command-line interface requires console output

#### scripts/audit-filter.ts (25 instances)

- All instances: E - CLI script output
- **Decision:** Keep - CLI tools should use console for user interaction
- **Justification:** Command-line interface requires console output

#### src/lib/audit-filter/cli-utils.ts (26 instances)

- All instances: E - CLI utility output
- **Decision:** Keep - CLI utility functions for user interaction
- **Justification:** CLI utilities require console output for user feedback

## Test Utilities (Category D/E - Mixed)

**Priority: P3 - Keep Test Utils**

#### src/test-utils/a11y-helpers.tsx (2 instances)

- Lines 41, 135: D - Accessibility test output
- **Justification:** Test utility for a11y violations - keep for debugging

## Logger Implementation (Category A - Special Case)

**Priority: P0 - Enhance, Don't Replace**

#### src/lib/logger.ts (9 instances)

- Lines 121, 124, 129, 138, 141, 144, 149: A - Logger implementation using console
- **Justification:** This IS the structured logger - enhance with additional features, don't replace

## Migration Priority Matrix

### Phase 1: Critical Path (P0) - 2 days

1. **Database layer** (src/lib/db/quotes.ts, src/lib/db/readings.ts) - 42 instances
2. **API routes** (all src/app/api/\*/route.ts) - 61 instances
3. **Core hooks** (src/app/hooks/useListState.ts) - 2 instances
4. **Authentication** (src/auth.ts) - 6 instances
5. **Logger enhancement** (src/lib/logger.ts) - 9 instances

**Total P0:** 120 instances across 8 files

### Phase 2: Application Layer (P1) - 2 days

1. **Page components** (src/app/\*/page.tsx) - 11 instances
2. **UI components** (src/app/components/\*) - 9 instances
3. **Utility libraries** (src/lib/query.ts, src/hooks/\*) - 4 instances

**Total P1:** 24 instances across 10 files

### Phase 3: Evaluation & Documentation (P2) - 1 day

1. **Storybook files** - Document exempt status with justification
2. **CLI scripts** - Document exempt status with justification

**Total P2:** 64 instances (marked exempt) across 6 files

### Exempted (Keep As-Is)

1. **Test files** - 30 instances across 8 files (legitimate test usage)

## Risk Assessment

### High Risk

- Database operations (quotes.ts, readings.ts) - Data integrity monitoring
- API routes - Request tracing and error tracking
- Authentication - Security event logging

### Medium Risk

- UI Components - User experience error tracking
- Admin functions - Administrative operation auditing

### Low Risk

- Test files - No production impact
- Development tools - No production impact

## Success Metrics

### Completion Criteria

- [ ] Zero console.\* calls in operational code (144 instances to migrate)
- [ ] All logs include correlation_id, module_name, function_name
- [ ] Structured JSON output in production
- [ ] Human-readable output in development
- [ ] Test suite maintains ≥85% coverage
- [ ] No performance degradation >5%

### Verification Commands

```bash
# Verify zero console.* in operational code
rg "console\.(log|error|warn|info|debug)" src/lib/db/ src/app/api/ src/app/hooks/ src/auth.ts

# Verify exempted files documented
rg "console\.(log|error|warn|info|debug)" scripts/ src/app/components/*.stories.ts src/**/tests/ --files-with-matches

# Performance baseline
npm run test:coverage && npm run build
```

This categorization provides a systematic approach to migrating 144 operational console.\* calls while documenting 94 exempt instances, ensuring comprehensive coverage and clear decision rationale for each category.
