# TODO: Quality Infrastructure Optimization

> **Context**: Quality gates audit revealed 2+ minutes of waste per development cycle due to duplicate checks and theater-level coverage thresholds. These tasks eliminate redundancy while maintaining actual bug prevention.

## 🔥 Critical Path (Fix Today - 2min/cycle savings)

- [x] Remove duplicate TypeScript check from CI workflow
  - **File**: `.github/workflows/ci.yml:88-104`
  - **Action**: Delete the "Strict TypeScript checking" step entirely
  - **Rationale**: Lines 88-104 run identical `npm run typecheck` command as lines 69-86. The "strict" label is misleading - both use same tsconfig.typecheck.json
  - **Impact**: Saves ~30s per CI build, eliminates confusion
  - **Success criteria**: Single typecheck step remains at lines 69-86, no duplicate execution

- [x] Remove duplicate ESLint run from lint-staged
  - **File**: `.lintstagedrc.js:29-35`
  - **Current**: Runs ESLint twice - once to check, once to fix
  - **Change**: Replace lines 32-35 with single command: `eslint --config eslint.config.cjs --fix ${nonSymlinks.join(' ')}`
  - **Rationale**: `--fix` already errors on unfixable issues, making the check redundant
  - **Impact**: Saves 5-10s per commit
  - **Success criteria**: ESLint runs once per commit, still catches errors

- [x] Remove test coverage from pre-commit hook
  - **File**: `.husky/pre-commit:83-98`
  - **Action**: Delete entire "Check test coverage" section
  - **Rationale**: Full test suite with coverage is slow (~20-40s), runs again in pre-push anyway. Pre-commit should be fast to avoid developer bypass
  - **Keep**: Pre-push hook already runs tests without coverage (line 254)
  - **Impact**: Saves 20-40s per commit
  - **Success criteria**: Pre-commit completes in <10s, tests still run before push

- [x] Remove build verification from pre-push hook
  - **File**: `.husky/pre-push:119-155`
  - **Action**: Delete entire "Build verification (Vercel)" section
  - **Rationale**: CI already runs identical build (ci.yml:134-153). Pre-push hook should validate code quality, not replicate CI
  - **Trade-off**: Catch build failures in CI instead of locally (acceptable - CI runs on every push anyway)
  - **Impact**: Saves 60s per push
  - **Success criteria**: Push completes faster, CI still catches build failures

## ⚡ High Impact (This Week)

- [x] Set realistic test coverage thresholds with enforcement timeline
  - **File**: `jest.config.js:42-58`
  - **Current state**: Global 27%, lib 17% (down from 85%/90% targets)
  - **Decision required**: Choose one path:
    1. **Raise to 50% global, 60% lib** with 2-week deadline - add TODO items to write missing tests
    2. **Delete thresholds entirely** - remove lines 42-58, rely on code review instead
  - **Recommendation**: Delete. At 27%, thresholds provide false confidence without preventing bugs
  - **Success criteria**: Either meaningful thresholds (>50%) or no thresholds at all - no middle ground
  - **Decision made**: Deleted thresholds - rely on code review and targeted testing

- [x] Parallelize security scan with build in CI workflow
  - **File**: `.github/workflows/ci.yml:155-158`
  - **Current**: `security_scan` runs after `build-and-test` completes (needs: build-and-test)
  - **Change**: Remove `needs: build-and-test` from security_scan job
  - **Rationale**: Security and build are independent - run in parallel for faster feedback
  - **Impact**: Shaves 30-60s off total CI time (security scan no longer waits for build)
  - **Success criteria**: Both jobs start simultaneously, CI completes when slower job finishes

- [x] Configure Dependabot for automated security patches
  - **File**: Create `.github/dependabot.yml`
  - **Config**:
    ```yaml
    version: 2
    updates:
      - package-ecosystem: 'npm'
        directory: '/'
        schedule:
          interval: 'weekly'
        open-pull-requests-limit: 5
        labels: ['dependencies', 'security']
        reviewers: ['phaedrus']
    ```
  - **Rationale**: Proactive patching catches vulnerabilities between pushes
  - **Success criteria**: Weekly automated PRs for dependency updates
  - **Result**: File existed with better config - added missing reviewer and security label

- [x] Enforce ESLint max-lines at reasonable threshold or delete rule
  - **File**: `eslint.config.cjs:284-329`
  - **Current**: Warning at 500 lines, error at 1000 lines, max-lines-per-function at 1000
  - **Problem**: Warnings get ignored, 1000-line limits are meaningless
  - **Options**:
    1. **Enforce**: Change to error at 200 lines total, 100 lines per function
    2. **Delete**: Remove lines 284-329 entirely if not enforcing
  - **Recommendation**: Enforce at 200/100 - large files in this codebase need splitting (per BACKLOG.md)
  - **Success criteria**: Either errors block commit at reasonable limits or rule doesn't exist
  - **Decision**: Enforced at 200 lines/function, 500 lines/file with technical debt exemptions

## 📊 Medium Priority (This Month)

- [x] Share build artifacts between CI workflows to eliminate duplicate builds
  - **Files**: `.github/workflows/ci.yml`, `.github/workflows/bundle-size.yml`
  - **Current**: Main CI builds, then bundle-size builds again from scratch
  - **Implementation**:
    1. Add `actions/upload-artifact@v4` after main build in ci.yml
    2. Upload `.next` directory as artifact
    3. In bundle-size.yml, use `actions/download-artifact@v4` before size check
    4. Skip build step in bundle-size if artifact exists
  - **Impact**: Saves 60s per PR (eliminates second build)
  - **Success criteria**: Bundle-size workflow reuses CI build artifact
  - **Result**: Bundle-size now triggers after CI completes, downloads artifact, skips rebuild

- [x] Cache generate-static-data.js output based on content/ directory hash
  - **File**: `scripts/generate-static-data.js`
  - **Current**: Parses all markdown files on every build
  - **Implementation**:
    1. Calculate hash of `content/` directory (all .md files)
    2. Store hash in `public/data/.content-hash`
    3. Skip generation if hash unchanged
    4. Regenerate if hash differs or public/data missing
  - **Impact**: Saves 5-10s on builds when content unchanged
  - **Success criteria**: Builds skip data generation when content/ unchanged
  - **Result**: SHA-256 hash-based caching, <100ms on cache hit vs ~2s regeneration

- [x] Enable GitHub Security Advisories
  - **Action**: Enable in repository settings → Security tab → "Dependabot alerts"
  - **Benefit**: Earlier notification than npm audit, better signal-to-noise
  - **Impact**: 2 minutes to enable, catches vulnerabilities proactively
  - **Success criteria**: Security tab shows active monitoring
  - **Result**: Enabled via gh CLI - vulnerability alerts + Dependabot security updates active

## 🔮 Low Priority (Future / YAGNI)

- [ ] Add mutation testing to verify test quality
  - **Tool**: Stryker Mutator for JavaScript/TypeScript
  - **Scope**: Run on lib/ directory only (core logic)
  - **Rationale**: Verify tests actually catch bugs, not just achieve coverage percentage
  - **Success criteria**: Mutation score >60% for tested code
  - **Note**: Build when test quality becomes a real problem

- [ ] Add bundle analysis artifacts to CI for debugging
  - **File**: `.github/workflows/ci.yml`
  - **Action**: Run `npm run analyze` after build, upload HTML to artifacts
  - **Benefit**: Debug bundle size regressions without local reproduction
  - **Note**: Build when bundle size becomes a problem

---

## 📋 Summary

**Completed (High Impact):**

- ✅ Removed duplicate TypeScript check from CI (saves 30s per build)
- ✅ Removed duplicate ESLint run from lint-staged (saves 5-10s per commit)
- ✅ Removed test coverage from pre-commit (saves 20-40s per commit)
- ✅ Removed build verification from pre-push (saves 60s per push)
- ✅ Deleted meaningless coverage thresholds (27% was theater)
- ✅ Parallelized security scan with build (saves 30-60s per CI run)
- ✅ Configured Dependabot for automated patches
- ✅ Enforced ESLint max-lines (200/function, 500/file with exemptions)

**Estimated Impact:**

- Pre-commit: <10s (down from 30-50s) ⚡ **60-80% faster**
- Pre-push: <60s (down from 120s) ⚡ **50% faster**
- CI: ~4min (down from 5min) ⚡ **20% faster**
- **Total: ~2min saved per development cycle**

**Remaining Work (0 medium-priority tasks):**

All medium-priority optimization tasks completed! ✅

---

_Generated: 2025-10-01_
_Context: Quality Infrastructure Audit - /gates command output_
