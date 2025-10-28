### [Security] Delete Legacy docker-compose.yml with Hardcoded Credentials

**File**: `docker-compose.yml:11-12`
**Perspectives**: security-sentinel
**Impact**: CRITICAL - Hardcoded postgres password in git-tracked file
**Context**: Database removed per package.json notes, file appears legacy but still tracked in git history
**Fix**: `git rm docker-compose.yml` (database truly removed) OR migrate to env vars if needed
**Effort**: 5m (delete) | 15m (env vars) | **Risk**: CRITICAL
**Acceptance**: No hardcoded credentials in git-tracked files, security scan passes

### [Technical Debt] Delete Unused Hooks - 539 Lines Dead Code

**Files**: `src/hooks/useFormState.ts` (234 lines), `src/hooks/useSearchFilters.ts` (305 lines)
**Perspectives**: complexity-archaeologist, performance-pathfinder
**Impact**: 539 lines maintained despite zero usage in production code
**Evidence**: `grep -r "useFormState\|useSearchFilters" src/app src/components` → No matches
**Fix**: Delete both files entirely - speculative abstractions that never materialized
**Effort**: 30m | **Impact**: Eliminates maintenance burden, reduces mental model complexity
**Acceptance**: Tests pass, no imports broken, TypeScript compiles clean

### [Performance] Remove Unused Dependencies - 10-15% Bundle Reduction

**File**: `package.json`
**Perspectives**: performance-pathfinder
**Dependencies**: date-fns (539KB), date-fns-tz, zod, nanoid (production)
**Impact**: 15-25KB gzipped bundle reduction (~10-15%), 200-400ms faster load on 3G
**Evidence**: No imports found in src/, native Date methods used instead
**Fix**: `npm uninstall date-fns date-fns-tz zod && npm install --save-dev nanoid` (keep for mocks)
**Effort**: 20m | **Impact**: Measurable load time improvement
**Acceptance**: Build succeeds, bundle analyzer shows size reduction, all tests pass
