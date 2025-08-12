# TODO

## ReadingCard Improvements (Post-PR #50)

### Immediate Tasks

- [ ] Remove `ReadingCard.v1.tsx` backup file after PR #50 is merged
- [ ] Monitor user feedback on the new minimalist hover design

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

_Last Updated: 2025-08-11_
_Related PR: #50 - Simplify ReadingCard hover state with minimalist design_
