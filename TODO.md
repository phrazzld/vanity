# TODO: Fix Favorites Feature Display

## Context

Favorites feature (star badges + filter toggle) implemented but not visible on readings page.

**Root Cause:**

1. YearSection doesn't pass `favorite` prop to ReadingCard
2. ReadingsPage doesn't have filter toggle UI
3. ReadingsList component has filter logic but isn't used on main page

**Architecture Issue:** Filter logic exists in ReadingsList but would be duplicated in ReadingsPage. Must extract shared logic to avoid duplication.

## Implementation Tasks

### Phase 1: Extract Shared Filter Logic

- [x] **Create useReadingsFilter hook**

  File: `src/hooks/useReadingsFilter.ts`

  Extract filter state and logic from ReadingsList component into reusable hook:

  ```tsx
  export function useReadingsFilter(readings: Reading[]) {
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const filteredReadings = useMemo(
      () => (showOnlyFavorites ? readings.filter(r => r.favorite) : readings),
      [readings, showOnlyFavorites]
    );
    return { filteredReadings, showOnlyFavorites, setShowOnlyFavorites };
  }
  ```

  Success criteria: Hook encapsulates all filter state management, returns filtered readings and toggle function

- [x] **Create ReadingsFilterToggle component**

  File: `src/app/components/readings/ReadingsFilterToggle.tsx`

  Extract filter button UI from ReadingsList (lines 182-205) into standalone component:

  ```tsx
  interface ReadingsFilterToggleProps {
    active: boolean;
    onToggle: () => void;
  }
  ```

  Success criteria: Component renders star icon + toggle button with proper styling and accessibility attributes

### Phase 2: Update Existing Components

- [x] **Refactor ReadingsList to use extracted logic**

  File: `src/app/components/readings/ReadingsList.tsx`

  Replace inline filter state (lines 164-169) and button UI (lines 182-205) with:
  - Import and use `useReadingsFilter` hook
  - Import and render `<ReadingsFilterToggle>` component
  - Use `filteredReadings` from hook instead of local state

  Success criteria: ReadingsList behavior unchanged, all tests pass, code is DRY

- [x] **Add favorite prop to ReadingCard in YearSection**

  File: `src/app/components/readings/YearSection.tsx` (line ~94)

  Add missing prop to ReadingCard:

  ```tsx
  <ReadingCard
    key={reading.slug}
    slug={reading.slug}
    title={reading.title}
    author={reading.author}
    coverImageSrc={reading.coverImageSrc}
    audiobook={reading.audiobook}
    favorite={reading.favorite} // ADD THIS LINE
    finishedDate={reading.finishedDate}
  />
  ```

  Success criteria: Star badges now visible on hover for favorited readings

### Phase 3: Add Filter to Readings Page

- [x] **Add favorites filter to ReadingsPage**

  File: `src/app/readings/page.tsx`

  Changes:
  1. Import `useReadingsFilter` hook and `ReadingsFilterToggle` component
  2. Add filter logic before grouping (line ~37):
     ```tsx
     const { filteredReadings, showOnlyFavorites, setShowOnlyFavorites } = useReadingsFilter(
       result.data
     );
     setReadings(filteredReadings);
     ```
  3. Add `<ReadingsFilterToggle>` component before year sections (line ~61):
     ```tsx
     <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
       <ReadingsFilterToggle
         active={showOnlyFavorites}
         onToggle={() => setShowOnlyFavorites(!showOnlyFavorites)}
       />
     </div>
     ```

  Success criteria: Filter toggle appears on page, clicking filters to only favorites, clicking again shows all

### Phase 4: Testing

- [x] **Update ReadingsList tests**

  File: `src/app/components/readings/__tests__/ReadingsList.test.tsx`

  Verify tests still pass after refactoring to use hook and component. Tests should cover:
  - Filter toggle renders
  - Clicking toggle filters readings
  - Filtered state updates correctly

  Success criteria: All existing tests pass without modification

  Result: ✅ All 14 tests passing, no modifications needed

- [x] **Add YearSection favorite prop test**

  File: `src/app/components/readings/__tests__/YearSection.test.tsx`

  Add test case verifying `favorite` prop is passed through to ReadingCard:

  ```tsx
  it('passes favorite prop to ReadingCard', () => {
    const readings = [{ ...mockReading, favorite: true }];
    render(<YearSection year="2023" readings={readings} />);
    // Verify ReadingCard receives favorite prop
  });
  ```

  Success criteria: Test confirms prop passing works correctly

- [x] **Fix critical bugs preventing favorites from working**

  Bug 1: Missing favorite field in JSON (generate-static-data.js)
  Bug 2: Blank page on filter (page.tsx useEffect logic)
  Bug 3: Flickering from re-renders

  Fixes:
  - [x] Update generate-static-data.js to include favorite field
  - [x] Simplify page.tsx useEffect logic
  - [x] Regenerate JSON data (84 favorites confirmed)
  - [x] Verify no TypeScript errors

- [ ] **Test ReadingsPage filter integration** (Manual QA - requires user)

  Manual QA:
  1. Run `pnpm run dev`
  2. Navigate to /readings page
  3. Verify filter toggle button appears in top-right
  4. Hover over favorited books → verify star badge appears
  5. Click "Favorites Only" → verify list filters to only favorites
  6. Click "Show All" → verify all readings display again
  7. Test with both audiobook + favorite badges → verify they stack vertically

  Success criteria: All manual test cases pass, feature works as expected

## Notes

**Design Decision:** Extracted shared logic rather than duplicating to avoid:

- Change amplification (updates in multiple places)
- Maintenance burden (keeping implementations in sync)
- Bug risk (implementations drifting apart)

**Files Modified:**

- New: `src/hooks/useReadingsFilter.ts`
- New: `src/app/components/readings/ReadingsFilterToggle.tsx`
- Modified: `src/app/components/readings/ReadingsList.tsx`
- Modified: `src/app/components/readings/YearSection.tsx`
- Modified: `src/app/readings/page.tsx`
- Modified: `src/app/components/readings/__tests__/ReadingsList.test.tsx`
- Modified: `src/app/components/readings/__tests__/YearSection.test.tsx`
