# TODO: Reread Tracking with Visual Badges

## Context

**Architecture**: Build-Time Reread Detection with Inline Badge Components (DESIGN.md)

**Key Design Decisions**:

- Reuse existing `cli/lib/reading-reread.ts` utilities (findExistingReadings pattern)
- Compute reread metadata at build time (zero runtime overhead)
- Display badges on hover (consistent with AudiobookBadge/FavoriteBadge)
- Use flat `scripts/` structure per existing codebase patterns

**Key Files**:

- `cli/lib/reading-reread.ts` - Enhanced with parseRereadSlug, buildRereadMap, computeReadCount
- `scripts/generate-static-data.js` - Integrate reread detection into generateReadings()
- `src/types/reading.ts` - Add readCount and baseSlug optional fields
- `src/app/components/readings/ReadingCard.tsx` - Add ReadCountBadge component

**Existing Patterns**:

- Badge components: AudiobookBadge (line 18-56), FavoriteBadge (line 58-91)
- Build script: generate-static-data.js uses gray-matter, console.log, CommonJS
- CLI utilities: reading-reread.ts uses TypeScript, exports functions with JSDoc
- Tests: Jest with `it()` assertions, `__tests__/` subdirectories, RTL for components

**Architecture Validation Notes**:

- ✅ Approved with modifications (see architecture-strategist review)
- ⚠️ Use flat `scripts/` structure (not `scripts/lib/`)
- ⚠️ Tests go in `__tests__/` subdirectories
- ⚠️ Maintain existing TypeScript patterns in CLI utilities

## Implementation Tasks

### Phase 1: Build-Time Detection (Core Module)

- [x] **Enhance reading-reread.ts with reread detection utilities**

  ```
  Files: cli/lib/reading-reread.ts (lines 1-127, add ~60 lines)
  Architecture: Implements RereadDetector module from DESIGN.md section 2
  Pseudocode: See DESIGN.md sections 5.1 (Detection/Grouping) and 5.2 (Read Count)

  Tasks:
  1. Add parseRereadSlug(slug: string): { baseSlug: string; sequence: number } | null
     - Extract base slug and sequence from filenames (gatsby-02 → {baseSlug: "gatsby", sequence: 2})
     - Regex pattern: /-(\d+)$/ matches -02, -03, -99
     - Handle edge cases: no suffix (sequence = 1), null/undefined (return null)

  2. Add buildRereadMap(filenames: string[]): Map<string, string[]>
     - Group files by base slug (gatsby.md, gatsby-02.md → Map{"gatsby" => [...]})
     - Sort files within groups (base file first, then numbered versions)
     - Leverage existing findExistingReadings pattern (lines 20-37)

  3. Add computeReadCount(slug: string, rereadMap: Map<string, string[]>): number
     - Lookup base slug in map, return position (1-indexed)
     - Fallback to 1 for unmapped slugs (orphaned files)

  4. Add validateRereadSequences(rereadMap: Map<string, string[]>): void
     - Check for sequence gaps (gatsby-02, gatsby-04 missing gatsby-03)
     - Log warnings with console.warn() for invalid sequences
     - Non-fatal - continues processing with warnings

  Pattern: Follow existing findExistingReadings structure (RegExp, sort, filter)
  Types: Export TypeScript interfaces for RereadSlugInfo, RereadMap
  Docs: Add JSDoc comments matching existing function documentation style

  Success Criteria:
  - parseRereadSlug("gatsby-02") returns { baseSlug: "gatsby", sequence: 2 }
  - buildRereadMap groups 6 existing reread files correctly
  - computeReadCount("gatsby-02", map) returns 2
  - validateRereadSequences logs warnings for sequence gaps
  - TypeScript compilation succeeds with strict mode
  - Exports match DESIGN.md Module 1 interface specification

  Test Strategy:
  - Unit tests in cli/lib/__tests__/reading-reread.test.ts
  - Test cases: base slugs, numbered suffixes, hyphenated titles, edge cases
  - Mock filesystem for integration scenarios
  - Coverage target: >95% for new functions

  Dependencies: None (pure functions, Node.js built-ins only)
  Time Estimate: 2 hours
  ```

- [x] **Integrate reread detection into static data generation**

  ```
  Files: scripts/generate-static-data.js (line 104-139, add ~15 lines)
  Architecture: Enhances StaticDataGenerator module from DESIGN.md section 3
  Pseudocode: See DESIGN.md section 5.2 (Read Count Computation)

  Tasks:
  1. Import reread utilities from cli/lib/reading-reread.ts
     const { parseRereadSlug, buildRereadMap, computeReadCount, validateRereadSequences } =
       require('../cli/lib/reading-reread');

  2. In generateReadings() before files.map() loop:
     - Build reread map: const rereadMap = buildRereadMap(files);
     - Validate sequences: validateRereadSequences(rereadMap);

  3. In files.map() for each reading:
     - Compute readCount: const readCount = computeReadCount(slug, rereadMap);
     - Parse base slug: const parsed = parseRereadSlug(slug);
     - Add fields to output: readCount, baseSlug: parsed?.baseSlug || slug

  4. Add summary logging after processing:
     - Count rereads: readings.filter(r => r.readCount > 1).length
     - Count unique books: new Set(readings.map(r => r.baseSlug)).size
     - Log: "✓ Detected N rereads across M books (X total readings)"

  Pattern: Follow existing gray-matter parsing loop structure (lines 107-119)
  Error Handling: Graceful degradation - if detection fails, default readCount=1

  Success Criteria:
  - Build completes successfully (npm run build)
  - public/data/readings.json includes readCount and baseSlug fields
  - 6 existing reread files have readCount=2 in JSON output
  - Build logs show reread detection summary
  - Build time increase <100ms (measure with time npm run build)
  - No breaking changes to existing JSON structure

  Test Strategy:
  - Integration test in scripts/__tests__/generate-static-data.test.js
  - Verify JSON output structure with readCount/baseSlug fields
  - Test with mock markdown files (base, -02, -03 suffixes)
  - Test orphaned files and sequence gaps (warnings logged, non-fatal)

  Dependencies: cli/lib/reading-reread.ts (must be implemented first)
  Time Estimate: 1.5 hours
  ```

- [x] **Add TypeScript type definitions for reread metadata**

  ```
  Files: src/types/reading.ts (lines 12-71, add ~10 lines)
  Architecture: Extends Reading/ReadingListItem interfaces from DESIGN.md section 8.1

  Tasks:
  1. Add optional fields to Reading interface (after line 38):
     /** Number of times this book has been read (1 for first read, 2+ for rereads) */
     readCount?: number;

     /** Base slug without suffix (for grouping rereads of same book) */
     baseSlug?: string;

  2. Add same optional fields to ReadingListItem interface (after line 70):
     readCount?: number;
     baseSlug?: string;

  3. DO NOT add to ReadingInput interface (computed fields, not user input)

  Pattern: Match existing optional fields (audiobook?, favorite? lines 35-38)
  Type Safety: Optional fields maintain backward compatibility

  Success Criteria:
  - TypeScript compilation succeeds (npm run typecheck)
  - No breaking changes to existing code using Reading types
  - ReadingCard component accepts readCount prop without type errors
  - Static data generation outputs match new type shape

  Test Strategy: Type-checked at compile time, no runtime tests needed

  Dependencies: None (standalone type definitions)
  Time Estimate: 15 minutes
  ```

### Phase 2: UI Component (Badge Display)

- [ ] **Implement ReadCountBadge component in ReadingCard**

  ```
  Files: src/app/components/readings/ReadingCard.tsx (after line 91, add ~50 lines)
  Architecture: Implements ReadCountBadge module from DESIGN.md section 2.2
  Pseudocode: See DESIGN.md section 5.4 (Badge Positioning)

  Tasks:
  1. Create ReadCountBadge component after FavoriteBadge (line 91):
     function ReadCountBadge({ count, audiobook, favorite }: {
       count: number;
       audiobook?: boolean;
       favorite?: boolean;
     }) {
       if (count <= 1) return null;

       const topOffset = 8 + (audiobook ? 36 : 0) + (favorite ? 36 : 0);
       const fontSize = count > 9 ? '9px' : '11px';

       return (
         <div style={{
           position: 'absolute',
           top: `${topOffset}px`,
           right: '8px',
           width: '28px',
           height: '28px',
           borderRadius: '50%',
           backgroundColor: 'rgba(0, 0, 0, 0.7)',
           border: '1px solid rgba(255, 255, 255, 0.2)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
         }} aria-label={`Read ${count} times`}>
           <span style={{
             color: 'rgba(255, 255, 255, 0.9)',
             fontSize,
             fontWeight: 600,
             letterSpacing: '-0.02em',
           }}>
             ×{count}
           </span>
         </div>
       );
     }

  2. Update ReadingCardProps type (line 106):
     - Already includes readCount from ReadingListItem type ✓

  3. Destructure readCount in ReadingCard function (line 130):
     - Add readCount to destructured props

  4. Render badge in hover overlay (after line 227, before hover content):
     {readCount && readCount > 1 && (
       <ReadCountBadge count={readCount} audiobook={audiobook} favorite={favorite} />
     )}

  5. Update aria-label to include read count (line 178):
     const readCountText = readCount && readCount > 1 ? `, Read ${readCount} times` : '';
     aria-label={`${title} by ${author}, ${statusText}${audiobookText}${favoriteText}${readCountText}`}

  Pattern: Follow AudiobookBadge/FavoriteBadge structure (lines 18-91)
  Positioning: Match existing badge offset pattern (line 64: top: audiobook ? '44px' : '8px')
  Styling: Reuse badge style constants (28px size, 8px offset, rgba colors)

  Success Criteria:
  - Badge renders on hover for readCount > 1
  - Badge does not render for readCount = 1 or undefined
  - Badge positions correctly below audiobook/favorite badges (8px, 44px, 80px)
  - Font size adjusts for counts >9 (9px vs 11px)
  - Aria-label includes "Read N times" text
  - Visual appearance matches AudiobookBadge/FavoriteBadge style
  - No visual regressions on existing badges

  Test Strategy:
  - Component tests in __tests__/ReadingCard.test.tsx
  - Test badge rendering with different readCount values (1, 2, 3, 15)
  - Test positioning combinations (audiobook only, favorite only, both, all three)
  - Test aria-label includes read count
  - Snapshot test for badge visual regression
  - Manual QA: Hover over reread cards, verify badge appears correctly

  Dependencies: src/types/reading.ts (readCount field must exist)
  Time Estimate: 1.5 hours
  ```

### Phase 3: Testing & Validation

- [ ] **Write unit tests for reread detection utilities**

  ```
  Files: cli/lib/__tests__/reading-reread.test.ts (add ~150 lines)
  Architecture: Tests RereadDetector module from DESIGN.md section 9.1

  Test Cases:
  1. parseRereadSlug:
     - Base slug without suffix: "gatsby" → { baseSlug: "gatsby", sequence: 1 }
     - Slug with -02 suffix: "gatsby-02" → { baseSlug: "gatsby", sequence: 2 }
     - Hyphenated titles: "how-to-read-a-book-03" → { baseSlug: "how-to-read-a-book", sequence: 3 }
     - High sequence numbers: "popular-book-15" → { baseSlug: "popular-book", sequence: 15 }
     - Invalid suffixes: "book-2" (no leading zero) → treated as base slug
     - Null/undefined: returns null

  2. buildRereadMap:
     - Groups rereads correctly: ["gatsby.md", "gatsby-02.md"] → Map{"gatsby" => [...]}
     - Sorts files by sequence: ["gatsby-03.md", "gatsby.md", "gatsby-02.md"] → ordered
     - Handles single books: ["1984.md"] → Map{"1984" => ["1984.md"]}
     - Empty input: [] → empty Map

  3. computeReadCount:
     - First read: computeReadCount("gatsby", map) → 1
     - Second read: computeReadCount("gatsby-02", map) → 2
     - Third read: computeReadCount("1984-03", map) → 3
     - Unmapped slug: computeReadCount("unknown", map) → 1

  4. validateRereadSequences:
     - Valid sequence: no warnings for [1, 2, 3]
     - Gap in sequence: warns for [1, 2, 4] (missing -03)
     - Missing base file: warns for [2, 3] (no base .md)

  Pattern: Use `it()` assertions (existing convention), `describe` blocks for grouping
  Setup: Create temp directory with mock markdown files using fs.writeFileSync
  Cleanup: Remove temp files in afterEach() hook

  Success Criteria:
  - All test cases pass (npm test -- reading-reread)
  - Coverage >95% for new functions (npm run test:coverage)
  - Tests follow existing patterns in reading-reread.test.ts
  - No flaky tests (run 3 times, all pass)

  Dependencies: cli/lib/reading-reread.ts implementation
  Time Estimate: 2 hours
  ```

- [ ] **Write component tests for ReadCountBadge**

  ```
  Files: src/app/components/readings/__tests__/ReadingCard.test.tsx (add ~80 lines)
  Architecture: Tests ReadCountBadge component from DESIGN.md section 9.2

  Test Cases:
  1. Badge rendering:
     - Renders ×2 badge for readCount=2
     - Renders ×3 badge for readCount=3
     - Does not render for readCount=1
     - Does not render for undefined readCount

  2. Badge positioning:
     - Top: 8px with no other badges
     - Top: 44px with audiobook badge (8 + 36)
     - Top: 44px with favorite badge (8 + 36)
     - Top: 80px with both audiobook and favorite (8 + 36 + 36)

  3. Font size adjustment:
     - 11px font for readCount ≤9
     - 9px font for readCount >9 (e.g., 15)

  4. Accessibility:
     - Badge has aria-label="Read N times"
     - ReadingCard aria-label includes "Read N times" text
     - Badge visible on hover (same as other badges)

  5. Visual regression:
     - Snapshot test with readCount=2 badge
     - Snapshot test with all three badges (audiobook + favorite + reread)

  Pattern: Use React Testing Library (screen, render, fireEvent)
  Mocking: Mock Next.js Image (existing pattern lines 34-65)
  Hover: Use fireEvent.mouseEnter(card) to trigger hover state

  Success Criteria:
  - All test cases pass (npm test -- ReadingCard)
  - Coverage includes new ReadCountBadge component
  - Snapshots updated (UPDATE_SNAPSHOTS=true npm test)
  - Tests use existing mocks and patterns

  Dependencies: ReadCountBadge implementation in ReadingCard.tsx
  Time Estimate: 1.5 hours
  ```

- [ ] **Write integration test for build process with rereads**

  ```
  Files: scripts/__tests__/generate-static-data.test.js (add ~60 lines)
  Architecture: Tests StaticDataGenerator integration from DESIGN.md section 9.3

  Test Cases:
  1. JSON output structure:
     - readings.json includes readCount field
     - readings.json includes baseSlug field
     - First read has readCount=1
     - Second read has readCount=2
     - Both share same baseSlug

  2. Reread detection:
     - Detects 6 existing rereads in content/readings/
     - Groups files correctly (how-to-read-a-book.md, how-to-read-a-book-02.md)
     - Computes correct readCount for each file

  3. Logging:
     - Build logs include "Detected N rereads" message
     - Build logs include unique book count
     - Warnings logged for invalid sequences (if present)

  4. Error handling:
     - Orphaned reread files (no base) handled gracefully (readCount=1)
     - Sequence gaps logged as warnings (non-fatal)
     - Build completes successfully despite warnings

  Pattern: Mock fs operations, test actual files in content/readings/
  Setup: Use existing readings directory, don't create temp files
  Assertions: Verify JSON structure, field presence, correct values

  Success Criteria:
  - Test passes with real content/readings/ files
  - JSON output matches expected structure
  - Build process completes without errors
  - Warnings logged appropriately for edge cases

  Dependencies: All previous tasks (detection, integration, types)
  Time Estimate: 1 hour
  ```

### Phase 4: Manual QA & Polish

- [ ] **Manual QA and visual verification**

  ```
  Architecture: Final validation per DESIGN.md success criteria

  Tasks:
  1. Build and run dev server:
     npm run build
     npm run dev

  2. Navigate to /readings page

  3. Verify 6 reread books display with badges:
     - How to Read a Book (2019 section) - should show ×2 badge
     - Phil Gordon's Little Green Book (verify year, ×2 badge)
     - Steppenwolf (verify year, ×2 badge)
     - The Fountainhead (verify year, ×2 badge)
     - The Metamorphosis of Prime Intellect (verify year, ×2 badge)
     - The Sovereign Individual (verify year, ×2 badge)

  4. Test badge positioning:
     - Hover over reread with audiobook flag (badge below audiobook)
     - Hover over reread with favorite flag (badge below favorite)
     - Hover over reread with both flags (badge below both, at 80px)

  5. Test accessibility:
     - Tab to ReadingCard, verify focus ring
     - Screen reader announces "Read N times"
     - Badge visible on focus (not just hover)

  6. Test responsive design:
     - Mobile viewport (375px): Badge visible and properly sized
     - Tablet viewport (768px): Badge positioning correct
     - Desktop viewport (1440px): No layout issues

  7. Verify no regressions:
     - First reads (no badge) display normally
     - Audiobook/favorite badges still work
     - Year grouping unchanged
     - Sort order within years correct

  8. Performance check:
     - Page load time not significantly increased
     - No console errors
     - No React warnings

  Success Criteria:
  - All 6 rereads show correct badges (×2)
  - Badge positioning correct for all combinations
  - No visual regressions on existing features
  - Accessibility requirements met (WCAG 2.1 AA)
  - Mobile/tablet/desktop all work correctly
  - No performance degradation

  Test Strategy: Manual browser testing, cross-browser check (Chrome, Safari, Firefox)
  Time Estimate: 1 hour
  ```

- [ ] **Update snapshots and final validation**

  ```
  Files: src/app/components/readings/__tests__/*.snapshot.test.tsx

  Tasks:
  1. Update component snapshots:
     UPDATE_SNAPSHOTS=true npm test -- ReadingCard.snapshot

  2. Review snapshot changes:
     - Verify ReadCountBadge appears in snapshot
     - Confirm no unintended style changes
     - Check all three badge combinations captured

  3. Run full test suite:
     npm test

  4. Run type checking:
     npm run typecheck

  5. Run linting:
     npm run lint

  6. Verify build succeeds:
     npm run build

  7. Check build output:
     - public/data/readings.json includes new fields
     - Build time increase <100ms from baseline
     - No build warnings or errors

  Success Criteria:
  - All tests pass (npm test exits 0)
  - Type check passes (npm run typecheck exits 0)
  - Linting passes (npm run lint exits 0)
  - Build succeeds (npm run build exits 0)
  - Snapshots updated and committed

  Dependencies: All previous tasks complete
  Time Estimate: 30 minutes
  ```

## Design Iteration Checkpoints

**After Phase 1 (Build-Time Detection)**:

- Review module boundaries: Is RereadDetector truly hiding complexity?
- Review performance: Is build time increase <100ms as expected?
- Extract patterns: Any reusable utilities emerging?

**After Phase 2 (UI Components)**:

- Review badge positioning: Does dynamic offset scale to 4+ badges?
- Review component coupling: Can ReadCountBadge work standalone?
- Identify improvements: Font size cutoff optimal at >9?

**After Phase 3 (Testing)**:

- Review test coverage: Are edge cases handled (orphaned files, high counts)?
- Review test patterns: Any brittle tests that need improvement?
- Document learnings: Update ARCHITECTURE.md with implementation notes

**After Phase 4 (QA)**:

- Review user experience: Badge visibility and clarity
- Review accessibility: Screen reader announcements clear?
- Plan future enhancements: Stats dashboard, timeline view

## Success Metrics

**Build Time**: <100ms increase (baseline: measure before implementation)
**Test Coverage**: >90% for new functions (check with npm run test:coverage)
**Visual Regression**: Zero unintended changes to existing features
**Accessibility**: WCAG 2.1 AA compliance (verified with axe DevTools)
**Performance**: No perceivable page load impact (<10ms)

## Out of Scope (BACKLOG.md)

These are intentionally excluded from this PR:

- Stats dashboard showing "377 unique books, 383 total readings"
- Reread timeline visualization
- "Most reread books" section
- CLI validation to prevent sequence gaps during `reading add`
- Build-time cache optimization for reread detection
- Migrate existing 6 reread files to new format (keep as-is)

## Notes

**Architecture Validation Feedback**:

- ✅ Use flat `scripts/` structure (not `scripts/lib/`)
- ✅ Tests go in `__tests__/` subdirectories
- ✅ Maintain TypeScript in CLI utilities
- ✅ Use `it()` assertions (not `test()`) per existing conventions
- ✅ Follow existing badge positioning pattern (8px + 36px \* badgeCount)

**Implementation Order**:
Phase 1 and Phase 2 can be parallelized after type definitions are added.
Phase 3 tests require Phase 1+2 implementations complete.
Phase 4 requires everything complete.

**Time Estimate**: 8 hours total (includes validation checkpoint reviews)
