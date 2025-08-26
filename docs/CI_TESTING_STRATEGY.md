# CI Testing Strategy

## Overview

This document outlines the testing and CI strategy for the Vanity project, explaining what tests we run, why we run them, and importantly - what we don't test and why.

## What We Test

### ✅ Functional Tests

- **What**: Unit and integration tests using Jest and React Testing Library
- **Why**: Ensure components work correctly and features behave as expected
- **Count**: ~299 tests covering components, utilities, and data logic

### ✅ TypeScript Type Checking

- **What**: Strict TypeScript compilation with no implicit any
- **Why**: Catches type errors at build time, prevents runtime errors
- **Configuration**: `tsconfig.json` with strict mode enabled

### ✅ Code Quality (ESLint)

- **What**: ESLint with TypeScript rules
- **Why**: Maintains consistent code style, catches potential bugs
- **Configuration**: `eslint.config.cjs` with recommended rules

### ✅ Build Verification

- **What**: Next.js production build
- **Why**: Ensures code compiles and can be deployed
- **Output**: Bundle sizes monitored for each route

### ✅ Accessibility Tests

- **What**: jest-axe tests for WCAG compliance
- **Why**: Ensures the site is accessible to all users
- **Coverage**: 4 test files covering major components

### ✅ Security Scanning

- **What**: npm audit for critical vulnerabilities, secret detection
- **Why**: Prevents security vulnerabilities and credential leaks
- **Level**: Critical vulnerabilities only (not warnings)

### ✅ Coverage Reporting (CI only)

- **What**: Jest coverage reports
- **Why**: Track test coverage trends over time
- **Note**: Only in CI, not in pre-push hooks (for speed)

## What We DON'T Test (and Why)

### ❌ Performance Tests (Removed)

**Why we removed them:**

- jsdom render times don't reflect real browser performance
- Created false positives that blocked legitimate work
- Real performance issues wouldn't be caught by these tests anyway

**What we do instead:**

- Monitor bundle sizes in build output
- Statically generate pages for best performance
- Keep JavaScript bundle under 200KB

**Example of why jsdom performance tests are flawed:**

```javascript
// This test passes in jsdom but tells us nothing about real performance
test('renders quickly', () => {
  const start = Date.now();
  render(<Component />);
  const end = Date.now();
  expect(end - start).toBeLessThan(50); // Meaningless in jsdom!
});
```

### ❌ E2E Tests

**Why we don't have them:**

- Personal website with simple functionality
- Overhead of maintaining Playwright/Cypress not justified
- Manual testing sufficient for 5 static pages

### ❌ Visual Regression Tests

**Why we don't have them:**

- Design changes are intentional and infrequent
- Snapshot tests cover component structure
- Not worth the maintenance overhead

## Testing Philosophy

### What Makes a Good Test

1. **Tests behavior, not implementation**
   - ✅ `expect(button).toHaveTextContent('Submit')`
   - ❌ `expect(component.state.isSubmitting).toBe(true)`

2. **Fast and deterministic**
   - ✅ Pure functions and mocked external dependencies
   - ❌ Tests that depend on network or timing

3. **Provides value**
   - ✅ Tests that catch real bugs
   - ❌ Tests that never fail or always need updating

### When to Add Tests

- **Always test**: Business logic, data transformations, utilities
- **Usually test**: Component behavior, user interactions
- **Sometimes test**: Complex UI states, error boundaries
- **Rarely test**: Simple display components, styles

## CI Pipeline Stages

### Pre-commit (Local)

1. Prettier formatting
2. ESLint suppressions check
3. File size validation
4. Coverage check (quick)

### Pre-push (Local)

1. Branch naming convention
2. ESLint
3. TypeScript
4. Build verification
5. Security scan
6. Tests (without coverage for speed)

### GitHub Actions (CI)

1. Install dependencies
2. ESLint
3. TypeScript (strict)
4. Tests with coverage
5. Build
6. Security scan (separate job)

## Performance Monitoring

Since we removed jsdom performance tests, here's how we actually monitor performance:

1. **Bundle Size Monitoring**: Build output shows First Load JS for each route
2. **Static Generation**: All pages pre-rendered at build time
3. **Image Optimization**: Next.js Image component with lazy loading
4. **Code Splitting**: Automatic by Next.js

Target metrics:

- First Load JS: < 200KB
- Build time: < 60 seconds
- Test suite: < 5 seconds

## Future Considerations

If the site grows significantly, consider:

- Lighthouse CI for Core Web Vitals (real browser metrics)
- Bundle analysis for deeper optimization
- Incremental Static Regeneration for dynamic content

But for now: **Keep it simple. Test what matters.**

## References

- [Testing Library Principles](https://testing-library.com/docs/guiding-principles)
- [Kent C. Dodds: Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Why jsdom isn't suitable for performance testing](https://github.com/jsdom/jsdom/issues/1895)
