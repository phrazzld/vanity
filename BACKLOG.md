# BACKLOG

Last groomed: 2025-10-23
Analyzed by: 7 specialized perspectives (complexity-archaeologist, architecture-guardian, security-sentinel, performance-pathfinder, maintainability-maven, user-experience-advocate, product-visionary)

---

## Recently Completed

### ✅ [TEST] Fix Zustand Theme Store Test Isolation (PR #71)

**Completed**: 2025-10-24
**Impact**: Re-enabled 13 skipped theme tests, increased coverage from ~10% to 75.6%
**Critical Fix Required**: Mock activation issue discovered in review - jest.mock('zustand') missing
**Status**: Fixing mock activation in TODO.md before final merge

---

## Now (Sprint-Ready, <2 weeks)

### [SECURITY] CLI Command Injection in Editor Spawn

**File**: cli/lib/editor.ts:26, scripts/analyze-bundle.js:37,99
**Perspectives**: security-sentinel
**Impact**: `shell: true` with environment variable input enables command injection if EDITOR contains shell metacharacters. Arbitrary code execution in local context.
**Attack**: `export EDITOR='vi; rm -rf /tmp/malicious'` then run CLI
**Fix**:

```typescript
// Remove shell: true
const result = spawnSync(editor, [tmpFile], {
  stdio: 'inherit',
  shell: false, // Direct execution without shell
});

// Add validation
const sanitizeEditor = (editor: string): string => {
  if (!/^[a-zA-Z0-9_\-\/]+$/.test(editor)) {
    throw new Error(`Invalid EDITOR: ${editor}`);
  }
  return editor;
};
```

**Effort**: M (30m) | **Risk**: MEDIUM (local only, not production)
**Acceptance**: Manual test with malicious EDITOR values fails safely

### [PERFORMANCE] Bundle Size - Remove Unused `thoughts` Field

**File**: src/app/readings/page.tsx, public/data/readings.json
**Perspectives**: performance-pathfinder
**Impact**: readings.json is 124KB (379 readings with full `thoughts` field), but /readings page NEVER renders thoughts. Wasting 300ms on 3G connections.
**Current**: 124KB payload with unused data
**Fix**:

1. Split static data generation:
   - `readings-list.json` (30KB) - minimal data for grid: slug, title, author, finishedDate, coverImageSrc, audiobook
   - `readings-full.json` (124KB) - full data with thoughts for detail views (future)
2. Update src/lib/static-data.ts to load minimal data
3. Update scripts/generate-static-data.js
   **Effort**: M (2-3h) | **Impact**: 124KB → 30KB (75% reduction), 300ms → 50ms load
   **Acceptance**: Lighthouse performance score improves, /readings page loads <1s on 3G

### [UX CRITICAL] Add Search to Readings Page

**File**: src/app/readings/page.tsx
**Perspectives**: user-experience-advocate, product-visionary
**Impact**: 991 content items with NO search. Users must scroll through all years to find specific book. Site becomes unusable at scale.
**Missing Workflow**:

- Find books by title/author
- Filter by audiobook status
- Filter by reading status (finished vs currently reading)
  **Implementation**:

```tsx
<input
  type="text"
  placeholder="Search by title or author..."
  onChange={(e) => setSearchQuery(e.target.value)}
/>
<div className="flex gap-2 mt-2">
  <button onClick={() => setFilter('all')}>All</button>
  <button onClick={() => setFilter('audiobook')}>Audiobooks 🎧</button>
  <button onClick={() => setFilter('finished')}>Finished</button>
  <button onClick={() => setFilter('reading')}>Currently Reading</button>
</div>
```

**Effort**: M (4h) | **Value**: CRITICAL - Core usability with 991+ items
**Acceptance**: Can find any book by typing 3+ characters, filters work correctly

---

## Next (This Quarter, <3 months)

### [TESTING] Enhance Zustand Mock Documentation

**File**: src/**mocks**/zustand.ts
**From**: PR #71 Codex review feedback
**Why**: Mock implementation is excellent but lifecycle timing could be clearer
**Enhancement**:

```typescript
/**
 * Reset all stores after each test
 * Wrapped in act() to handle React state updates properly
 *
 * TIMING: Runs after test cleanup but before next test setup
 * This ensures each test starts with a fresh store state
 */
afterEach(() => {
  act(() => {
    storeResetFns.forEach(resetFn => resetFn());
  });
});
```

**Effort**: 5min | **Impact**: LOW - Documentation clarity only
**Value**: Helps future developers understand mock lifecycle

### [REFACTOR] Organize UI Store Tests with Nested Describes

**File**: src/store/**tests**/ui.test.ts:85-470
**From**: PR #71 Codex review feedback
**Why**: With 16 tests now passing, logical grouping would improve readability
**Current**: Flat test structure within single describe blocks
**Proposed**:

```typescript
describe('Theme Management', () => {
  describe('User Interactions', () => {
    // toggle, setDarkMode tests
  });
  describe('Initialization', () => {
    // initializeTheme, backward compatibility tests
  });
  describe('System Integration', () => {
    // media query, DOM sync tests
  });
});
```

**Effort**: 15min | **Impact**: LOW - Organization only
**Value**: Easier to navigate test suite, clearer test categorization
**Note**: No functional changes, pure refactoring

### [ARCHITECTURE] Split God Object: store/ui.ts → Focused Stores

**File**: src/store/ui.ts:1-232
**Perspectives**: architecture-guardian, complexity-archaeologist (multi-agent flag)
**Why**: 8+ distinct concerns in one store (theme + sidebar + modal + search + persistence + system sync). Components import entire store to access one concern. Coupling 6/10, Cohesion 3/10.
**Approach**:

```
Split into domain stores:
1. src/store/theme.ts - Theme state only (isDarkMode, toggleDarkMode, initializeTheme)
2. src/store/navigation.ts - Sidebar + Modal state
3. src/store/search.ts - Search state
Each: 50-80 lines, single responsibility
```

**Effort**: M (4h) | **Impact**: HIGH - Reduces bundle size, enables parallel feature work, clearer boundaries
**Acceptance**: All components updated, tests passing, bundle size reduced by 15%+

### [ARCHITECTURE] Split readingUtils.ts by Domain Responsibility

**File**: src/lib/utils/readingUtils.ts:1-214
**Perspectives**: complexity-archaeologist, architecture-guardian (multi-agent flag)
**Why**: 214 lines mixing 4 responsibilities: data grouping (93 lines) + URL resolution (9 lines) + security validation (120 lines). Violates SRP.
**Approach**:

```
Split into focused modules:
1. src/lib/readings/grouping.ts - groupReadingsByYear, getSortedYearKeys, sortReadingsWithinCategory
2. src/lib/readings/images.ts - getFullImageUrl (simple resolution)
3. src/lib/security/imageValidation.ts - validateImageUrl (SSRF protection)
```

**Effort**: M (3h) | **Impact**: HIGH - Clear security audit surface, independent concerns
**Acceptance**: All imports updated, tests passing, security validation isolated

### [DUPLICATION] Extract Dual-State Pattern from useFormState/useSearchFilters

**Files**: src/hooks/useFormState.ts:54-224, src/hooks/useSearchFilters.ts:64-300
**Perspectives**: complexity-archaeologist
**Why**: 467 lines of 90% duplicated logic (active vs submitted state tracking). Every bug fix needs dual updates.
**Approach**:

```typescript
// New: src/hooks/useDualState.ts (150 lines)
function useDualState<T extends Record<string, unknown>>(initial: T) {
  // Shared: active state, submitted state, submit(), reset(), hasChanges, getChanges()
}

// useFormState becomes 30-line wrapper
export function useFormState<T>(initial: T) {
  return useDualState(initial);
}

// useSearchFilters becomes 50-line wrapper
export function useSearchFilters(configs: FilterConfig[]) {
  const initial = buildInitialFromConfigs(configs);
  const dualState = useDualState(initial);
  return { ...dualState, filterConfigs, getFilterConfig, ... };
}
```

**Effort**: L (3h) | **Impact**: HIGH - Eliminates 150+ lines duplication, single logic point
**Acceptance**: Both hooks pass existing tests, no regression in consuming components

### [REFACTOR] Decouple Components from Zustand via useTheme Hook

**File**: src/app/components/DarkModeToggle.tsx:4
**Perspectives**: architecture-guardian
**Why**: 15+ components directly import from store implementation. Can't swap Zustand for Redux without changing every component.
**Approach**:

```typescript
// New: src/hooks/useTheme.ts (interface abstraction)
export function useTheme(): ThemeHook {
  return { isDarkMode, toggleDarkMode };
}

// Components import from hooks, not store
import { useTheme } from '@/hooks/useTheme';
```

**Effort**: S (1.5h) | **Impact**: MEDIUM - Decouples 15+ components from store implementation
**Acceptance**: Components use useTheme hook, all functionality preserved

### [PERFORMANCE] Memoize Regex Compilation in Search Highlight

**Files**: src/app/components/readings/ReadingsList.tsx:118-149, src/app/components/quotes/QuotesList.tsx:75-106
**Perspectives**: performance-pathfinder
**Why**: Regex compiled 1,137 times per render (379 readings × 3 fields). Causes 100ms lag on search input, 300ms+ on mobile.
**Approach**:

```typescript
const highlightSearchTerm = useMemo(() => {
  if (!searchQuery) return (text: string) => text;
  const escapedSearchTerm = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  return (text: string) => {
    /* use cached regex */
  };
}, [searchQuery]);
```

**Effort**: S (30m per file = 1h total) | **Impact**: 100ms → 10ms on search, 60fps maintained
**Acceptance**: Typing in search has <20ms latency, no jank on mobile

### [UX] Improve ReadingCard Mobile Experience - Always-Visible Metadata

**File**: src/app/components/readings/ReadingCard.tsx:131-258
**Perspectives**: user-experience-advocate
**Why**: All metadata (title, author, date) hidden until hover. Mobile users can't hover. Must tap each card (triggers full overlay), can't scan quickly.
**Approach**:

```tsx
// Show basic info always visible below card
<div className="p-2 bg-white dark:bg-gray-800">
  <h3 className="text-sm font-semibold truncate">{title}</h3>
  <p className="text-xs text-gray-600 truncate">{author}</p>
  <div className="flex items-center gap-2 mt-1">
    {audiobook && <span>🎧</span>}
    <span className="text-xs text-gray-500">{formatDate(finishedDate)}</span>
  </div>
</div>
```

**Effort**: M (2h) | **Impact**: HIGH - Mobile usability + faster scanning
**Acceptance**: Mobile users can read titles without tapping, desktop hover still works

---

## Soon (Exploring, 3-6 months)

- **[PRODUCT] RSS/Atom Feeds** - Syndication feeds for readings/quotes (adoption driver, retention hook) - S (1-2d)
- **[PRODUCT] Blog/Writing Section** - Original long-form content, thought leadership platform - M (3-5d)
- **[PRODUCT] Quote Collections/Themes** - Organize 991 quotes by tags/themes, curated playlists - M (3-4d)
- **[PRODUCT] Social Sharing Metadata** - OpenGraph + Twitter Cards for rich link previews - S (0.5-1d)
- **[PRODUCT] Quote Cards Generator** - Generate shareable quote images with brand styling - M (4-5d)
- **[FEATURE] Reading Stats Dashboard** - Books per year, reading pace, genre breakdown charts - M (3-4d)
- **[ARCHITECTURE] Repository Pattern for lib/data.ts** - Abstract file system implementation, enable CMS migration - M (2h)
- **[TESTING] Error Boundary Test Coverage** - Test error.tsx (0%), global-error.tsx (0%) - M (2h)
- **[TESTING] Accessibility Test Coverage** - FocusTrap (0%), keyboard navigation - L (3h)
- **[QUALITY] Standardize Error Logging** - Replace console.error with logger throughout - S (2h)

---

## Later (Someday/Maybe, 6+ months)

- **[PRODUCT] Public API for Content** - JSON endpoints for readings/quotes/projects
- **[PRODUCT] Reading Notes/Highlights** - First-class thoughts/notes feature with linking
- **[PRODUCT] Project Case Studies** - Deep-dive explanations, technical challenges, outcomes
- **[INTEGRATION] Webmentions/IndieWeb** - Decentralized comments/likes from other sites
- **[FEATURE] Client-Side Search** - Fuse.js fuzzy search across all content
- **[FEATURE] Reading List Export** - CSV/JSON export for data portability
- **[OPTIMIZATION] Virtual Scrolling** - For lists > 100 items (readings future-proofing)
- **[REFACTOR] Extract Date/Highlight Utils** - From ReadingsList (408 lines → 320 lines)
- **[REFACTOR] Decompose initializeTheme** - 85-line function → composed operations
- **[CLEANUP] Delete useDebouncedSearch Wrapper** - Shallow pass-through function
- **[CLEANUP] Inline placeholderUtils** - Single-use utility into ReadingCard

---

## Learnings

**From this grooming session (2025-10-23):**

**Multi-Agent Cross-Validation Signals:**

- **ui.ts god object** flagged by 3 agents (complexity, architecture, maintainability) = fundamental design issue
- **readingUtils.ts mixed concerns** flagged by 2 agents (complexity, architecture) = clear refactoring target
- **Dual-state duplication** flagged by complexity-archaeologist = 467 lines of compounding debt

**Architecture Strengths to Preserve:**

- `utils/keyboard/*` is exemplar of modular design (2/10 coupling, 9/10 cohesion)
- No circular dependencies found (clean dependency graph)
- Proper layering: app → components → lib → types

**Critical vs Urgent Distinction:**

- Test coverage gap is CRITICAL (blocks confidence) but not urgent (no production fires)
- Bundle size is urgent (affects users now) but not critical (site still works)
- Security issue is medium (local context only, not production exploit)

**Product Insight:**

- 80/20 rule: 3 features (Blog + RSS + Quote Collections) would unlock 80% of potential value
- Current positioning: Portfolio → Future: Intellectual platform
- Missing table stakes: RSS feeds, social metadata, search (expected by target audience)

**Performance Reality Check:**

- Codebase already well-optimized (static generation, minimal dependencies)
- Real issues: unnecessary data in bundle (thoughts field), repeated regex compilation
- Most "optimizations" would be premature (virtual scrolling, memoization everywhere)

**Technical Debt Hierarchy:**

1. **Compounding** (fix first): Duplication in hooks, god objects, shallow wrappers
2. **Strategic** (fix when scaling): Repository pattern, component decomposition
3. **Tactical** (fix when convenient): Naming, documentation, minor refactors

---

## Priority Rationale (80/20 Applied)

**Now section focuses on:**

1. **Unblock development** (test isolation) - Can't trust changes without tests
2. **Security hygiene** (command injection) - Low-hanging fruit, quick fix
3. **User-facing perf** (bundle size) - Measurable 75% improvement in 2-3h
4. **Core usability** (search) - Site breaks at scale without this

**Next section focuses on:**

1. **Architectural foundation** (split god objects) - Enables parallel feature work
2. **Eliminate duplication** (extract dual-state) - Saves 150+ lines, future velocity
3. **Performance quick wins** (memoize regex) - 90% improvement in 1h
4. **Mobile experience** (always-visible metadata) - 40%+ of traffic

**Soon section = validated opportunities:**

- RSS/blog = product transformation (portfolio → platform)
- Quote collections = unique differentiator (no competitor has this)
- Stats dashboard = viral shareability (gamification)

**Later section = captured ideas for future consideration:**

- Keep list short (not graveyard)
- Delete freely on next groom
- Only items that still spark genuine excitement

**What we pruned from old backlog:**

- ✅ Removed "Recently Completed" section - belongs in git history, not backlog
- ✅ Consolidated overlapping items (3 separate "testing" items → 2 focused ones)
- ✅ Deleted vague items ("comprehensive JSDoc") - too broad, not actionable
- ✅ Moved radical simplification to separate doc - different path, not incremental

---

## Success Metrics

**Now:** Sprint velocity should improve after test coverage + architectural cleanup
**Next Quarter:** Feature development should accelerate (split stores enable parallel work)
**6 Months:** Site transformed from portfolio to content platform (blog + RSS + collections)

**Coverage Target:** 80% (currently 43%)
**Bundle Target:** <1MB (currently 2MB, readings page 124KB → 30KB quick win)
**User Retention:** RSS subscribers + search usage = stickiness signals

---

## Next Grooming: 2026-01-23 (3 months)

**Focus areas for next session:**

1. Did Now items unblock development velocity?
2. Are architectural splits paying off (parallel feature work happening)?
3. Has product direction clarified (blog launched? RSS adopted?)?
4. New technical debt accumulated in last 3 months?
5. Update Later list - delete stale ideas, promote exciting ones

**Keep backlog alive** - evolves with learning, market shifts, technical discoveries.
