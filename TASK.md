# TASK: Add Favorite Readings Feature + Remove Thoughts Field

## Context

**Feature Goal**: Enable users to mark certain readings as "favorites" with visual indicators and filtering, while simplifying the reading data model by removing the underutilized "thoughts" field.

**Rationale**:

- **Favorites**: Quick way to highlight exceptional reads, simpler than full review system
- **Remove thoughts**: Field rarely used, adding complexity without value. Simplifies data model and CLI workflow.
- **UI Consistency**: Favorite indicator follows same hover-reveal pattern as audiobook badge

**Impact**:

- Removes ~500 lines of thoughts-related code (CLI editor integration, types, UI)
- Adds ~200 lines for favorites (types, UI filter, CLI toggle)
- Net simplification: ~300 LOC reduction
- Breaking change: All existing thoughts content will be deleted

## Implementation Tasks

### Phase 1: Remove Thoughts Field

- [ ] **Remove thoughts content from all reading markdown files**

  ```
  Files: content/readings/*.md
  Approach: Read each file, parse frontmatter, remove body content, rewrite with empty body
  Script: Can use Node.js script with gray-matter to batch process
  Why: Clean slate - thoughts data not needed going forward
  Success: All reading files have empty bodies (only frontmatter remains)
  Risk: Irreversible - verify backup exists before proceeding
  Time: 15min
  ```

- [ ] **Remove thoughts from Reading type**

  ```
  File: src/types/reading.ts:35
  Change: Delete line "thoughts: string;"
  Also update: ReadingInput (line 53) - remove "thoughts?: string;"
  Why: Type safety - field no longer exists in data
  Success: TypeScript compilation succeeds
  Test: npm run typecheck
  Time: 2min
  ```

- [ ] **Remove thoughts from data layer**

  ```
  Files:
  - src/lib/data.ts:156-160 (getReadingBySlug return)
  - src/lib/data.ts:204-208 (getReadings return)
  - src/lib/static-data.ts (if thoughts referenced)

  Approach: Remove thoughts from destructured returns
  Why: Data layer should only return fields that exist
  Success: All data functions omit thoughts field
  Test: npm test -- data.test.ts
  Time: 10min
  ```

- [ ] **Remove thoughts from CLI - reading add command**

  ```
  File: cli/commands/reading.ts:272-298
  Lines to remove:
  - Thoughts prompt (lines 272-280)
  - Thoughts editor logic (lines 281-298)
  - ThoughtsPrompt import from types

  Why: Simplify reading creation workflow
  Success: CLI no longer prompts for thoughts
  Test: npm run vanity -- reading add (manual verification)
  Time: 5min
  ```

- [ ] **Remove thoughts from CLI - reading update command**

  ```
  File: cli/commands/reading.ts
  Changes:
  - Remove 'Update thoughts' choice from menu (line 818)
  - Remove thoughts update case (lines 894-911)
  - Remove thoughts from updateMultipleFields (lines 630, 690-707)
  - Remove thoughts from preview display (line 301)

  Why: No longer editable field
  Success: CLI update menu doesn't show thoughts option
  Test: npm run vanity -- reading update (manual verification)
  Time: 10min
  ```

- [ ] **Remove thoughts from CLI - reading list command**

  ```
  File: cli/commands/reading.ts:451-457
  Remove: Thoughts display in list output
  Why: Field no longer exists
  Success: List command shows readings without thoughts
  Test: npm run vanity -- reading list
  Time: 3min
  ```

- [ ] **Remove thoughts from CLI types**

  ```
  File: cli/types.ts
  Remove: ThoughtsPrompt interface (if exists)
  Why: Type no longer used
  Success: TypeScript compilation succeeds
  Time: 2min
  ```

- [ ] **Update ReadingsList component**

  ```
  File: src/app/components/readings/ReadingsList.tsx
  Search for: "thoughts" references
  Action: Remove any thoughts-related props, state, or rendering
  Why: Component should not handle removed field
  Success: Component renders without thoughts
  Test: npm test -- ReadingsList.test.tsx
  Time: 5min
  ```

- [ ] **Update data layer tests**

  ```
  File: src/lib/__tests__/data.test.ts
  Changes: Remove thoughts from mock data and assertions
  Why: Tests should reflect current data model
  Success: All data tests pass
  Test: npm test -- data.test.ts
  Time: 10min
  ```

- [ ] **Update component tests**

  ```
  Files:
  - src/app/components/readings/__tests__/ReadingCard.test.tsx
  - src/app/components/readings/__tests__/ReadingsList.test.tsx
  - src/app/components/readings/__tests__/YearSection.test.tsx
  - src/app/components/__tests__/AllComponents.a11y.test.tsx

  Changes: Remove thoughts from mock data
  Why: Tests should use valid data shape
  Success: All component tests pass
  Test: npm test -- components
  Time: 15min
  ```

### Phase 2: Add Favorite Field

- [ ] **Add favorite to Reading type**

  ```
  File: src/types/reading.ts:38
  Add after audiobook: "favorite?: boolean;"
  Also update: ReadingInput (line 54), ReadingListItem (line 69)
  Why: Type definition for new field
  Success: TypeScript recognizes favorite field
  Test: npm run typecheck
  Time: 2min
  ```

- [ ] **Add favorite to data layer**

  ```
  Files:
  - src/lib/data.ts:156-160 (getReadingBySlug)
  - src/lib/data.ts:204-208 (getReadings)

  Changes: Add favorite to destructured returns
  Default: undefined (optional field, defaults to false/undefined if not set)
  Why: Data functions should return favorite status
  Success: favorite field available in returned data
  Test: npm test -- data.test.ts
  Time: 5min
  ```

- [ ] **Add favorite to CLI - reading add command**

  ```
  File: cli/commands/reading.ts:161
  Add after audiobook prompt:

  // Favorite prompt
  const { favorite } = await inquirer.prompt<{ favorite: boolean }>([
    {
      type: 'confirm',
      name: 'favorite',
      message: 'Mark as favorite?',
      default: false,
    },
  ]);

  Then add to frontmatter (line 390):
  if (favorite) {
    frontmatter.favorite = favorite;
  }

  Why: Allow setting favorite on creation
  Success: CLI prompts for favorite, saves to frontmatter
  Test: npm run vanity -- reading add
  Time: 5min
  ```

- [ ] **Add favorite toggle to CLI - reading update command**

  ```
  File: cli/commands/reading.ts:817
  Add to choices array:
  { name: '⭐ Toggle favorite status', value: 'favorite' }

  Then add case (after audiobook case, line 893):
  else if (updateAction === 'favorite') {
    const currentStatus = typedFrontmatter.favorite || false;
    updatedFrontmatter.favorite = !currentStatus;
    console.log(
      chalk.green(
        `✓ ${updatedFrontmatter.favorite ? 'Marked as favorite' : 'Removed favorite status'}`
      )
    );
  }

  Also add to updateMultipleFields choices (line 630):
  { name: 'Favorite Status', value: 'favorite' }

  And add favorite case in updateMultipleFields (after audiobook):
  else if (field === 'favorite') {
    const currentStatus = updatedFrontmatter.favorite || false;
    const { isFavorite } = await inquirer.prompt<{ isFavorite: boolean }>([
      {
        type: 'confirm',
        name: 'isFavorite',
        message: 'Mark as favorite?',
        default: currentStatus,
      },
    ]);
    updatedFrontmatter.favorite = isFavorite;
  }

  Why: Enable toggling favorite status
  Success: CLI can toggle favorite on/off
  Test: npm run vanity -- reading update
  Time: 10min
  ```

- [ ] **Add favorite to CLI types**

  ```
  File: cli/types.ts
  Add: ReadingFrontmatter interface should include favorite?: boolean
  Why: Type safety for frontmatter
  Success: TypeScript compilation succeeds
  Time: 2min
  ```

- [ ] **Add favorite indicator to ReadingCard**

  ```
  File: src/app/components/readings/ReadingCard.tsx
  Location: After audiobook badge (line 184)

  Add prop: favorite?: boolean to ReadingCardProps

  Add JSX (inside hover-overlay, after audiobook badge):
  {favorite && (
    <div
      style={{
        position: 'absolute',
        top: audiobook ? '44px' : '8px', // Stack below audiobook if present
        right: '8px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Favorite"
    >
      <svg
        style={{
          width: '16px',
          height: '16px',
          color: '#fbbf24', // amber-400
        }}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
  )}

  Update aria-label (line 101):
  aria-label={`${title} by ${author}, ${statusText}${audiobook ? ', Audiobook' : ''}${favorite ? ', Favorite' : ''}`}

  Why: Visual indicator for favorite readings (hover only)
  Success: Star badge appears on hover for favorite readings
  Test: npm test -- ReadingCard.test.tsx
  Time: 15min
  ```

- [ ] **Add filter to ReadingsList**

  ```
  File: src/app/components/readings/ReadingsList.tsx

  Add state:
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  Add filter logic before grouping:
  const filteredReadings = showOnlyFavorites
    ? readings.filter(r => r.favorite)
    : readings;

  Add filter toggle UI (before year sections):
  <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
    <button
      onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: showOnlyFavorites ? 'var(--primary-color)' : 'transparent',
        color: showOnlyFavorites ? 'white' : 'var(--text-color)',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      aria-label={showOnlyFavorites ? 'Show all readings' : 'Show only favorites'}
    >
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {showOnlyFavorites ? 'Show All' : 'Favorites Only'}
    </button>
  </div>

  Update component to use filteredReadings for grouping

  Why: Allow filtering to only favorite readings
  Success: Toggle button filters reading list
  Test: npm test -- ReadingsList.test.tsx
  Time: 20min
  ```

- [ ] **Update ReadingCard tests**

  ```
  File: src/app/components/readings/__tests__/ReadingCard.test.tsx

  Add test cases:
  - Should render favorite badge when favorite is true
  - Should not render favorite badge when favorite is false/undefined
  - Should stack favorite badge below audiobook badge when both present
  - Should include favorite in aria-label when favorite is true

  Mock data: Add favorite: true to some test readings

  Why: Ensure favorite indicator works correctly
  Success: All tests pass
  Test: npm test -- ReadingCard.test.tsx
  Time: 15min
  ```

- [ ] **Update ReadingsList tests**

  ```
  File: src/app/components/readings/__tests__/ReadingsList.test.tsx

  Add test cases:
  - Should render favorites filter toggle
  - Should filter to only favorites when toggle is active
  - Should show all readings when toggle is inactive
  - Filter button should have correct aria-label

  Mock data: Mark some readings as favorites

  Why: Ensure filter functionality works
  Success: All tests pass
  Test: npm test -- ReadingsList.test.tsx
  Time: 20min
  ```

- [ ] **Update data layer tests**

  ```
  File: src/lib/__tests__/data.test.ts

  Changes:
  - Add favorite: true to some mock readings
  - Verify favorite field is returned from getReadings
  - Verify favorite field is returned from getReadingBySlug

  Why: Ensure data layer handles favorite field
  Success: Tests pass with favorite field
  Test: npm test -- data.test.ts
  Time: 10min
  ```

- [ ] **Update accessibility tests**

  ```
  File: src/app/components/__tests__/AllComponents.a11y.test.tsx

  Changes:
  - Add favorite: true to mock data
  - Verify no a11y violations with favorite badge
  - Verify filter toggle is keyboard accessible

  Why: Maintain WCAG 2.1 AA compliance
  Success: No new accessibility violations
  Test: npm test -- a11y
  Time: 10min
  ```

### Phase 3: Documentation & Verification

- [ ] **Update CLAUDE.md**

  ```
  File: CLAUDE.md:27
  Update reading add description:
  npm run vanity -- reading add       # Interactive prompts (title, author, status, audiobook, favorite)

  Remove line 25:
  npm run vanity -- reading update    # Mark finished, add thoughts, or delete

  Replace with:
  npm run vanity -- reading update    # Mark finished, toggle favorite, or delete

  Why: Reflect new CLI behavior
  Success: Documentation accurate
  Time: 3min
  ```

- [ ] **Update READING_SUMMARY.md (if exists)**

  ```
  File: READING_SUMMARY.md
  Changes:
  - Remove thoughts statistics (if present)
  - Add favorite count/percentage statistics (optional)

  Why: Documentation accuracy
  Success: Summary reflects current features
  Time: 5min
  ```

- [ ] **Run full test suite**

  ```
  Command: npm test
  Expected: All 345+ tests pass
  Why: Ensure no regressions
  Success: 100% test pass rate
  Time: 5min
  ```

- [ ] **Run typecheck**

  ```
  Command: npm run typecheck
  Expected: No TypeScript errors
  Why: Verify type safety
  Success: Zero TypeScript errors
  Time: 2min
  ```

- [ ] **Run lint**

  ```
  Command: npm run lint
  Expected: No linting errors
  Why: Code quality standards
  Success: Clean lint output
  Time: 2min
  ```

- [ ] **Manual testing - CLI**

  ```
  Tests:
  1. npm run vanity -- reading add
     - Should prompt for favorite
     - Should NOT prompt for thoughts
     - Should save favorite to frontmatter

  2. npm run vanity -- reading update
     - Should show "Toggle favorite status" option
     - Should NOT show "Update thoughts" option
     - Toggle should work correctly

  3. npm run vanity -- reading list
     - Should display readings
     - Should show ⭐ for favorites
     - Should NOT show thoughts snippets

  Why: Verify CLI changes work in practice
  Success: All CLI flows work as expected
  Time: 15min
  ```

- [ ] **Manual testing - UI**

  ```
  Tests:
  1. npm run dev
  2. Navigate to /readings
  3. Hover over favorite reading
     - Star badge should appear
  4. Click "Favorites Only" filter
     - List should filter correctly
  5. Hover over reading with both audiobook and favorite
     - Badges should stack vertically

  Why: Verify UI changes work correctly
  Success: Visual polish, no UI bugs
  Time: 10min
  ```

- [ ] **Mark a few readings as favorites in content**

  ```
  Action: Edit 3-5 reading markdown files
  Add to frontmatter: favorite: true
  Files: Choose personal favorites from content/readings/

  Why: Demo data for testing, showcase feature
  Success: Filter works with real data
  Time: 5min
  ```

## Success Criteria

**Core Functionality**:

- ✅ Thoughts field completely removed (code, data, UI, CLI)
- ✅ Favorite field added and functional
- ✅ Star badge displays on hover for favorites
- ✅ Filter toggle works correctly
- ✅ CLI can set/toggle favorite status
- ✅ All tests pass (unit, component, accessibility)

**Quality Gates**:

- ✅ TypeScript: Zero errors (`npm run typecheck`)
- ✅ Tests: 100% pass rate (`npm test`)
- ✅ Lint: Clean output (`npm run lint`)
- ✅ Accessibility: No violations (a11y tests)
- ✅ Build: Successful (`npm run build`)

**Documentation**:

- ✅ CLAUDE.md updated
- ✅ This TASK.md serves as implementation record
- ✅ Code comments updated where necessary

## Module Boundaries

**Data Layer** (`src/lib/`):

- **Owns**: Reading data parsing, markdown processing
- **Changes**: Remove thoughts, add favorite to returns
- **Coupling**: Types layer (Reading interface)
- **Risk**: Low - straightforward field changes

**Type Layer** (`src/types/`):

- **Owns**: TypeScript interfaces for readings
- **Changes**: Remove thoughts, add favorite
- **Coupling**: All layers depend on these types
- **Risk**: Medium - breaking change, must update all dependents

**CLI Layer** (`cli/`):

- **Owns**: Reading management commands
- **Changes**: Remove thoughts prompts/editor, add favorite toggle
- **Coupling**: Data layer, gray-matter, inquirer
- **Risk**: Medium - workflow changes, needs manual testing

**Component Layer** (`src/app/components/readings/`):

- **Owns**: Reading display UI
- **Changes**: Add favorite badge, add filter toggle
- **Coupling**: Types layer, data layer
- **Risk**: Low - additive changes, well-tested

**Content Layer** (`content/readings/`):

- **Owns**: Reading markdown files
- **Changes**: Delete all body content (thoughts)
- **Coupling**: None (pure data)
- **Risk**: HIGH - IRREVERSIBLE deletion, verify backup first

## Time Estimate

**Phase 1 (Remove Thoughts)**: 2-3 hours

- Code changes: 1.5 hours
- Test updates: 1 hour
- Testing: 30 minutes

**Phase 2 (Add Favorites)**: 3-4 hours

- Type/data changes: 30 minutes
- CLI changes: 1 hour
- UI changes: 1.5 hours
- Test updates: 1 hour
- Testing: 30 minutes

**Phase 3 (Polish)**: 1 hour

- Documentation: 15 minutes
- Manual testing: 30 minutes
- Demo data: 15 minutes

**Total**: 6-8 hours (1-2 work days)

## Risk Assessment

**High Risk**:

- ❗ Deleting thoughts content is IRREVERSIBLE
- ❗ Breaking change in Reading type affects entire codebase
- Mitigation: Verify backup exists, create branch, thorough testing

**Medium Risk**:

- ⚠️ CLI workflow changes may confuse existing users
- ⚠️ UI filter state management could introduce bugs
- Mitigation: Manual testing, comprehensive test coverage

**Low Risk**:

- ℹ️ Favorite badge positioning with audiobook badge
- ℹ️ Type definition order/placement
- Mitigation: Visual testing, TypeScript validation

## Notes

**Why Remove Thoughts**:

- Feature complexity doesn't justify usage
- Thoughts content present in <10% of readings (estimated)
- Editor integration adds ~200 LOC for minimal value
- Simpler data model easier to maintain

**Why Add Favorites**:

- Quick, low-friction way to highlight great reads
- No text input required (boolean toggle)
- Common pattern users understand (star/favorite)
- Enables future features (favorite stats, recommendations)

**Design Decisions**:

- Hover-only indicator: Keeps card design clean, consistent with audiobook pattern
- Filter toggle (not sort): Users can still see all readings, favorites just filtered
- CLI integration: Power users can quickly mark favorites without leaving terminal
- Boolean field: Simple, no ratings/levels needed

**What We're NOT Doing**:

- Migrating thoughts to separate file/system
- Adding favorite counts/statistics (future enhancement)
- Sorting by favorites (just filtering)
- Adding favorite indicator to non-hover state
- Creating favorites-only page (single filter sufficient)

**Future Enhancements** (out of scope):

- Favorite statistics in READING_SUMMARY.md
- "Random favorite" selector
- Favorite books influence for recommendations
- Export favorites list
- Favorite badge animation on toggle
