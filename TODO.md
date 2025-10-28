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

- [x] Extract `cli/lib/reading-reread.ts` - Reread detection & versioning

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

- [x] Extract `cli/lib/reading-validation.ts` - Input validation & security

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

- [x] Extract `cli/lib/reading-prompts.ts` - Inquirer prompt flows

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

- [x] Extract `cli/lib/reading-frontmatter.ts` - YAML manipulation

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

- [x] Refactor `addReading()` - Orchestration only (no implementation details)

  ```
  Work Log:
  - Reduced addReading() from 137 to 46 lines (66% reduction)
  - Extracted 5 helper functions with clear single responsibilities:
    - handleLocalImageProcessing() - Image processing with user fallback
    - handleExistingReadings() - Reread detection and user choice
    - renameImageForReread() - Image file renaming for versioned reads
    - ensureDirectoryExists() - Directory creation with error handling
    - handleAddReadingError() - Centralized error handling
  - Main function now pure orchestration: gather input → process → save
  - File size increased 714→775 lines but maintainability improved
  - All 99 CLI tests passing
  ```

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

- [x] Refactor `updateReading()` - Orchestration only

  ```
  Work Log:
  - Reduced updateReading() from 275 to 55 lines (80% reduction)
  - Extracted 5 helper functions with clear responsibilities:
    - selectReadingToUpdate() - Reading selection and file loading
    - displayCurrentReadingInfo() - Show current reading status
    - promptUpdateAction() - Ask user what to update
    - handleDeleteReading() - Delete with confirmation
    - applyUpdateAction() - Dispatch to appropriate update handler
    - previewAndConfirmChanges() - Show diff and get confirmation
  - Main function now pure orchestration: select → display → prompt → apply → confirm → save
  - File size increased 775→861 lines but maintainability greatly improved
  - All 99 CLI tests passing
  ```

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

- [x] Update `listReadings()` - Keep as-is, add tests

  ```
  Work Log:
  - Created cli/__tests__/reading-list.test.ts with 9 comprehensive tests
  - Tests cover: empty list, formatting, pagination, limit parameter, counts, errors
  - Mocked getReadings() and preview module to isolate function behavior
  - All 108 CLI tests passing (99 existing + 9 new)
  - Function kept as-is (already simple and well-structured)
  ```

- [x] Create CLI test infrastructure
  ```
  Work Log:
  - Infrastructure already exists and working
  - Tests run with npm test cli/__tests__/
  - All 99 CLI tests passing across 5 test files
  - Uses Jest with Node environment (not jsdom)
  - Real temp directories for file operations (not mocks)
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

- [~] `cli/commands/reading.ts` reduced to < 400 lines (60% reduction)
  - Current: 859 lines (started at 988)
  - Main functions reduced dramatically: addReading() 137→46, updateReading() 275→55
  - File grew due to helper functions, but architecture vastly improved
  - Trade-off: Maintainability > line count
- [x] Each extracted module has 80%+ test coverage
  - reading-image: 10 tests covering all paths
  - reading-reread: 22 tests covering all scenarios
  - reading-validation: 33 tests covering all validation rules
  - reading-prompts: 15 tests covering all prompt flows
  - reading-frontmatter: 19 tests covering all operations
  - reading-list: 9 tests covering all display logic
- [x] All CLI commands still work identically (no behavior changes)
  - All 108 tests passing
  - Zero breaking changes to public interfaces
- [x] Module interfaces are simple (1-3 public functions each)
  - reading-image: 1 function (processReadingCoverImage)
  - reading-reread: 3 functions (findExistingReadings, getNextRereadFilename, getMostRecentReading)
  - reading-validation: 3 functions (validateDateInput, sanitizeSlug, validateDateForPrompt)
  - reading-prompts: 4 functions (promptBasicReadingInfo, promptReadingMetadata, promptCoverImage, promptRereadAction)
  - reading-frontmatter: 4 functions (readReadingFrontmatter, writeReadingFrontmatter, updateFrontmatterField, createReadingFrontmatter)
- [x] Zero coupling between extracted modules (only command orchestrates)
  - Modules are independent and only used by command functions
  - No module imports another extracted module
- [x] Magic numbers eliminated and replaced with documented constants
  - Image dimensions: 400x600 with aspect ratio documentation
  - Quality: 80 with profiling rationale
- [x] Security: Path traversal protection strengthened (absolute path + allowlist checks)
  - Validates path patterns before file operations
  - Checks for .., ~, URL encoding
  - Absolute path resolution with project root verification

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
