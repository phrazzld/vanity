# TODO: Favorite Readings Feature

## Status: Feature Complete ✅

**PR**: [#79 - Add favorites feature and remove thoughts field](https://github.com/phrazzld/vanity/pull/79)
**Branch**: `feature/fave-readings`
**CI Status**: ✅ Passing (Build and Test + Security Scan)

## Completed Work

### Core Implementation ✅

- [x] Remove thoughts field from all Reading interfaces
- [x] Add favorite field to Reading, ReadingInput, ReadingListItem interfaces
- [x] Update data layer to parse favorite from frontmatter
- [x] Remove thoughts parsing from data layer
- [x] Add favorite prompt to CLI reading add command
- [x] Add favorite toggle to CLI reading update command
- [x] Remove thoughts prompts from all CLI commands
- [x] Add favorite badge to ReadingCard component (star icon, stacks with audiobook)
- [x] Add favorites filter toggle to ReadingsList component
- [x] Update all test files to remove thoughts from mock data
- [x] Mark 84 personal favorite readings in content files

### Code Quality ✅

- [x] Extract AudiobookBadge and FavoriteBadge components (ESLint compliance)
- [x] Remove deprecated @types/sharp package
- [x] All 345 tests passing
- [x] TypeScript compilation clean
- [x] ESLint checks passing

### CI/CD ✅

- [x] Fix CI package manager mismatch (npm → pnpm)
- [x] Update both GitHub Actions workflows to use pnpm
- [x] Add pnpm caching for faster builds
- [x] All CI checks passing

## Remaining Tasks

### Pre-Merge

- [ ] Manual QA testing
  - [ ] Test CLI: `pnpm run vanity -- reading add` (verify favorite prompt)
  - [ ] Test CLI: `pnpm run vanity -- reading update` (verify favorite toggle)
  - [ ] Test UI: Verify filter toggle works in browser
  - [ ] Test UI: Verify favorite badges render on hover
  - [ ] Test UI: Verify badges stack correctly (audiobook + favorite)

### Post-Merge (Optional)

- [ ] Update project CLAUDE.md with new CLI behavior (if needed)
- [ ] Archive/remove original detailed TODO from planning phase

## Notes

**Breaking Changes**:

- Removed `thoughts` field from Reading type (coordinated across all layers)
- All markdown body content now ignored (frontmatter-only)

**Files Changed**: 103 files

- Type definitions updated
- Data layer parsing updated
- CLI commands refactored
- Components enhanced
- Tests updated
- 84 content files marked with favorites
- CI workflow migrated to pnpm

**Test Coverage**: 345/345 tests passing ✅

---

_Feature implementation completed during single session._
_Total implementation time: ~2.5 hours_
