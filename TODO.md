# Reading Status Simplification & Audiobook Enhancement TODO

Generated from TASK.md on 2025-01-21

## Critical Path Items (Must complete in order)

- [x] **1. Create migration script to backup and delete dropped readings**
  - Success criteria: Script identifies 7 dropped reading files, creates backup, safely deletes files
  - Dependencies: None
  - Estimated complexity: MEDIUM
  - Files: `scripts/migrate-reading-status.js`

  ```
  Work Log:
  - ✅ Successfully created migration script following existing patterns from generate-static-data.js
  - ✅ Script identified exactly 7 dropped readings (as expected from specification)
  - ✅ Created backup directory: /archive/dropped-readings-backup
  - ✅ Safely deleted: Designing Data-Intensive Applications, How the Catholic Church Built Western Civilization, Man and Woman He Created Them, Paradise Lost, Scaling People, Shorter Summa, Structure and Interpretation of Computer Programs 2nd Ed
  - ✅ Cleaned 'dropped' field from all 365 remaining reading frontmatter files
  - ✅ Reading status system now simplified to binary: reading/finished
  ```

- [x] **2. Update Reading TypeScript interface**
  - Success criteria: Remove `dropped: boolean` field, add `audiobook?: boolean` field, TypeScript compiles
  - Dependencies: Migration script completed
  - Estimated complexity: SIMPLE
  - Files: `src/types/reading.ts`

  ```
  Work Log:
  - ✅ Removed `dropped: boolean` field from Reading interface
  - ✅ Added `audiobook?: boolean` field to Reading interface
  - ✅ Updated ReadingInput interface (removed dropped, added audiobook)
  - ✅ Updated ReadingListItem interface (removed dropped, added audiobook)
  - ⚠️ TypeScript compilation errors expected - will be resolved by Tasks 3-6 which update references throughout codebase
  ```

- [x] **3. Update Reading frontmatter interface**
  - Success criteria: ReadingFrontmatter type updated to match Reading interface, no compilation errors
  - Dependencies: Reading interface updated
  - Estimated complexity: SIMPLE
  - Files: `src/types/reading.ts`, `cli/commands/reading.ts`

  ```
  Work Log:
  - ✅ Updated ReadingFrontmatter interface in cli/types/index.ts (removed dropped, added audiobook)
  - ✅ Removed dropped: false from frontmatter creation in CLI reading command
  - ✅ Temporarily disabled dropped update functionality (will be replaced in Task 8)
  - ✅ ReadingFrontmatter interface now compiles without errors
  - ✅ No more ReadingFrontmatter-related TypeScript compilation errors
  ```

- [x] **4. Update CLI reading type definitions**
  - Success criteria: CLI types align with updated Reading interface, inquirer prompts compile
  - Dependencies: Frontmatter interface updated
  - Estimated complexity: SIMPLE
  - Files: `cli/commands/reading.ts`, `cli/types/index.ts`

  ```
  Work Log:
  - ✅ Updated CLI help text to reflect "Delete a reading from your collection" instead of "Mark as dropped"
  - ✅ Changed inquirer prompt option from "Mark as dropped" to "Delete reading"
  - ✅ Updated action handler from 'dropped' to 'delete' (implementation deferred to Task 8)
  - ✅ Removed all references to 'dropped' from CLI codebase
  - ✅ CLI types now align with updated Reading interface
  - ✅ No CLI-related TypeScript compilation errors
  ```

- [x] **5. Remove dropped filtering from data layer**
  - Success criteria: `data.ts` no longer filters dropped readings, static data generation works
  - Dependencies: Type definitions updated
  - Estimated complexity: SIMPLE
  - Files: `src/lib/data.ts:34-35`

  ```
  Work Log:
  - ✅ Removed `dropped: (data.dropped as boolean) || false` field assignment from reading object creation
  - ✅ Removed dropped filtering logic: `const activeReadings = readings.filter(r => !r.dropped)`
  - ✅ Updated return statement to use `readings` directly instead of `activeReadings`
  - ✅ Static data generation works: Generated 365 readings successfully
  - ✅ Data layer no longer references dropped field anywhere
  ```

- [x] **6. Update reading utilities to remove dropped status logic**
  - Success criteria: `readingUtils.ts` no longer handles "Dropped" section, only "Currently Reading" and year sections
  - Dependencies: Data layer updated
  - Estimated complexity: MEDIUM
  - Files: `src/lib/utils/readingUtils.ts:70`
  ```
  Work Log:
  - ✅ Removed "Dropped" section initialization from grouped object in groupReadingsByYear()
  - ✅ Removed dropped reading handling logic (reading.dropped check and push to Dropped section)
  - ✅ Removed "Dropped" from specialSections array in getSortedYearKeys()
  - ✅ Removed dropped category sorting logic from sortReadingsWithinCategory()
  - ✅ Reading utilities now only handle "Currently Reading" and year sections
  - ✅ No TypeScript errors in readingUtils.ts file
  ```

## Parallel Work Streams

### Stream A: CLI Enhancement (After Critical Path Items 1-6)

- [x] **7. Add audiobook prompt to CLI reading add command**
  - Success criteria: `reading add` command prompts for audiobook status, saves to frontmatter
  - Dependencies: Type definitions updated (Task 4)
  - Estimated complexity: MEDIUM
  - Can start: After Task 4
  - Files: `cli/commands/reading.ts:102-407`

  ```
  Work Log:
  - ✅ Added AudiobookPrompt interface to cli/types/index.ts
  - ✅ Added AudiobookPrompt import to reading command
  - ✅ Inserted audiobook prompt between finished date and cover image prompts (optimal UX flow)
  - ✅ Added conditional frontmatter assignment: if (audiobook) frontmatter.audiobook = audiobook
  - ✅ Updated data.ts to process audiobook field from markdown frontmatter
  - ✅ CLI now prompts: "Is this an audiobook?" with default false
  - ✅ Audiobook status saves to frontmatter and loads in data layer
  - ✅ Follows existing CLI patterns perfectly (boolean prompts, conditional assignments)
  ```

- [ ] **8. Update CLI reading update command to delete files**
  - Success criteria: `reading update` offers "Delete reading" option, removes file from filesystem
  - Dependencies: Type definitions updated (Task 4)
  - Estimated complexity: MEDIUM
  - Can start: After Task 4
  - Files: `cli/commands/reading.ts:371`

### Stream B: UI Implementation (After Critical Path Items 1-6)

- [ ] **9. Remove dropped status handling from ReadingsList component**
  - Success criteria: No "Dropped" badges rendered, no dropped status logic in component
  - Dependencies: Data layer updated (Task 5)
  - Estimated complexity: SIMPLE
  - Can start: After Task 5
  - Files: `src/app/components/readings/ReadingsList.tsx:370-374`

- [ ] **10. Add audiobook hover indicator to ReadingCard component**
  - Success criteria: Audiobook readings show headphone icon on hover, smooth CSS transitions, accessible
  - Dependencies: Type definitions updated (Task 2)
  - Estimated complexity: COMPLEX
  - Can start: After Task 2
  - Files: `src/app/components/readings/ReadingCard.tsx:88-227`

- [ ] **11. Remove dropped status display from ReadingCard component**
  - Success criteria: No "Paused" status shown, only reading/finished status indicators
  - Dependencies: Type definitions updated (Task 2)
  - Estimated complexity: SIMPLE
  - Can start: After Task 2
  - Files: `src/app/components/readings/ReadingCard.tsx:22-26`

- [ ] **12. Update static data generation to handle simplified schema**
  - Success criteria: `generate-static-data.js` creates JSON without dropped filtering, build succeeds
  - Dependencies: Data layer updated (Task 5)
  - Estimated complexity: SIMPLE
  - Can start: After Task 5
  - Files: `scripts/generate-static-data.js:55-56`

## Testing & Validation

### Unit Testing (After UI Implementation)

- [ ] **13. Update ReadingCard component tests**
  - Success criteria: Tests cover audiobook hover indicator, no dropped status tests, 90%+ coverage
  - Dependencies: ReadingCard updated (Tasks 10, 11)
  - Estimated complexity: MEDIUM
  - Files: `src/app/components/readings/__tests__/ReadingCard.test.tsx`

- [ ] **14. Update ReadingsList component tests**
  - Success criteria: Tests verify no dropped badges, reading/finished filtering works
  - Dependencies: ReadingsList updated (Task 9)
  - Estimated complexity: MEDIUM
  - Files: `src/app/components/readings/__tests__/ReadingsList.test.tsx`

- [ ] **15. Create migration script tests**
  - Success criteria: Tests verify backup creation, file deletion, error handling with mock filesystem
  - Dependencies: Migration script created (Task 1)
  - Estimated complexity: MEDIUM
  - Files: `scripts/__tests__/migrate-reading-status.test.js`

### Integration Testing (After CLI & UI Implementation)

- [ ] **16. Test CLI audiobook workflow end-to-end**
  - Success criteria: Can add audiobook reading via CLI, appears with hover indicator in UI
  - Dependencies: CLI enhanced (Tasks 7, 8), UI updated (Task 10)
  - Estimated complexity: MEDIUM

- [ ] **17. Test hover interaction accessibility**
  - Success criteria: Audiobook indicators accessible via keyboard focus, screen reader compatible, WCAG 2.1 compliant
  - Dependencies: ReadingCard hover implemented (Task 10)
  - Estimated complexity: COMPLEX

## Documentation & Cleanup

- [ ] **18. Update README with simplified reading status documentation**
  - Success criteria: Documentation reflects two-state system, audiobook CLI commands explained
  - Dependencies: All implementation complete
  - Estimated complexity: SIMPLE

- [ ] **19. Remove TODO.md reference to dropped status**
  - Success criteria: No references to three-state system in project documentation
  - Dependencies: All implementation complete
  - Estimated complexity: SIMPLE

- [ ] **20. End-to-end workflow verification**
  - Success criteria: Complete reading lifecycle works (add → audiobook flag → hover indicator → status update → file deletion)
  - Dependencies: All tasks complete
  - Estimated complexity: MEDIUM

## Performance & Security Validation

- [ ] **Verify hover interactions maintain 60fps performance**
  - Success criteria: CSS hover animations run smoothly, no JavaScript render blocking
  - Dependencies: ReadingCard hover implemented (Task 10)

- [ ] **Confirm bundle size increase <5KB**
  - Success criteria: Bundle analyzer shows minimal size impact from changes
  - Dependencies: All UI changes complete

- [ ] **Validate reading list render time unchanged**
  - Success criteria: Performance profiling shows no regression in component render time
  - Dependencies: All data layer changes complete

## Future Enhancements (BACKLOG.md candidates)

- [ ] **Advanced Audiobook Metadata** - Narrator information, playback speed tracking
- [ ] **Reading Progress Indicators** - Page/percentage completion in hover state
- [ ] **Batch Status Operations** - CLI commands for bulk reading management
- [ ] **Performance Optimization** - Lazy loading for large reading collections
- [ ] **Enhanced Filtering** - Complex queries across reading metadata
- [ ] **Integration Opportunities** - Goodreads import, audiobook platform sync

---

## Summary

**Total Tasks:** 20 (Critical: 6, Parallel: 6, Testing: 5, Cleanup: 3)
**Estimated Duration:** 6-8 hours
**Critical Dependencies:** Migration → Types → Data Layer → CLI/UI Implementation → Testing
**Key Success Metrics:**

- Zero dropped status references in codebase
- Audiobook hover indicators work smoothly
- All existing reading/finished functionality preserved
- WCAG 2.1 accessibility compliance maintained
