# BACKLOG

## 🎯 NEXT SPRINT (Top 5 Focus Items)

## HIGH Priority

_Significant improvements to code quality, performance, or user experience_

### Code Quality & Testing

- [ ] **[QUALITY]** Comprehensive test coverage improvement | **Effort: L** | **Current: 36% → Target: 80%**
  - Focus: lib/utils (13%), store (17%), keyboard navigation (0-47%)
  - Add integration tests for core workflows (quotes, readings, theme)
  - Implement snapshot tests for UI components
  - **[PR #70 feedback]** Add UI store unit tests for theme logic:
    - Create `src/store/__tests__/ui.test.ts` covering:
      - `initializeTheme()` behavior with/without localStorage
      - `hasExplicitThemePreference` state management
      - Media query event handling and cleanup
      - Race conditions between user toggles and system changes
      - localStorage corruption/unavailability handling
    - Test scenarios:
      - First mount with no saved preference → uses system
      - First mount with explicit preference → respects saved choice
      - System preference change with/without explicit preference
      - Concurrent user toggle + system change → user wins
      - Media query listener cleanup on unmount

### Performance

- [ ] **[PERF]** Bundle size optimization | **Effort: M** | **Current: 2MB → Target: <1MB**
  - Implement code splitting and dynamic imports
  - Lazy load Map component (saves 166kB)
  - Optimize image loading with responsive sizes
  - Tree-shake unused dependencies

### Architecture

- [ ] **[REFACTOR]** Split oversized components | **Effort: M**
  - TypewriterQuotes (314 lines) → animation engine + data fetcher + presentation
  - ReadingsList (394 lines) → separate formatting, search, and display logic

### Developer Experience

- [ ] **[DX]** Implement CI/CD improvements | **Effort: M** | **Time saved: 10+ hrs/week**
  - Parallel test execution with caching
  - Build caching (60% faster CI builds)
  - Early termination on failure

### Quality Infrastructure (from /gates audit)

- [ ] **[QUALITY]** Consolidate bundle-size workflow into main CI | **Effort: S** | **Impact: Simpler pipeline**
  - Merge bundle-size.yml checks into ci.yml to reduce workflow complexity
  - Single workflow easier to maintain and debug
  - **PR #61 feedback**: Removes third-party action dependency (dawidd6/action-download-artifact@v3)

- [ ] **[REFACTOR]** Extract security checks from pre-push hook to separate script | **Effort: S** | **Impact: Maintainability**
  - Pre-push hook is 251 lines and growing
  - Move security scanning logic to `scripts/security-check.sh`
  - Improves testability and readability
  - **PR #61 feedback**: Hook length becoming substantial

- [ ] **[TESTING]** Add mutation testing for lib/ directory | **Effort: M** | **Impact: Verify test quality**
  - Use Stryker Mutator to test if tests actually catch bugs
  - Target: >60% mutation score for core logic
  - Reveals if 27% coverage is effective or just theater

## MEDIUM Priority

_Valuable improvements and new features_

### Code Quality

- [ ] **[REFACTOR]** Refine hydration warning suppression | **Effort: S** | **Impact: Better DX**
  - **[PR #70 feedback]** `src/app/layout.tsx:18` uses broad `suppressHydrationWarning`
  - Current: Masks all hydration warnings on `<html>` element
  - Goal: More targeted suppression for theme-related hydration only
  - **Note:** May become non-issue after fixing critical hydration race (TODO.md #1)
  - Investigation needed: React 18+ hydration boundaries, `useId()` patterns
  - **Deferred rationale:** Wait for critical hydration fix completion to assess if still needed

### Security & Infrastructure

- [ ] **[SECURITY]** Security hardening | **Effort: M**
  - Add input validation for CLI file operations
  - Replace innerHTML in DarkModeToggle with safe DOM methods
  - Implement CSP nonce support for inline scripts
  - Add pre-commit secret scanning

### Quality Automation

- [ ] **[QUALITY]** Implement quality gates | **Effort: S**
  - Pre-commit: coverage checks, ESLint max-lines (400)
  - CI/CD: Block PRs below 80% coverage for new code
  - Add complexity limits and dead code detection

### Features

- [ ] **[FEATURE]** Content validation pipeline | **Effort: M** | Build-time validation and auto-formatting
- [ ] **[FEATURE]** Smart content recommendations | **Effort: L** | Local analysis without external APIs
- [ ] **[FEATURE]** Progressive content loading | **Effort: M** | Service worker + intelligent prefetch
- [ ] **[FEATURE]** Interactive reading timeline | **Effort: M** | Visual journey with progress tracking

### Documentation

- [ ] **[DOCS]** Add comprehensive JSDoc | **Effort: M** | Target: 90% coverage for exported functions
- [ ] **[DOCS]** Create architectural decision records | **Effort: S** | Document key technical decisions

## LOW Priority

_Nice-to-have improvements and future considerations_

### Cleanup

- [ ] **[CLEANUP]** Remove all unused .env.production variables | **Effort: S** | Including obsolete NEXT_PUBLIC_SPACES_BASE_URL
- [ ] **[CLEANUP]** Unify logging approach | **Effort: S** | Standardize on single logging method

### Optimizations

- [ ] **[PERF]** Implement component memoization | **Effort: M** | For large list rendering
- [ ] **[PERF]** Add virtual scrolling | **Effort: M** | For reading lists > 100 items

### Future Features

- [ ] **[FEATURE]** Reading metadata enhancements | **Effort: M** | Narrator info, playback speed
- [ ] **[FEATURE]** External platform integrations | **Effort: L** | Goodreads import, audiobook sync
- [ ] **[FEATURE]** GitHub project showcase | **Effort: M** | Auto-sync coding projects

---

## 🔄 Quality Gates (To Implement)

### Phase 1: Pre-commit Hooks

- [ ] ESLint max-lines enforcement
- [ ] Incremental coverage checks
- [ ] Secret scanning
- [ ] Duplicate code detection

### Phase 2: CI/CD Pipeline

- [ ] Coverage thresholds (80% new code)
- [ ] Performance budgets (<100ms API)
- [ ] Visual regression testing
- [ ] Security vulnerability scanning

### Phase 3: Monitoring

- [ ] Error rate alerts (<0.1%)
- [ ] Performance degradation detection
- [ ] Dependency update automation

---

## ⚡ RADICAL SIMPLIFICATION OPTIONS (v2.0)

_Alternative approach: Dramatically simplify instead of improving. Choose this OR the improvements above, not both._

### Completed Simplifications

- [x] ~~Eliminate database + admin → static Markdown~~ | **✅ DONE** | Saved $228/year, removed 2300 lines

### Potential Future Simplifications

Consider these if complexity becomes unmanageable:

- [ ] **[GORDIAN]** Replace interactive map with static image | **Code reduction: 18%** | Removes Leaflet dependencies
- [ ] **[GORDIAN]** Replace Zustand with localStorage | **Code reduction: 15%** | For simple theme toggle
- [ ] **[GORDIAN]** Remove CLI tool entirely | **Code reduction: 12%** | Just edit markdown directly
- [ ] **[GORDIAN]** Simplify Tailwind to basic utilities | **Code reduction: 20%** | Remove design system complexity

**Note:** These simplifications would eliminate many of the improvements listed above. Choose one path:

1. **Improve** - Implement the backlog items above
2. **Simplify** - Remove features and complexity entirely

---

## 📋 Recently Completed

- [x] Distill CLAUDE.md to repository-specific guidance | **2025-01-02**
- [x] Database elimination and static file migration | **2024-12**

---

## 📊 Grooming Metadata

**Last Updated:** 2025-01-02
**Total Items:** 35 (down from 60+)
**Next Review:** 2025-01-09

### Key Metrics

- **Current Test Coverage:** 36%
- **Target Test Coverage:** 80%
- **Current Bundle Size:** 2MB
- **Target Bundle Size:** <1MB
- **Identified Security Issues:** 1 CVE (critical)

### Dependencies

- Bundle optimization may require code splitting implementation first
- Test improvements should happen before major refactoring
- Quality gates need CI/CD improvements first
