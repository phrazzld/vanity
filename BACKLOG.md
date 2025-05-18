# BACKLOG

- migrate to pnpm
- rework projects page to be active projects
- redesign projects page to have clean project logos
- experiment with neon mcp server
- add search / better organization to admin readings / quotes management pages
- totally redesign readings gallery, especially the little metadata ribbons
- totally redesign travel page
- migrate travel location data to neon database
- migrate project data to neon database
- migrate book covers and other static assets to vercel blob
- add favorite flag to readings
- add proper blog

## Code Coverage Improvement

**Goal**: Achieve 85% global test coverage and 90% coverage for core logic (`src/app/api/` and `src/lib/`)

**Current State** (as of 2025-05-18):

- Global coverage: ~28% (target: 85%)
- API coverage: ~36% (target: 90%)
- Lib coverage: ~17% (target: 90%)

**Context**:
We've implemented comprehensive CI/CD quality gates including coverage checks in pre-commit (warning) and pre-push (blocking) hooks. However, the existing codebase doesn't meet our ambitious coverage targets. We're temporarily lowering thresholds to merge critical infrastructure improvements while maintaining the goal of high coverage.

**Action Items**:

1. Add comprehensive tests for API routes (`src/app/api/`)

   - Test all HTTP methods (GET, POST, PUT, DELETE)
   - Test error scenarios and edge cases
   - Test authentication and authorization flows
   - Mock external dependencies appropriately

2. Improve library test coverage (`src/lib/`)

   - Test database utilities thoroughly
   - Add tests for error handling paths
   - Test edge cases in utility functions
   - Ensure logger is properly tested in all environments

3. Add integration tests for critical user flows

   - Reading list navigation and filtering
   - Quote management workflows
   - Admin authentication and operations

4. Component testing improvements

   - Add tests for untested UI components
   - Test error states and loading states
   - Ensure accessibility requirements are tested

5. Consider test-driven development (TDD) for new features
   - Write tests first to ensure coverage from the start
   - Helps maintain high coverage as codebase grows

**Success Criteria**:

- Global coverage ≥ 85%
- Core logic coverage ≥ 90%
- All critical paths have test coverage
- Tests are maintainable and meaningful (not just coverage-padding)
