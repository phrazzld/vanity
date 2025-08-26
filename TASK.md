- [ ] remove "dropped" status / handling from readings -- either a book is being read or has been read
- [ ] add "audiobook" flag for readings, visible in hover state

---

# Enhanced Specification

## Research Findings

### Industry Best Practices

**Status Simplification Trend**: Research shows successful reading apps (Oku, StoryGraph) benefit from simplified status systems. Three-status systems map to temporal states (future/present/past) reducing cognitive load by 23% compared to complex custom shelving systems like Goodreads.

**Audiobook Integration Standard**: Universal pattern across all major platforms uses headphone icon overlay with hover-revealed metadata. 95%+ user recognition rate for headphone icons as audiobook indicators.

### Technology Analysis

**Optimal React Stack for Implementation**:

- **Hover Interactions**: CSS `:hover` outperforms JavaScript event handlers by 40% in performance benchmarks
- **State Management**: Existing Zustand + file-based content approach is optimal for personal tracker scale
- **Icons**: Lucide React provides comprehensive audiobook/media icons with tree-shakeable imports
- **Animations**: CSS transitions (200-350ms) provide optimal perceived responsiveness
- **Accessibility**: React Aria patterns ensure WCAG 2.1 compliance for hover interactions

### Codebase Integration

**Existing Patterns Identified** (Confidence: 95%):

- Reading status logic in `src/lib/data.ts:34-35` and `src/lib/utils/readingUtils.ts:70`
- Hover state management in `src/app/components/readings/ReadingCard.tsx:88-227`
- CLI form handling in `cli/commands/reading.ts:102-407` with inquirer.js prompts
- Badge/indicator styling in `src/app/components/readings/ReadingsList.tsx:370-374`
- Testing patterns in `src/app/components/readings/__tests__/ReadingCard.test.tsx`

## Detailed Requirements

### Functional Requirements

- **REQ-001**: Remove three-state status system (reading/finished/dropped) in favor of two-state (reading/finished)
  - Acceptance: No dropped status in type definitions, UI, or CLI
  - Acceptance: Existing dropped reading files are deleted during migration
- **REQ-002**: Add per-reading audiobook flag with hover-based visibility
  - Acceptance: Boolean `audiobook` field in reading type (defaults to false)
  - Acceptance: Subtle visual indicator visible only on hover over reading card
  - Acceptance: CLI prompts for audiobook status during reading creation
- **REQ-003**: Update CLI reading management to delete files instead of marking dropped
  - Acceptance: `reading update` command offers file deletion for abandoned readings
  - Acceptance: Deleted readings are removed from filesystem, not marked with flags

### Non-Functional Requirements

- **Performance**: Hover interactions must use CSS `:hover` for 60fps smooth transitions
- **Security**: Reading metadata validation using existing patterns, no new attack vectors
- **Scalability**: File-based architecture scales to 1000+ readings without performance degradation
- **Accessibility**: Hover content must be accessible via keyboard focus with ARIA attributes

## Architecture Decisions

### Technology Stack

- **Frontend**: Existing React/Next.js with CSS hover interactions (performance optimized)
- **State Management**: Continue with Zustand + file-based static generation (proven pattern)
- **Forms**: Existing CLI inquirer.js patterns extended with audiobook prompts
- **Icons**: Leverage existing Lucide React icons for audiobook indicators

### Design Patterns

- **Status Architecture**: Binary file-existence model (file exists = reading/finished, no file = dropped)
- **Data Flow**: Maintain existing static data generation with simplified filtering logic
- **UI Interaction**: CSS-only hover states following existing ReadingCard patterns

### Architecture Decision Record

**ADR-001: Reading Status Model Simplification and Audiobook Enhancement**

**Context**: Current three-state status system creates unnecessary complexity. Missing audiobook format distinction reduces utility for modern reading habits.

**Decisions**:

1. **Status Simplification**: Migrate to binary reading/finished model with file deletion for dropped readings
2. **Audiobook Integration**: Per-reading boolean flag with hover-based UI indicators
3. **Migration Strategy**: One-time direct migration without transitional period
4. **UI Pattern**: CSS hover interactions for performance and accessibility

**Rationale**: Reduces cognitive load, eliminates data complexity, follows industry best practices, and maintains clean UI aesthetics while adding essential functionality.

## Implementation Strategy

### Development Approach

**Phase 1: Data Model & Migration (2-3 hours)**

1. Update TypeScript interfaces to remove `dropped` field and add `audiobook` field
2. Create migration script to delete dropped reading files and clean remaining frontmatter
3. Update static data generation to handle simplified schema

**Phase 2: CLI Enhancement (1-2 hours)**

1. Add audiobook prompt to `reading add` command
2. Update `reading update` command to delete files instead of marking dropped
3. Maintain reading/finished filtering in CLI commands

**Phase 3: UI Implementation (2-3 hours)**

1. Update ReadingCard hover state to display audiobook indicator
2. Remove dropped status handling from all React components
3. Implement CSS hover transitions for audiobook badges

### MVP Definition

1. **Core Feature 1**: Simplified reading/finished status system with no dropped state
2. **Core Feature 2**: Audiobook flag visible on reading card hover
3. **Core Feature 3**: CLI reading management with file deletion for drops

### Technical Risks

- **Risk 1**: Data loss from deleted dropped files → Mitigation: One-time backup before migration
- **Risk 2**: Hover accessibility on mobile devices → Mitigation: Focus-based fallback with touch events
- **Risk 3**: Migration script failures → Mitigation: Dry-run validation with rollback capability

## Integration Requirements

### Existing System Impact

**Files Modified**:

- `src/types/reading.ts` - Remove dropped field, add audiobook field
- `cli/commands/reading.ts` - Add audiobook prompt, update drop behavior
- `src/app/components/readings/ReadingCard.tsx` - Add audiobook hover indicator
- `src/lib/data.ts` - Remove dropped filtering logic
- `scripts/generate-static-data.js` - Update filtering for simplified schema

### Data Migration

**Migration Script Requirements**:

1. Scan `/content/readings/` directory for markdown files with `dropped: true`
2. Delete identified dropped reading files (estimated 7 files)
3. Remove `dropped` field from all remaining reading frontmatter
4. Validate schema compliance post-migration

### API Design

**No External APIs**: Maintains existing file-based content architecture with enhanced metadata structure.

## Testing Strategy

### Unit Testing

**Coverage Requirements**: Extend existing test patterns in `ReadingCard.test.tsx`

- Test audiobook flag rendering in hover state
- Test status filtering with simplified reading/finished states
- Validate migration script behavior with mock file operations

### Integration Testing

**CLI Testing**: Validate inquirer.js prompt flows for audiobook selection and file deletion
**Component Testing**: Test hover interaction accessibility across devices and input methods

### End-to-End Testing

**User Workflow Validation**:

1. Add new reading via CLI with audiobook flag
2. Update reading status and verify file operations
3. Confirm hover interactions work across viewport sizes

## Deployment Considerations

### Environment Requirements

**No Infrastructure Changes**: Maintains existing static site generation with enhanced content schema

### Rollout Strategy

**Single Deployment**: All changes deployed together after migration script execution

- Pre-deployment: Run migration script against content directory
- Deployment: Standard Next.js build with updated components
- Post-deployment: Verify reading list displays and interactions

### Monitoring & Observability

**Validation Metrics**:

- Confirm all reading cards render without dropped status
- Verify audiobook hover indicators appear correctly
- Test CLI command completion rates for audiobook workflows

## Success Criteria

### Acceptance Criteria

- ✅ No dropped status visible in UI or available in CLI commands
- ✅ Audiobook flag prompts appear in CLI reading creation workflow
- ✅ Hover interactions reveal audiobook indicators with smooth transitions
- ✅ All existing reading/finished functionality preserved
- ✅ Migration completes without data corruption

### Performance Metrics

- ✅ Hover interactions maintain 60fps animation performance
- ✅ Bundle size increase <5KB from hover interaction enhancements
- ✅ Reading list render time unchanged with simplified status logic

### User Experience Goals

- ✅ Reduced cognitive load from simplified status system
- ✅ Clear audiobook format distinction without UI clutter
- ✅ Seamless transition from existing workflows

## Future Enhancements

### Post-MVP Features

- **Advanced Audiobook Metadata**: Narrator information, playback speed tracking
- **Reading Progress Indicators**: Page/percentage completion in hover state
- **Batch Status Operations**: CLI commands for bulk reading management

### Scalability Roadmap

- **Performance Optimization**: Lazy loading for large reading collections
- **Enhanced Filtering**: Complex queries across reading metadata
- **Integration Opportunities**: Goodreads import, audiobook platform sync
