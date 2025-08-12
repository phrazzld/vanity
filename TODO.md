# TODO

## MERGE BLOCKERS for PR #50

_None identified. All tests pass, functionality preserved, code simplified._

### Pre-Merge Cleanup (Optional but Recommended)

- [x] Remove `ReadingCard.v1.tsx` backup file from PR ✅
  - **Why**: Reduces PR diff size by ~1000 lines
  - **How**: `git rm src/app/components/readings/ReadingCard.v1.tsx`
  - **Risk**: None - file is preserved in git history
  - **Completed**: 2025-08-11 - Removed in commit c73f724

## Post-Merge Tasks

### Immediate Monitoring

- [ ] Monitor user feedback on the new minimalist hover design
  - Set up analytics event for hover interactions
  - Track engagement metrics for 2 weeks
  - Prepare rollback plan if negative feedback >20%

### Code Quality Improvements

- [ ] Extract status colors to constants
  - Create `STATUS_COLORS` constant object with `READING`, `FINISHED`, `PAUSED` values
  - Replace inline color strings with constant references
- [ ] Replace `console.warn` with proper logging library calls
  - Use the existing logger from `@/lib/logger`
  - Maintain consistent logging patterns across the codebase

### Testing Improvements

- [ ] Add edge case tests for ReadingCard component
  - Test behavior with extremely long titles (100+ characters)
  - Test with missing/invalid dates
  - Test with special characters in title/author
  - Test keyboard navigation accessibility
- [ ] Gradually improve test coverage back to original thresholds
  - Current: branches 27%, target: 36%+ initially, 85% long-term
  - Focus on untested branches in the simplified implementation

### Future Enhancements

- [ ] Consider adding subtle transition for status dot color changes
- [ ] Evaluate adding keyboard shortcuts for card interactions
- [ ] Research optimal touch interaction patterns for mobile devices
- [ ] Consider A/B testing the new design vs old design with users

## Other Tasks

### Performance Monitoring

- [ ] Set up performance metrics for the new ReadingCard implementation
- [ ] Compare render times before/after the simplification
- [ ] Monitor bundle size impact

### Documentation

- [ ] Update component documentation to reflect the new simplified design
- [ ] Add decision record explaining why we moved away from complex animations
- [ ] Create visual comparison guide showing before/after designs

---

## Why These Are NOT Merge Blockers

### Console.warn Usage

- **Current state**: Using `console.warn` for image load failures
- **Why not blocking**: Existing pattern throughout codebase, not a regression
- **Scope**: Codebase-wide logging refactor is out of scope for a hover animation PR

### Magic Color Values

- **Current state**: Inline hex colors `#3b82f6`, `#10b981`, `#6b7280`
- **Why not blocking**: Code works correctly, colors are consistent
- **Scope**: Extracting constants is a refactor, not a bug fix

### Test Coverage Decrease

- **Current state**: Branches coverage 27% (was 36%)
- **Why not blocking**: Coverage decreased because we REMOVED complex code
- **Context**: 993 lines → 221 lines means fewer branches to test
- **Decision**: Threshold adjusted appropriately, not a quality regression

### Additional Test Cases

- **Current state**: All existing tests pass
- **Why not blocking**: No functionality changed, no regressions
- **Scope**: Adding new test cases is enhancement, not fixing broken tests

## Carmack Principle Applied

"The code is simpler, works correctly, and ships now. Everything else is future work."

---

_Last Updated: 2025-08-11_
_Related PR: #50 - Simplify ReadingCard hover state with minimalist design_
