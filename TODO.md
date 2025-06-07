# Todo: Structured Logging Migration - Collective Intelligence Synthesis

## Strategic Implementation Plan

This synthesis combines insights from 11 AI models to create the optimal task breakdown for migrating from console.log to structured logging, balancing comprehensiveness with actionability.

## Phase 1: Foundation & Analysis (2 days)

- [x] **T001 · Analysis · P0: Complete comprehensive console usage audit and categorization**

  - **Context:** Foundation for all subsequent work - must be thorough and accurate
  - **Action:**
    1. Run complete audit: `rg -n "console\.(log|error|warn|info|debug)" --type ts --type tsx > console-usage-audit.txt`
    2. Generate detailed breakdown: `rg -n "console\.(log|error|warn|info|debug)" src/ --type ts -A 2 -B 1 > detailed-usage.txt`
    3. Categorize ALL instances into: A(Operational), B(Error), C(Debug), D(Test-OK), E(Scripts-Evaluate)
    4. Document category decisions and replacement priority in `console-categorization.md`
  - **Done-when:**
    1. Complete audit files exist with 32+ identified files
    2. Every console.\* call is categorized with justification
    3. Replacement roadmap is documented by priority
  - **Verification:**
    1. Spot-check 10 random categorizations for accuracy
    2. Confirm audit captures known high-priority files (useListState.ts, API routes, db files)
  - **Depends-on:** none

- [x] **T002 · Infrastructure · P0: Create robust logContext helper and replacement templates**
  - **Context:** Standardization foundation - prevents inconsistent patterns across team
  - **Action:**
    1. Enhance existing logger with standardized context factory: `createLogContext(moduleName, functionName, extra?)`
    2. Create and document 3 replacement templates (Hook, API, Component) with concrete examples
    3. Document security patterns for sensitive data handling in `docs/LOGGING_MIGRATION_GUIDE.md`
    4. Add TypeScript types for mandatory context fields validation
  - **Done-when:**
    1. `createLogContext` helper available and typed
    2. All 3 templates documented with working examples
    3. Security guidance explicitly documented (what NOT to log)
    4. Templates tested in 1 file each as proof-of-concept
  - **Verification:**
    1. Templates compile and produce expected structured output
    2. Security patterns prevent PII/credentials in logs
  - **Depends-on:** [T001]

## Phase 2: Critical Path Implementation (3 days)

- [x] **T003 · Implementation · P0: Migrate high-priority core files using systematic approach**

  - **Context:** Core business logic files - highest impact and risk
  - **Action:**
    1. **Hooks**: Replace console.\* in `src/app/hooks/useListState.ts` (lines 266, 284)
    2. **Database**: Migrate `src/lib/db/quotes.ts` and `src/lib/db/readings.ts`
    3. **API Routes**: Update all `src/app/api/*/route.ts` files with error handling patterns
    4. For each file: add logger import → create logContext helper → replace calls → verify functionality
  - **Done-when:**
    1. Zero console.\* calls remain in specified high-priority files
    2. All logs include mandatory fields (function_name, module_name, correlation_id)
    3. Existing tests pass without modification
    4. Manual verification of log output in dev environment
  - **Verification:**
    1. `rg "console\." src/app/hooks/useListState.ts src/lib/db/ src/app/api/` returns zero results
    2. Trigger error scenarios and verify structured error logs with stack traces
    3. Correlation IDs appear consistently across request flows
  - **Depends-on:** [T002]

- [x] **T004 · Implementation · P1: Migrate remaining application files systematically**
  - **Context:** Complete operational code coverage - components, pages, utilities
  - **Action:**
    1. **Components**: Apply templates to `src/app/components/` (excluding test files)
    2. **Pages**: Update `src/app/*/page.tsx` files with page-specific context
    3. **Utilities**: Migrate `src/lib/` operational logging (auth, query, etc.)
    4. **Admin Panel**: Evaluate and migrate with admin-specific context if needed
  - **Done-when:**
    1. All operational files in src/app/ and src/lib/ use structured logging
    2. Component and page logs include appropriate module context
    3. No functional regressions in UI/UX flows
  - **Verification:**
    1. Sample 20% of migrated files for template compliance
    2. Run full application test suite - must achieve ≥85% coverage
    3. Manual testing of key user flows with log inspection
  - **Depends-on:** [T003]

## Phase 3: Edge Cases & Quality Assurance (2 days)

- [x] **T005 · Evaluation · P2: Resolve edge cases with documented decision framework**

  - **Context:** Systematic approach to ambiguous files - prevents future confusion
  - **Action:**
    1. **Scripts**: Evaluate each `/scripts/` file - migrate operational scripts, document CLI exemptions
    2. **Storybook**: Assess `.stories.tsx` files - likely exempt for developer interaction but document decision
    3. **Development Tools**: Handle `SearchBar.stories.ts`, admin layout, responsive examples
    4. Create `edge-cases-decisions.md` with rationale for each exemption
  - **Done-when:**
    1. Every ambiguous file has documented keep/migrate decision
    2. Operational scripts use structured logging, CLI tools documented as exempt
    3. Storybook decision applied consistently across all story files
  - **Verification:**
    1. Decision document covers all Category E files from T001
    2. Exemptions align with development philosophy principles
    3. No operational logging gaps remain
  - **Depends-on:** [T001, T004]

- [x] **T006 · Quality · P1: Implement comprehensive validation and risk mitigation**
  - **Context:** Production readiness verification - prevent regressions and ensure observability
  - **Action:**
    1. **Automated verification**: `rg "console\.(log|error|warn|info)" src/app/ src/lib/ --type ts --type tsx` must return zero
    2. **Environment testing**: Verify human-readable dev logs AND JSON production logs with all mandatory fields
    3. **Integration testing**: Add logger verification to 3 critical path tests (API error, hook state change, correlation flow)
    4. **Performance baseline**: Benchmark critical operations pre/post migration - no degradation >5%
    5. **CI integration**: Add console.\* detection to fail future PRs introducing violations
  - **Done-when:**
    1. Zero console.\* in operational code, confirmed by automated check
    2. Both dev (human) and prod (JSON) log formats validated with all required fields
    3. Critical path tests verify structured log output and correlation ID propagation
    4. Performance benchmarks show <5% impact on critical operations
    5. CI pipeline prevents console.\* reintroduction
  - **Verification:**
    1. Full test suite passes with ≥85% coverage maintained
    2. Build succeeds without console.\* violations
    3. Integration tests validate logging behavior across request flows
    4. Manual demo of logging in both environments for stakeholder review
    5. CI test with console.log injection - must fail build
  - **Depends-on:** [T004, T005]

## Phase 4: Production Excellence (1 day)

- [ ] **T007 · Excellence · P2: Establish long-term consistency and governance**
  - **Context:** Sustainable logging practices - prevent future drift from standards
  - **Action:**
    1. **Documentation update**: Enhance `docs/LOGGING_MIGRATION_GUIDE.md` with team standards and examples
    2. **Code review checklist**: Add logging verification items to PR template
    3. **Linting enhancement**: Configure ESLint rule or script to catch console.\* in operational code
    4. **Observability enhancement**: Document correlation ID patterns for future log aggregation setup
    5. **Team handoff**: Create migration summary with before/after metrics for stakeholders
  - **Done-when:**
    1. Comprehensive logging guide exists with concrete examples and security patterns
    2. Code review process includes logging standards verification
    3. Automated tooling prevents console.\* violations in operational code
    4. Migration metrics documented (files changed, performance impact, test coverage maintained)
    5. Team documentation enables onboarding new developers with logging standards
  - **Verification:**
    1. New team member can follow guide to implement logging correctly
    2. PR template catches logging violations during review
    3. Linting catches console.\* during development, not just CI
  - **Depends-on:** [T006]

## Critical Success Factors

### Risk Mitigation Strategy

- **Incremental approach**: Phase-based implementation allows validation at each step
- **Backwards compatibility**: Existing tests must pass, no functional changes
- **Performance monitoring**: Baseline and validate no degradation in critical paths
- **Rollback plan**: Keep original console.log in comments during development phase

### Quality Gates (Must Pass)

1. Zero console.\* in operational code (automated verification)
2. All logs include mandatory context fields (manual verification)
3. Test suite maintains ≥85% coverage (automated verification)
4. Both dev and production log formats work correctly (manual verification)
5. Correlation ID propagation across request flows (integration testing)

### Definition of Done

- All operational console.\* calls replaced with structured logger
- Comprehensive testing in both development and production environments
- Code review process updated to prevent regressions
- Team documentation enables consistent logging practices
- Performance impact <5% on critical operations
- CI pipeline prevents console.\* reintroduction

## Collective Intelligence Insights

**Consensus across all models:**

- Audit first, implement systematically, validate comprehensively
- High-priority files (hooks, API routes, database) must be migrated first
- Context standardization prevents inconsistent patterns
- Both automated and manual verification required

**Resolved contradictions:**

- **Task granularity**: 7 focused tasks balance detail with manageability (vs 8-24 in individual models)
- **Edge case handling**: Systematic evaluation with documented decisions (vs ad-hoc approaches)
- **Risk management**: Explicit mitigation strategy included (missing from many models)
- **Performance consideration**: Baseline and monitoring included (often overlooked)

**Enhanced approach:**

- Integration of correlation ID testing (often missed)
- Explicit CI/tooling improvements for long-term sustainability
- Performance impact validation (critical for production readiness)
- Comprehensive team handoff documentation

_This synthesis represents the distilled wisdom of 11 AI models, optimized for practical execution while maintaining philosophical alignment and production readiness._
