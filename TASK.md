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

### [Maintainability] Consolidate Code Duplication in CLI

**Files**: `cli/commands/reading.ts:188-278, 461-581`
**Perspectives**: complexity-archaeologist, maintainability-maven
**Why**: Image handling logic duplicated in addReading() and updateCoverImage()
**Approach**: Extract `processReadingCoverImage(imagePath, slug)` shared function with:

- Magic number constants (400x600, quality 80) with documentation about why
- Unified validation (file size, format, path traversal protection)
- Single sharp processing pipeline
  **Effort**: 1h | **Impact**: Bug fixes apply once, eliminates 120+ lines duplication

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
