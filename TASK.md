# PRD: Reread Tracking with Visual Badges

## Executive Summary

Transform reread tracking from separate entries to augmented display of existing entries. Books read multiple times will appear in the reading list for each completion year, with "x2", "x3" badges displayed on subsequent reads. This maintains the existing CLI workflow (`reading add` with `-02` suffix) while improving the user experience by making rereads visually distinct and trackable without cluttering the interface.

**Problem**: Currently, rereads are stored as separate files (`gatsby-02.md`) but displayed identically to first reads, making it unclear when a book is a reread and obscuring the reading history.

**Solution**: Detect reread files during static generation, compute reread sequence numbers, and display badges on ReadingCard components for second, third, etc. reads.

**User Value**: Reading list accurately reflects reading history, honors the significance of rereading meaningful books, and provides visual clarity about which books had lasting impact.

**Success Criteria**:

- 6 existing reread books display with "x2" badges
- Badge appears alongside audiobook/favorite badges on hover
- Build time increases by <100ms for reread detection
- Zero breaking changes to CLI workflow

---

## User Context

**Who**: Personal reading list curator managing 383 markdown files (377 unique books + 6 rereads)

**Problem Being Solved**:

- Rereads are indistinguishable from first reads in the UI
- Reading history doesn't reflect the number of times a book was read
- Stats don't accurately represent engagement (reading "How to Read a Book" twice is different than reading it once)

**Measurable Benefits**:

- Instant visual identification of reread books
- Accurate representation of reading engagement
- Preserved shareability: each read has its own card with year context
- Enhanced stats: can track "total readings" vs "unique books"

---

## Requirements

### Functional Requirements

**FR1**: Detect reread files during static generation

- Match pattern: `[base-slug]-0[2-9].md` or `[base-slug]-[1-9][0-9].md`
- Extract base slug and sequence number from filename
- Group reread files with base file to determine read count

**FR2**: Compute reread sequence for each reading

- First read (base file): `readCount = 1` (no badge)
- Second read (`-02` file): `readCount = 2` (x2 badge)
- Third read (`-03` file): `readCount = 3` (x3 badge)
- Support up to 99 rereads per book

**FR3**: Display reread badges on ReadingCard

- Position: Top-right corner, below audiobook badge (if present), above favorite badge (if present)
- Visibility: Only during hover state (consistent with other badges)
- Style: Circular badge matching audiobook/favorite badge design
- Text: "x2", "x3", etc. in white text
- Accessibility: Add "Read N times" to aria-label

**FR4**: Maintain existing reading list display logic

- Show each read in its completion year section
- First read appears without badge
- Subsequent reads appear with badges
- Sorting within year by finishedDate (most recent first)

**FR5**: No CLI changes required

- Keep `reading add` command for creating new rereads
- Continue using `-02`, `-03` filename suffixes
- Existing 6 reread files work without migration

### Non-Functional Requirements

**NFR1**: Performance

- Static generation overhead: <100ms for reread detection (383 files)
- No runtime performance impact (computed at build time)
- Badge rendering: same performance as audiobook/favorite badges

**NFR2**: Security

- No new external dependencies
- Filename parsing uses safe regex patterns
- No risk of injection attacks (static content only)

**NFR3**: Reliability

- Graceful handling of missing base files (orphaned `-02` files)
- Clear error logging for invalid reread sequences (e.g., `-04` without `-03`)
- Existing books unaffected if reread detection fails

**NFR4**: Maintainability

- Reread logic isolated in utility functions
- Clear separation: detection (build time) vs display (component)
- Well-tested edge cases: missing base, out-of-order sequences, high counts

---

## Architecture Decision

### Selected Approach: Build-Time Aggregation with Separate Files

**Description**: Keep current `-02` filename pattern, detect and group rereads during static generation, add `readCount` field to JSON output, display badges in ReadingCard component.

**Rationale**:

1. **Simplicity**: No migration needed for 6 existing rereads
2. **User Value**: Maintains independent completion dates for each read
3. **Explicitness**: Clear file-to-read mapping (`-02` = second read)
4. **Separation**: CLI remains unchanged, display logic enhanced

**Module Boundaries**:

```
scripts/generate-static-data.js (build time)
├─ detectRereads(files[]) → Map<baseSlug, rereadFiles[]>
├─ computeReadCount(slug, rereadMap) → number
└─ Enhanced generateReadings() → adds readCount field

src/app/components/readings/ReadingCard.tsx (runtime)
├─ ReadCountBadge({ count, audiobook, favorite })
└─ Enhanced ReadingCard → displays badge if readCount > 1

src/lib/utils/readingUtils.ts (utilities)
└─ parseRereadSlug(slug) → { baseSlug, sequence } | null
```

**Abstraction Layers**:

- **Build Layer**: Transforms markdown files → JSON with reread metadata
- **Data Layer**: Static JSON with `readCount` field (1 for first reads, 2+ for rereads)
- **Display Layer**: ReadingCard interprets `readCount` and renders badge

### Alternatives Considered

| Approach                              | Value               | Simplicity      | Risk               | Why Not Chosen                                                         |
| ------------------------------------- | ------------------- | --------------- | ------------------ | ---------------------------------------------------------------------- |
| **Single file with dates array**      | High (true history) | Low (migration) | High (CLI rewrite) | Requires migrating 6 files, rewriting CLI, breaking existing patterns  |
| **Frontmatter reread flag**           | Medium              | Medium          | Medium             | Requires manual editing of 6 files, inconsistent with filename pattern |
| **Build-time aggregation (selected)** | High                | High            | Low                | ✅ Chosen - zero breaking changes, aligns with existing patterns       |
| **Runtime aggregation**               | Medium              | Medium          | Low                | Performance overhead, complicates client logic, no real benefit        |

---

## Dependencies & Assumptions

### Dependencies

- **Existing**: `gray-matter` for YAML parsing, Next.js Image, React hooks
- **No New Dependencies**: All logic uses built-in JavaScript (regex, array methods)

### External Systems

- **Build Process**: `scripts/generate-static-data.js` runs before `npm run build`
- **CLI**: `npm run vanity -- reading add` continues working unchanged
- **Static JSON**: `public/data/readings.json` serves as data source

### Assumptions

- **Scale**: <50 rereads total in foreseeable future
- **Sequence**: Rereads use `-02`, `-03`, `-04` pattern (no gaps allowed)
- **Coverage**: All rereads have `-0N` suffix (not `-2` or `-002`)
- **Base Files**: Every `-02` file has corresponding base file (`.md`)
- **Environment**: Build process has filesystem access to `/content/readings`

---

## Implementation Phases

### Phase 1: Build-Time Detection (MVP - 3 hours)

**Goal**: Detect rereads and add `readCount` to JSON

**Tasks**:

1. Add `parseRereadSlug()` utility function to `readingUtils.ts`
   - Input: `"gatsby-02"` → Output: `{ baseSlug: "gatsby", sequence: 2 }`
   - Handle edge cases: `"gatsby"` (no suffix), `"my-book-02"` (hyphenated titles)

2. Add `detectRereads()` to `generate-static-data.js`
   - Build map: `{ "gatsby": ["gatsby.md", "gatsby-02.md"], ... }`
   - Validate sequences: warn if `-03` exists without `-02`

3. Enhance `generateReadings()` to compute `readCount`
   - For each file, determine if it's a reread (lookup in map)
   - Add `readCount` field: 1 for base files, 2 for `-02`, etc.
   - Add `baseSlug` field for grouping (future stats enhancement)

4. Update TypeScript types in `src/types/reading.ts`
   - Add `readCount?: number` to `Reading` interface
   - Add `baseSlug?: string` for future use

**Validation**:

- Run `npm run build` successfully
- Verify `public/data/readings.json` contains `readCount: 2` for 6 reread files
- Check build logs show reread detection summary: "Detected 6 rereads across 6 books"

### Phase 2: Badge Display (2 hours)

**Goal**: Display "x2", "x3" badges on ReadingCard

**Tasks**:

1. Create `ReadCountBadge` component in `ReadingCard.tsx`
   - Match existing badge styling (circular, 28px, dark background)
   - Position: `top: audiobook ? (favorite ? 80px : 44px) : (favorite ? 44px : 8px)`
   - Text: `×${count}` (using × symbol, not letter x)

2. Update `ReadingCard` component
   - Accept `readCount` prop from `ReadingCardProps`
   - Render `ReadCountBadge` if `readCount > 1`
   - Update aria-label: `"Title by Author, Finished Date, Read N times"`

3. Update CSS variables if needed
   - May need `--badge-offset` calculation for stacked badges
   - Ensure consistent 36px vertical spacing between badges

**Validation**:

- Visual test: Hover over "How to Read a Book" (2019 section) shows "x2" badge
- Accessibility test: Screen reader announces "Read 2 times"
- Position test: Badge doesn't overlap with audiobook/favorite badges
- Mobile test: Badge visible and tappable on touch devices

### Phase 3: Testing & Edge Cases (2 hours)

**Goal**: Comprehensive test coverage and error handling

**Tasks**:

1. Unit tests for `parseRereadSlug()`
   - Test cases: `"gatsby"`, `"gatsby-02"`, `"my-long-book-title-03"`, `"edge-case-99"`
   - Edge cases: `"book-2"` (not a reread), `"book-"` (invalid), `null`, `undefined`

2. Integration tests for `detectRereads()`
   - Mock filesystem with sample reread files
   - Verify correct grouping and sequence validation
   - Test warnings for missing base files or sequence gaps

3. Component tests for `ReadCountBadge`
   - Render test: Badge shows correct text ("x2", "x3")
   - Position test: Badge positions correctly with/without audiobook/favorite
   - Accessibility test: aria-label includes read count
   - Hide test: Badge hidden for `readCount === 1` or `undefined`

4. Snapshot tests for ReadingCard with reread badges
   - Update snapshots to include new badge
   - Test multiple badge combinations: audiobook + reread, favorite + reread, all three

**Validation**:

- All tests pass: `npm test`
- Coverage: >90% for new functions
- Build succeeds: `npm run build`
- Lint passes: `npm run lint`
- Type check passes: `npm run typecheck`

---

## Risks & Mitigation

| Risk                                                 | Likelihood | Impact | Mitigation                                                                                                                              |
| ---------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Build time increases significantly**               | Low        | Medium | Profile with 383 files. If >100ms, implement caching based on filename patterns. Worst case: 1-2ms per file = 766ms total (acceptable). |
| **Badge positioning breaks with 3+ badges**          | Medium     | Low    | Use dynamic offset calculation: `top: 8 + (badgeIndex * 36)px`. Test with all combinations.                                             |
| **Orphaned reread files (e.g., `-02` without base)** | Low        | Low    | Log warnings during build, render without badge. Add validation to CLI in future.                                                       |
| **Large reread counts (x10+) break badge styling**   | Low        | Low    | Use `font-size: 9px` for counts >9. Test up to x99.                                                                                     |
| **Screen reader announces badges awkwardly**         | Medium     | Medium | Test with VoiceOver/NVDA. Adjust aria-label wording based on feedback.                                                                  |
| **Future CLI changes break detection logic**         | Low        | High   | Document filename pattern requirements in CLI code. Add integration test.                                                               |

---

## Key Decisions

### Decision 1: Keep Separate Files vs Migrate to Single File

**What**: Maintain current `-02` filename pattern instead of migrating to single file with dates array.

**Alternatives**:

- Single file with `finishedDates: [date1, date2, date3]`
- Frontmatter flag `reread: true`

**Rationale**:

- **User Value**: Each read has independent metadata (different cover editions, audiobook vs print)
- **Simplicity**: Zero migration, zero CLI changes, 6 existing files work immediately
- **Explicitness**: Filename clearly shows read sequence

**Tradeoffs**:

- ✅ No breaking changes
- ✅ Preserves historical data as-is
- ❌ More files to manage (not a real issue with 383 total)
- ❌ Can't easily show "first read 2017, reread 2019" on single card (acceptable - shows in both years)

### Decision 2: Display Each Read Separately vs Single Card with Badge

**What**: Show book in multiple year sections (once per read) with badge on subsequent reads.

**Alternatives**:

- Single card in most recent year with "Read 3 times (2017, 2019, 2024)"
- Dedicated "Rereads" section

**Rationale**:

- **User Value**: Honors each reading as distinct event in life timeline
- **Simplicity**: Minimal changes to existing grouping logic
- **Explicitness**: Year sections accurately reflect "what I read in 2019"

**Tradeoffs**:

- ✅ Accurate chronological history
- ✅ No new UI sections needed
- ❌ Book appears multiple times (acceptable - user explicitly requested this)

### Decision 3: Badge Only on Hover vs Always Visible

**What**: Show reread badge only during hover state (like audiobook/favorite badges).

**Alternatives**:

- Always visible at bottom of card
- In hover overlay text

**Rationale**:

- **Simplicity**: Consistent with existing badge pattern
- **User Value**: Minimalist design, reduces visual noise
- **Explicitness**: Badge clearly indicates "this is the Nth read"

**Tradeoffs**:

- ✅ Clean design, no clutter
- ✅ Consistent with existing patterns
- ❌ Requires hover to see (acceptable for supplemental metadata)

### Decision 4: Build-Time vs Runtime Detection

**What**: Detect rereads during static generation, add `readCount` to JSON.

**Alternatives**:

- Compute reread count in React component at runtime
- Use API route to compute on-demand

**Rationale**:

- **Performance**: Zero runtime overhead, computed once at build
- **Simplicity**: Single source of truth (JSON), no client-side logic
- **Explicitness**: `readCount` field clearly documents intent

**Tradeoffs**:

- ✅ Fastest possible runtime
- ✅ Cacheable, works offline
- ❌ Requires rebuild to update (acceptable for static content)

---

## Quality Validation

### Deep Modules Check

- ✅ **rereadUtils**: Simple interface (`parseRereadSlug(slug)`) hides regex complexity
- ✅ **ReadCountBadge**: Simple props (`count, audiobook, favorite`) hides positioning logic
- ✅ **generateReadings()**: Enhanced internal implementation, unchanged external API

### Information Hiding

- ✅ **Hidden**: Regex patterns, badge offset calculations, sequence validation logic
- ✅ **Exposed**: `readCount` field in JSON (callers need this), badge component props
- ✅ **No Leakage**: Changing filename pattern doesn't affect ReadingCard component

### Abstraction Layers

- **Layer 1 (Files)**: Markdown files with `-0N` naming convention
- **Layer 2 (Data)**: JSON with `readCount` field (transforms filenames → metadata)
- **Layer 3 (Display)**: React components with badge UI (transforms metadata → visuals)
- Each layer changes vocabulary: `gatsby-02` → `readCount: 2` → `"x2"` badge

### Strategic Design

- ✅ **Investing in Future**: `baseSlug` field enables future stats ("45 unique books, 51 total readings")
- ✅ **Not Just Feature**: Enhanced data model supports future enhancements (reading timeline, reread frequency analysis)
- ✅ **Reducing Complexity**: Single `readCount` field eliminates need for client-side filename parsing

---

## Summary

**Approach Selected**: Build-time reread detection with badge display on ReadingCard components.

**User Value**:

- Immediate visual distinction between first reads and rereads
- Accurate reflection of reading history
- Enhanced reading list credibility (shows engagement, not just collection)

**Timeline Estimate**:

- Phase 1 (Build detection): 3 hours
- Phase 2 (Badge display): 2 hours
- Phase 3 (Testing): 2 hours
- **Total**: 7 hours

**Complexity Assessment**: **Low-Medium**

- ✅ No new dependencies
- ✅ No CLI changes
- ✅ Follows existing patterns (badges, static generation)
- ⚠️ Moderate testing surface (filename parsing edge cases, badge positioning)
- ⚠️ Requires careful TypeScript type updates

**Key Decisions**:

1. Keep separate files (no migration)
2. Display each read in its year section (not collapsed)
3. Badge on hover only (consistent with other badges)
4. Build-time detection (best performance)

**Next Steps**: Run `/plan` to break this down into actionable implementation tasks with file-level specificity.
