# T026 Implementation Plan: Streamline Build Verification

## Analysis Summary

**Current State**: Significant redundancy in build verification pipeline

- TypeScript checking: 4 times (pre-commit twice, pre-push, CI)
- ESLint: 3 times (pre-commit, pre-push, CI)
- Formatting: 3 times (pre-commit fix, pre-push check, CI check)
- Tests: 3 times (pre-commit coverage warning, pre-push coverage + full tests, CI coverage)
- Edge Runtime check: 2 times (pre-push, CI) with identical logic
- Security scan: 2 times (pre-push, CI)

**Target State**: Efficient pipeline with no redundancy while maintaining quality gates

## Implementation Strategy

### Phase 1: Pre-commit Hook Optimization

**Goal**: Keep pre-commit fast and focused on basic code quality

**Changes**:

1. **Remove TypeScript checking from lint-staged** - TypeScript is slow and better suited for pre-push
2. **Keep ESLint in lint-staged** - Fast feedback for syntax/style issues
3. **Keep Prettier formatting** - Essential for consistency
4. **Keep sensitive data check** - Critical security boundary
5. **Remove redundant typecheck call** - Already called by lint-staged conditionally

**Rationale**: Pre-commit should be fast (<10s) to encourage frequent commits

### Phase 2: Pre-push Hook Optimization

**Goal**: Comprehensive validation before remote push, remove redundancy

**Changes**:

1. **Remove format:check** - Pre-commit already ensures formatting
2. **Keep ESLint check** - Final validation before push (different from lint-staged scope)
3. **Consolidate TypeScript checking** - Single comprehensive check
4. **Consolidate test execution** - Run test:coverage once (covers all test scenarios)
5. **Keep Edge Runtime check** - Better in pre-push for fast feedback
6. **Optimize security scan** - Streamlined single scan
7. **Remove redundant final test run** - test:coverage already validates all tests
8. **Remove build:verify** - Redundant with CI build step

**Rationale**: Pre-push should catch all issues CI would catch, but avoid redundant work

### Phase 3: CI Pipeline Optimization

**Goal**: Final validation with focus on build/deployment readiness

**Changes**:

1. **Remove format:check** - Pre-hooks ensure formatting
2. **Keep ESLint** - Final validation (may catch issues missed locally)
3. **Keep TypeScript check** - Essential for CI validation
4. **Remove Edge Runtime check** - Pre-push covers this adequately
5. **Keep test:coverage** - CI needs independent validation
6. **Keep build steps** - Essential for deployment validation
7. **Optimize security scan job** - Reduce dependency installation redundancy

**Rationale**: CI should focus on build/deploy validation, not code style

### Phase 4: Package.json Script Consolidation

**Goal**: Eliminate redundant build scripts

**Changes**:

1. **Remove `build:audit-filter`** - Old version with skipLibCheck
2. **Rename `build:audit-filter:new` to `build:audit-filter`** - Modern version
3. **Update `build:verify`** - Streamlined verification process
4. **Consider consolidating typecheck variants** - Evaluate if multiple configs needed

**Rationale**: Reduce script proliferation and confusion

## Test Strategy

### Before Implementation:

1. **Measure current pipeline timing**:
   - Pre-commit duration
   - Pre-push duration
   - CI pipeline duration
2. **Document current behavior** - Ensure no quality gates are lost

### During Implementation:

1. **Test each hook independently** - Verify quality gates maintained
2. **Test complete pipeline** - End-to-end validation
3. **Verify error scenarios** - Ensure failures are properly caught

### After Implementation:

1. **Measure performance improvement**
2. **Validate quality coverage** - No reduction in caught issues
3. **Monitor for issues** - Watch for problems missed by streamlined process

## Risk Mitigation

### High Risk: Accidentally removing essential validation

**Mitigation**:

- Careful analysis of each check's purpose
- Maintain all unique validation logic
- Test failure scenarios thoroughly

### Medium Risk: Performance regression in specific scenarios

**Mitigation**:

- Benchmark before/after
- Maintain escape hatches for emergency fixes
- Gradual rollout approach

### Low Risk: Developer workflow disruption

**Mitigation**:

- Document changes clearly
- Maintain familiar command interfaces
- Provide migration guide

## Success Criteria

### Performance Improvements:

- Pre-commit: <10 seconds (from current ~15-20s)
- Pre-push: <60 seconds (from current ~90-120s)
- CI pipeline: <8 minutes (from current ~10-12m)

### Quality Maintenance:

- All existing error detection preserved
- No false negatives introduced
- Clear failure messages maintained

### Developer Experience:

- Faster feedback loops
- Clearer separation of concerns
- Simplified script landscape

## Implementation Order

1. **Phase 4** (Scripts) - Low risk, enables other phases
2. **Phase 1** (Pre-commit) - Medium risk, high impact
3. **Phase 2** (Pre-push) - High risk, high impact
4. **Phase 3** (CI) - Low risk, medium impact

Each phase will be implemented, tested, and validated before proceeding to the next.
