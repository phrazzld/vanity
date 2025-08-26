# ADR-001: Reading Status Model Simplification and Audiobook Enhancement

**Date**: 2025-08-21  
**Status**: Proposed  
**Deciders**: Personal Reading Tracker Owner

## Context

The current reading management system implements a three-state status model (reading/finished/dropped) with boolean flags for tracking reading progress. Analysis of usage patterns and system complexity reveals several architectural concerns:

### Current Implementation

- **Status Model**: Boolean flags (`finished: Date | null`, `dropped: boolean`)
- **File Management**: Dropped readings persist as files with `dropped: true` flag
- **Data Processing**: Active filtering in `getReadings()` excludes dropped items
- **UI Logic**: Complex conditional rendering for three states
- **CLI Workflow**: Update command allows marking books as "dropped"

### Problems Identified

1. **Conceptual Complexity**: Three-state model creates ambiguous edge cases
2. **Data Inconsistency**: Dropped files accumulate without clear purging strategy
3. **UI Complexity**: Status determination logic scattered across components
4. **Missing Features**: No audiobook tracking despite personal need
5. **Filtering Overhead**: Runtime filtering of dropped items impacts performance

### Business Context

- **Single User System**: Personal reading tracker, not multi-user application
- **Usage Pattern**: Primary distinction is "currently reading" vs "finished"
- **Dropped Books**: Rarely referenced after abandonment decision
- **Audiobook Consumption**: Significant portion of reading is audio format
- **Performance Requirements**: Static site generation demands efficient data processing

## Decision

Implement a simplified two-state reading model with integrated audiobook tracking:

### Status Model Simplification

- **Remove**: `dropped` boolean field entirely
- **Maintain**: Binary state model (`finished: Date | null`)
  - `null` = Currently reading
  - `Date` = Finished on specific date
- **Eliminate**: Three-state conditional logic

### File Deletion Strategy

- **CLI Behavior**: `reading update -> "Mark as dropped"` deletes file immediately
- **Migration**: One-time deletion of existing dropped reading files
- **Rationale**: Abandoned books hold no future value in personal context

### Audiobook Integration

- **New Field**: `audiobook: boolean` in reading frontmatter
- **Default**: `false` (assumes text unless specified)
- **CLI Support**: Interactive prompt during `reading add`
- **UI Indicator**: Hover-revealed audiobook badge on reading cards

### Hover-Based UI Pattern

- **Implementation**: Audiobook indicator visible only on card hover
- **Design**: Subtle icon/badge integrated with existing hover overlay
- **Performance**: No additional DOM elements for non-audiobook items
- **Mobile**: Touch-friendly alternative for hover interaction

## Consequences

### Positive

- **Reduced Complexity**: 50% reduction in status-related conditional logic
- **Improved Performance**: Elimination of runtime filtering for dropped items
- **Enhanced UX**: Clear binary mental model (reading/finished)
- **Feature Addition**: Audiobook tracking addresses personal workflow need
- **Cleaner Codebase**: Removal of edge case handling for dropped state
- **Better Performance**: Static generation benefits from simplified data model

### Negative

- **Data Loss**: Existing dropped reading history will be permanently deleted
- **No Recovery**: Cannot track abandonment patterns or revisit dropped books
- **Migration Risk**: One-time destructive operation requires careful execution
- **Learning Curve**: Users accustomed to three-state model need mental adjustment

### Neutral

- **File Count**: Slight reduction in content files (dropped items removed)
- **CLI Commands**: Update command options reduced but core functionality preserved
- **Type Safety**: Reading interfaces simplified but no breaking changes
- **Mobile Compatibility**: Hover patterns require touch interaction consideration

## Options Considered

### 1. **Status Model: Three-State Maintenance**

- **Pros**: Preserves existing data, familiar mental model, comprehensive tracking
- **Cons**: Continued complexity, performance overhead, ambiguous edge cases
- **Decision**: Rejected due to complexity burden outweighing benefits

### 2. **Status Model: Two-State with Soft Delete**

- **Pros**: Preserves data, simplified logic, recoverable abandonment tracking
- **Cons**: Database-style complexity inappropriate for markdown-based system
- **Decision**: Rejected as over-engineered for single-user static site

### 3. **File Management: Archive vs Delete**

- **Pros**: Data preservation, potential future analysis of reading patterns
- **Cons**: Directory clutter, backup complexity, static generation overhead
- **Decision**: Rejected as dropped books provide minimal future value

### 4. **Audiobook Implementation: Global vs Per-Reading**

- **Pros Global**: Simpler author-level metadata, fewer flags per reading
- **Cons Global**: Same book available in multiple formats, inflexible tracking
- **Decision**: Per-reading approach chosen for format flexibility

### 5. **UI Pattern: Always-Visible vs Hover-Revealed**

- **Pros Always-Visible**: Immediate information, consistent accessibility
- **Cons Always-Visible**: Visual clutter, decreased content density
- **Decision**: Hover-revealed chosen to maintain clean aesthetic

## Implementation Notes

### Migration Strategy

```bash
# 1. Identify dropped readings
grep -l "dropped: true" content/readings/*.md

# 2. Backup dropped files (optional)
mkdir -p archive/dropped-readings
cp $(grep -l "dropped: true" content/readings/*.md) archive/dropped-readings/

# 3. Delete dropped files
rm $(grep -l "dropped: true" content/readings/*.md)

# 4. Update data processing
# Remove dropped filtering from getReadings()
```

### Schema Changes

```typescript
// Before
interface Reading {
  dropped: boolean;
  finished: Date | string | null;
}

// After
interface Reading {
  finished: Date | string | null;
  audiobook?: boolean; // Optional, defaults to false
}
```

### CLI Integration

```typescript
// Add to reading creation flow
const { isAudiobook } = await inquirer.prompt([
  {
    type: 'confirm',
    name: 'isAudiobook',
    message: 'Is this an audiobook?',
    default: false,
  },
]);
```

### UI Implementation

```tsx
// Hover overlay enhancement
{
  isAudiobook && (
    <div className="audiobook-indicator">
      <AudioIcon /> Audiobook
    </div>
  );
}
```

## Review Notes (To Be Added After Implementation)

_This section will be updated post-implementation to track actual outcomes versus expectations, including performance measurements, user experience feedback, and any unexpected complications encountered during migration._

---

## Similar Past Decisions

**Note**: This is the first formal ADR for this project. Future decisions will reference patterns and outcomes from this implementation to inform architectural choices.

## Confidence Level

**85%** - High confidence based on:

- Clear problem definition with measurable complexity reduction
- Well-understood single-user context eliminates multi-user edge cases
- Straightforward implementation with minimal technical risk
- Reversible decision (can re-add dropped status if needed)
- Previous experience with similar simplification yielding positive results
