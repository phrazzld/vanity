# TODO: Extract CLI Reading God Object → 7 Focused Modules

## Context

- **Problem**: `cli/commands/reading.ts` is 988 lines with 13 functions handling 8 responsibilities
- **Impact**: Maintenance bottleneck blocking CLI feature velocity, test complexity, parallel development
- **Approach**: Extract deep modules with simple interfaces, following existing pattern in `cli/lib/`
- **Key Files**:
  - `cli/commands/reading.ts` (extract from)
  - `cli/lib/editor.ts`, `cli/lib/preview.ts` (existing pattern examples)
  - `cli/types/index.ts` (shared types)
- **Testing**: No existing CLI tests - will add unit tests for extracted pure functions

## Module Design Principles

Each extracted module should be **deep** (high functionality / low interface complexity):

- Simple public interface (1-3 functions max)
- Hide implementation details
- Single clear responsibility
- Minimize dependencies between modules

## Implementation Tasks

- [x] Extract `cli/lib/reading-image.ts` - Image processing module

  ```
  Files: Create cli/lib/reading-image.ts, update cli/commands/reading.ts:253-278,557-580
  Approach: Deep module pattern - single `processReadingCoverImage()` interface
  Interface:
    export async function processReadingCoverImage(
      imagePath: string,
      slug: string,
      imagesDir: string
    ): Promise<string>
  Implementation:
    - Constants: COVER_IMAGE_CONFIG with documented magic numbers
      // 400x600 maintains 2:3 book cover aspect ratio (industry standard)
      // Quality 80 balances file size (~40KB) with visual fidelity
      // Profiled: 80 quality indistinguishable from 90 but 30% smaller
    - Path validation (file exists, size < 10MB, allowed extensions)
    - Path traversal protection (absolute path resolution, within project)
    - Sharp processing pipeline (resize + WebP conversion)
    - Return WebP path (/images/readings/{slug}.webp)
  Success: Single responsibility, eliminates 120+ lines duplication, magic numbers documented
  Test Strategy:
    - Unit tests: Valid image → correct WebP output
    - Unit tests: Invalid path/size/format → throws descriptive error
    - Unit tests: Path traversal attempts → rejected
    - Mock: sharp library, filesystem calls
  Module Value: High functionality (validation + processing + error handling) / Low interface (single function)
  Time: 90min (60min implementation + 30min tests)
  ```

- [~] Extract `cli/lib/reading-reread.ts` - Reread detection & versioning

  ```
  Files: Create cli/lib/reading-reread.ts, update cli/commands/reading.ts:29-96
  Approach: Deep module - hide filename generation complexity
  Interface:
    export function findExistingReadings(baseSlug: string, readingsDir: string): string[]
    export function getNextRereadFilename(baseSlug: string, readingsDir: string): string
    export async function getMostRecentReading(
      baseSlug: string,
      readingsDir: string
    ): Promise<{ date: string | null; count: number } | null>
  Implementation:
    - Regex pattern matching for base + numbered versions
    - Sorting logic (base first, then numbered)
    - Next number calculation with zero-padding
    - YAML frontmatter parsing for date extraction
  Success: Clear separation of reread logic, independently testable
  Test Strategy:
    - Unit tests: No existing → returns base filename
    - Unit tests: Base exists → returns slug-02
    - Unit tests: Multiple rereads → correct next number
    - Unit tests: getMostRecentReading → parses date correctly
    - Mock: filesystem reads, gray-matter parsing
  Module Value: Hides filename numbering complexity behind simple interface
  Time: 60min (40min implementation + 20min tests)
  ```

- [ ] Extract `cli/lib/reading-validation.ts` - Input validation & security

  ```
  Files: Create cli/lib/reading-validation.ts, update cli/commands/reading.ts:212-237
  Approach: Deep module - centralize all validation rules
  Interface:
    export function validateImagePath(imagePath: string): void
    export function validateDateInput(dateInput: string): Date
    export function sanitizeSlug(title: string): string
  Implementation:
    - Path validation: exists, extension allowlist, size limits
    - Path security: absolute path resolution, project root verification, encoded char checks
    - Date validation: ISO format, reasonable range
    - Slug generation: consistent with existing slugify usage
  Success: All input validation in one place, security rules clearly documented
  Test Strategy:
    - Unit tests: Valid inputs → pass silently
    - Unit tests: Invalid inputs → throw descriptive errors
    - Unit tests: Path traversal (../, ~/, absolute, URL encoded) → rejected
    - Unit tests: Various date formats → normalized to ISO
    - No mocks: Pure validation logic
  Module Value: Security-critical logic isolated and thoroughly tested
  Time: 45min (30min implementation + 15min tests)
  ```

- [ ] Extract `cli/lib/reading-prompts.ts` - Inquirer prompt flows

  ```
  Files: Create cli/lib/reading-prompts.ts, update cli/commands/reading.ts:107-240,305-326
  Approach: Deep module - encapsulate all user interaction logic
  Interface:
    export async function promptBasicReadingInfo(): Promise<BasicReadingInfo>
    export async function promptReadingMetadata(): Promise<{
      finished: boolean;
      finishedDate: string | null;
      audiobook: boolean;
      favorite: boolean;
    }>
    export async function promptCoverImage(): Promise<{
      choice: 'url' | 'local' | 'skip';
      value: string | null;
    }>
    export async function promptRereadAction(
      title: string,
      existingCount: number,
      lastDate: string | null,
      nextFilename: string
    ): Promise<'reread' | 'update' | 'cancel'>
  Implementation:
    - Group related prompts into logical flows
    - Type validation using cli/types/index.ts interfaces
    - Consistent error messages and defaults
    - Reuse validation from reading-validation.ts
  Success: All inquirer logic isolated, commands become pure orchestration
  Test Strategy:
    - Integration tests: Mock inquirer responses → verify correct data flow
    - Unit tests: Prompt configuration → correct validators and defaults
    - Mock: inquirer.prompt() with predefined answers
  Module Value: Hides inquirer complexity, makes command functions testable
  Time: 75min (50min implementation + 25min tests)
  ```

- [ ] Extract `cli/lib/reading-frontmatter.ts` - YAML manipulation

  ```
  Files: Create cli/lib/reading-frontmatter.ts, update cli/commands/reading.ts:380-410,586-698
  Approach: Deep module - abstract gray-matter operations
  Interface:
    export async function readReadingFrontmatter(
      filepath: string
    ): Promise<{ frontmatter: ReadingFrontmatter; content: string }>
    export async function writeReadingFrontmatter(
      filepath: string,
      frontmatter: ReadingFrontmatter,
      content: string
    ): Promise<void>
    export function updateFrontmatterField<K extends keyof ReadingFrontmatter>(
      frontmatter: ReadingFrontmatter,
      field: K,
      value: ReadingFrontmatter[K]
    ): ReadingFrontmatter
  Implementation:
    - Wrap gray-matter with typed interfaces
    - Handle missing/malformed frontmatter gracefully
    - Preserve markdown content during updates
    - Consistent formatting (alphabetical fields, proper spacing)
  Success: Type-safe frontmatter operations, isolated from file I/O
  Test Strategy:
    - Unit tests: Valid markdown → parsed correctly
    - Unit tests: Missing fields → defaults applied
    - Unit tests: Round-trip (read → modify → write) → preserves content
    - Mock: fs.readFile, fs.writeFile
  Module Value: Type safety + error handling for YAML operations
  Time: 45min (30min implementation + 15min tests)
  ```

- [ ] Refactor `addReading()` - Orchestration only (no implementation details)

  ```
  Files: Update cli/commands/reading.ts:102-410
  Approach: Reduce to thin orchestration layer using extracted modules
  Pattern:
    - Call reading-prompts for user input
    - Call reading-validation for sanitization
    - Call reading-image for cover processing
    - Call reading-reread for filename/version logic
    - Call reading-frontmatter for file creation
  Implementation:
    const basicInfo = await promptBasicReadingInfo();
    const metadata = await promptReadingMetadata();
    const coverInfo = await promptCoverImage();

    const slug = sanitizeSlug(basicInfo.title);
    let coverImage = null;
    if (coverInfo.choice === 'local') {
      coverImage = await processReadingCoverImage(coverInfo.value, slug, IMAGES_DIR);
    }

    const existing = await getMostRecentReading(slug, READINGS_DIR);
    let filename = `${slug}.md`;
    if (existing) {
      const action = await promptRereadAction(basicInfo.title, existing.count, existing.date, getNextRereadFilename(slug));
      if (action === 'cancel') return;
      if (action === 'reread') filename = getNextRereadFilename(slug, READINGS_DIR);
    }

    await writeReadingFrontmatter(filepath, frontmatter, '');
  Success: Function < 100 lines, pure orchestration, no business logic
  Test Strategy:
    - Integration test: Mock all module functions → verify correct call sequence
    - Integration test: Reread flow → correct filename versioning
    - Integration test: Error handling → graceful failures with user messages
  Module Value: Simple interface delegates to deep modules
  Time: 60min (refactoring + integration tests)
  ```

- [ ] Refactor `updateReading()` - Orchestration only

  ```
  Files: Update cli/commands/reading.ts:701-988
  Approach: Same orchestration pattern as addReading()
  Implementation:
    - Use reading-prompts for action selection
    - Use reading-frontmatter for reading/writing
    - Use reading-image for cover updates
    - Use reading-validation for input sanitization
  Success: Function < 150 lines (more complex than add due to multiple update paths)
  Test Strategy:
    - Integration tests: Each update action (finish, thoughts, cover, fields, delete)
    - Integration tests: Error scenarios (file not found, invalid date)
  Module Value: Delegates complexity to focused modules
  Time: 75min (refactoring + integration tests)
  ```

- [ ] Update `listReadings()` - Keep as-is, add tests

  ```
  Files: cli/commands/reading.ts:412-700
  Approach: Already simple enough (< 300 lines, single responsibility)
  Rationale: Listing logic is mostly formatting - no complex business logic
  Change: Add integration tests only
  Test Strategy:
    - Integration test: Lists correct number of readings
    - Integration test: Pagination works correctly
    - Integration test: Handles empty directory
    - Mock: getReadings() from src/lib/data.ts
  Time: 20min (tests only)
  ```

- [ ] Create CLI test infrastructure
  ```
  Files: Create cli/__tests__/setup.ts, jest.cli.config.js
  Approach: Follow existing test pattern from src/**/__tests__/
  Implementation:
    - Jest config for CLI (Node environment, not jsdom)
    - Mock utilities for inquirer, filesystem, sharp
    - Fixture data for test readings
    - Test helpers for temp directory management
  Success: Tests can run with npm test cli/
  Test Strategy: Infrastructure task - verified by running extracted module tests
  Time: 30min
  ```

## Design Iteration

**After Phase 1** (Extract image, reread, validation modules):

- Review: Are module interfaces simple enough? Any leaking implementation details?
- Measure: Line count reduction in reading.ts, test coverage of extracted modules

**After Phase 2** (Extract prompts, frontmatter, refactor commands):

- Review: Can commands be understood without reading implementations?
- Refactor: Any duplicated patterns in update vs add?
- Document: Add JSDoc comments explaining module boundaries

## Success Criteria

- [ ] `cli/commands/reading.ts` reduced to < 400 lines (60% reduction)
- [ ] Each extracted module has 80%+ test coverage
- [ ] All CLI commands still work identically (no behavior changes)
- [ ] Module interfaces are simple (1-3 public functions each)
- [ ] Zero coupling between extracted modules (only command orchestrates)
- [ ] Magic numbers eliminated and replaced with documented constants
- [ ] Security: Path traversal protection strengthened (absolute path + allowlist checks)

## Risk Mitigation

- Manual testing after each extraction: `npm run vanity -- reading add|update|list`
- Keep commits atomic: One module extraction per commit
- If tests reveal issues: Fix in place before continuing to next module
- Rollback plan: Each module is additive, can revert individual commits

## Future Opportunities (NOT in this TODO)

After this refactoring:

- Search book cover API integration becomes trivial (add to reading-image.ts)
- Bulk import feature can reuse all modules
- Quote/project/place commands can use same patterns
- CLI integration tests for full workflows
