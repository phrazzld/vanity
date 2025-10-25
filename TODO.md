# TODO: Favorite Readings Feature

## Context

**Approach**: Remove thoughts field entirely, add favorite boolean field with UI filtering
**Key Insight**: Most reading files already have no body content - cleanup is minimal
**Pattern Source**: Follow audiobook field implementation throughout codebase
**Breaking Change**: Removing thoughts from Reading type - coordinate all layers simultaneously

## Module Boundaries

**Type Layer** (`src/types/reading.ts`): Single source of truth for Reading shape

- Owns: Reading, ReadingInput, ReadingListItem interfaces
- Breaking change propagates from here to all dependent modules

**Data Layer** (`src/lib/data.ts`): Parses markdown, returns Reading objects

- Owns: File reading, frontmatter parsing, Reading object construction
- Depends: Type layer
- Deep module: Hides markdown parsing complexity behind clean Reading interface

**CLI Layer** (`cli/`): Interactive reading management

- Owns: User prompts, frontmatter generation, file writes
- Depends: Type layer (ReadingFrontmatter), data layer (for listing)
- Clear boundary: CLI never touches React components

**Component Layer** (`src/app/components/readings/`): Display and filtering

- Owns: Visual representation, user interactions, filtering logic
- Depends: Type layer, data layer
- Module value: Hides rendering complexity, provides simple props interface

## Implementation Tasks

### Phase 1: Type System Foundation (Breaking Change)

- [ ] Remove thoughts from all Reading interfaces

  ```
  File: src/types/reading.ts
  Changes:
    - Line 35: Delete "thoughts: string;"
    - Line 53: Delete "thoughts?: string;" from ReadingInput
  Pattern: Clean removal - no replacement needed
  Success: TypeScript compilation fails in expected places (data, cli, tests)
  Module: Type layer - single source of truth
  Time: 2min
  Note: This intentionally breaks compilation - fixes come in next tasks
  ```

- [ ] Add favorite to all Reading interfaces
  ```
  File: src/types/reading.ts
  Changes:
    - Line 38 (after audiobook): Add "favorite?: boolean;"
    - Line 54 (ReadingInput): Add "favorite?: boolean;"
    - Line 69 (ReadingListItem): Add "favorite?: boolean;"
  Pattern: Follow audiobook field placement and style
  Success: TypeScript recognizes favorite field
  Module: Type layer extension
  Time: 2min
  ```

### Phase 2: Data Layer Adaptation

- [ ] Update data.ts to remove thoughts, add favorite

  ```
  File: src/lib/data.ts
  Changes:
    - Line 29: Remove "thoughts: content.trim(),"
    - Line 30: Add "favorite: (data.favorite as boolean) || false,"
  Pattern: Follow audiobook parsing pattern (line 30)
  Success: getReadings() returns Reading objects without thoughts, with favorite
  Test: npm test -- data.test.ts (will fail initially - fix in test task)
  Module: Data layer - maintains Reading interface contract
  Time: 3min
  ```

- [ ] Update data layer tests
  ```
  File: src/lib/__tests__/data.test.ts
  Changes:
    - Lines 157, 166: Remove thoughts fields from mock data
    - Lines 186, 195, 220, 228, 249, 253, 257: Remove content: 'X thoughts'
    - Add favorite: true to 2-3 mock readings for coverage
  Pattern: Mirror production data structure
  Success: npm test -- data.test.ts passes
  Module: Test isolation - validates data layer contract
  Time: 10min
  ```

### Phase 3: CLI Simplification

- [ ] Remove thoughts prompts from CLI reading add

  ```
  File: cli/commands/reading.ts
  Remove:
    - Lines 272-298: Entire thoughts prompt and editor section
    - Line 19: ThoughtsPrompt import
  Pattern: Clean deletion of unused workflow
  Success: CLI add flow simpler, no editor opening
  Module: CLI prompt flow
  Time: 3min
  ```

- [ ] Add favorite prompt to CLI reading add

  ```
  File: cli/commands/reading.ts
  Add after line 161 (audiobook prompt):

    // Favorite prompt
    const { favorite } = await inquirer.prompt<{ favorite: boolean }>([
      {
        type: 'confirm',
        name: 'favorite',
        message: 'Mark as favorite?',
        default: false,
      },
    ]);

  Add to frontmatter (line 389):
    if (favorite) {
      frontmatter.favorite = favorite;
    }

  Pattern: Exact match to audiobook implementation (lines 154-161, 389-391)
  Success: CLI prompts for favorite, saves to frontmatter
  Module: CLI add command - self-contained prompt logic
  Time: 5min
  ```

- [ ] Remove thoughts from CLI reading update

  ```
  File: cli/commands/reading.ts
  Remove:
    - Line 818: '💭 Update thoughts' choice
    - Lines 894-911: Thoughts update case
    - Lines 630, 690-707: Thoughts from updateMultipleFields
  Pattern: Surgical removal from menu and handlers
  Success: Update menu doesn't offer thoughts option
  Module: CLI update command
  Time: 8min
  ```

- [ ] Add favorite toggle to CLI reading update

  ```
  File: cli/commands/reading.ts
  Add to choices (line 817):
    { name: '⭐ Toggle favorite status', value: 'favorite' }

  Add handler (after line 893, audiobook case):
    else if (updateAction === 'favorite') {
      const currentStatus = typedFrontmatter.favorite || false;
      updatedFrontmatter.favorite = !currentStatus;
      console.log(
        chalk.green(
          `✓ ${updatedFrontmatter.favorite ? 'Marked as favorite' : 'Removed favorite status'}`
        )
      );
    }

  Add to updateMultipleFields choices (line 628):
    { name: 'Favorite Status', value: 'favorite' }

  Add to updateMultipleFields handler (after audiobook case):
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

  Pattern: Mirror audiobook toggle implementation
  Success: CLI can toggle favorite on/off
  Module: CLI update command - extends existing menu structure
  Time: 10min
  ```

- [ ] Remove thoughts from CLI reading list

  ```
  File: cli/commands/reading.ts
  Remove: Lines 451-457 (thoughts display logic)
  Pattern: Clean removal from display output
  Success: List command shows readings without thoughts
  Module: CLI list command
  Time: 2min
  ```

- [ ] Update CLI types
  ```
  File: cli/types/index.ts
  Changes:
    - Line 31-33: Remove ThoughtsPrompt interface
    - Line 163: Add "favorite?: boolean;" to ReadingFrontmatter
  Pattern: Keep types synchronized with data model
  Success: TypeScript compilation succeeds
  Module: CLI type definitions
  Time: 2min
  ```

### Phase 4: Component Enhancement

- [ ] Add favorite indicator to ReadingCard

  ```
  File: src/app/components/readings/ReadingCard.tsx
  Changes:
    - Line 30 (ReadingCardProps destructure): Add "favorite"
    - Line 60 (destructure): Add ", favorite"
    - Line 101 (aria-label): Append "${favorite ? ', Favorite' : ''}"

    After line 184 (audiobook badge), add:
      {favorite && (
        <div
          style={{
            position: 'absolute',
            top: audiobook ? '44px' : '8px',
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
              color: '#fbbf24',
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )}

  Pattern: Exact match to audiobook badge structure (lines 148-184)
  Success: Star badge appears on hover for favorites, stacks below audiobook
  Module: ReadingCard - encapsulates badge rendering logic
  Time: 10min
  ```

- [x] Add favorites filter to ReadingsList

  ```
  Work Log:
  - Added useState for showOnlyFavorites filter
  - Implemented filter button with star icon UI
  - Filter applied before rendering (filteredReadings)
  - Removed obsolete thoughts references (lines 391-397)
  - Follows audiobook badge pattern for consistency

  File: src/app/components/readings/ReadingsList.tsx
  Changes:
    - After imports: Add "import { useState } from 'react';"
    - In component body (early): Add "const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);"
    - Before grouping logic: Add filter
      const filteredReadings = showOnlyFavorites
        ? readings.filter(r => r.favorite)
        : readings;
    - Replace "readings" with "filteredReadings" in grouping logic
    - Add filter button before year sections (find appropriate location in JSX)

  Filter button JSX:
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
          transition: 'all 0.2s ease',
        }}
        aria-label={showOnlyFavorites ? 'Show all readings' : 'Show only favorites'}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {showOnlyFavorites ? 'Show All' : 'Favorites Only'}
      </button>
    </div>

  Pattern: Simple filter state, standard button styling
  Success: Filter toggles between all/favorites, button state updates
  Module: ReadingsList - owns filtering logic, presents filtered view
  Time: 15min
  ```

### Phase 5: Test Updates

- [ ] Update ReadingCard tests

  ```
  File: src/app/components/readings/__tests__/ReadingCard.test.tsx
  Changes:
    - Line 380: Change "thoughts: undefined," to "favorite: undefined,"
    - Add test cases:
      * "renders favorite badge when favorite is true"
      * "does not render favorite badge when favorite is false"
      * "stacks favorite badge below audiobook badge"
      * "includes favorite in aria-label"
  Pattern: Follow existing audiobook test patterns
  Success: All ReadingCard tests pass
  Module: Component contract validation
  Time: 15min
  ```

- [~] Update ReadingsList tests

  ```
  File: src/app/components/readings/__tests__/ReadingsList.test.tsx
  Changes:
    - Add favorite: true to some mock readings
    - Add test cases:
      * "renders favorites filter toggle"
      * "filters to only favorites when active"
      * "shows all readings when inactive"
      * "filter button has correct aria-label"
  Pattern: Test state management and filtering logic
  Success: All ReadingsList tests pass
  Module: Filter behavior validation
  Time: 20min
  ```

- [ ] Update accessibility tests
  ```
  File: src/app/components/__tests__/AllComponents.a11y.test.tsx
  Changes:
    - Add favorite: true to some mock data
    - Verify no new violations with favorite badge
    - Verify filter button keyboard accessible
  Pattern: Maintain WCAG 2.1 AA compliance
  Success: No accessibility violations
  Module: A11y compliance verification
  Time: 10min
  ```

### Phase 6: Content & Documentation

- [ ] Clean reading markdown files (if needed)

  ```
  Files: content/readings/*.md
  Action: Verify all files are frontmatter-only (already true for most)
  Script: For any files with body content, remove it
  Success: All .md files contain only YAML frontmatter
  Module: Content layer - pure data
  Time: 5min
  Note: Can create Node script if many files need cleaning
  ```

- [ ] Mark demo favorites in content

  ```
  Files: Choose 3-5 reading files
  Action: Add "favorite: true" to frontmatter
  Success: Demo data ready for testing filter
  Module: Content layer
  Time: 3min
  ```

- [ ] Update CLAUDE.md documentation
  ```
  File: CLAUDE.md
  Changes:
    - Line 24: Update to "npm run vanity -- reading add       # Interactive prompts (title, author, status, audiobook, favorite)"
    - Line 25: Update to "npm run vanity -- reading update    # Mark finished, toggle favorite, or delete"
  Success: Documentation matches implementation
  Module: Project documentation
  Time: 2min
  ```

## Validation Strategy

**Incremental Validation**:

- After Phase 1: `npm run typecheck` should fail in expected places (data.ts, CLI, tests)
- After Phase 2: Data layer tests pass
- After Phase 3: CLI commands work manually
- After Phase 4: Component rendering works
- After Phase 5: Full test suite passes

**Final Validation** (not TODO items - just workflow):

```bash
npm run typecheck  # Zero errors
npm test          # 100% pass rate
npm run lint      # Clean output
npm run build     # Successful build
```

**Manual Smoke Test**:

1. `npm run vanity -- reading add` → prompts for favorite
2. `npm run vanity -- reading update` → can toggle favorite
3. `npm run dev` → filter works, badges render

## Time Estimate

- Phase 1: 5min (types)
- Phase 2: 15min (data layer)
- Phase 3: 30min (CLI)
- Phase 4: 25min (components)
- Phase 5: 45min (tests)
- Phase 6: 10min (content/docs)

**Total: ~2.5 hours** (single focused session)

## Notes

**Module Value Analysis**:

- **Type Layer**: Deep module - simple boolean field, hides nothing (appropriate for types)
- **Data Layer**: Deep - hides markdown parsing, provides clean Reading interface
- **CLI Layer**: Deep - hides inquirer complexity, provides interactive workflow
- **Component Layer**: Deep - hides rendering logic, provides prop-based interface
- **Filter Logic**: Shallow but correct - simple array.filter, no abstraction needed

**Why This Order**:

1. Types first → intentional breakage reveals all dependents
2. Data next → foundation for both CLI and UI
3. CLI before UI → independent, can be tested in isolation
4. Components → depends on data layer
5. Tests last → validate complete integration

**Parallel Opportunities**:

- After Phase 2: CLI (Phase 3) and Components (Phase 4) can be done in parallel
- They don't interact - CLI writes files, Components read via data layer

**Avoided Complexity**:

- No over-abstraction of favorite logic
- No unnecessary filter state management library
- No premature optimization of markdown processing
- Simple boolean toggle, not rating system
