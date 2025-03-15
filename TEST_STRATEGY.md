# Test Strategy for Vanity Project

This document outlines the testing approach for the Vanity project, a Next.js-based personal site with PostgreSQL integration.

## 1. Testing Setup

The project uses the following testing tools:

- **Jest**: As the test runner and assertion library
- **React Testing Library**: For testing React components
- **Mock Service Worker**: For mocking API requests
- **Jest-DOM**: For additional DOM testing assertions

## 2. Test Types

### 2.1 Unit Tests

Located in `__tests__` folders adjacent to the source files, unit tests verify individual components and functions in isolation. Key areas include:

- **Components**: Testing rendering, props handling, and event handling
- **API Handlers**: Verifying API endpoints return correct responses
- **Utilities**: Testing helper functions

### 2.2 Integration Tests

These tests verify that different parts of the application work together correctly:

- **Data Flow**: Testing data passing between components
- **Database Integration**: Verifying Prisma client interactions
- **API + Components**: Testing components that fetch data from APIs

### 2.3 Database Tests

Database tests verify that:

- The Prisma client works correctly
- Migration scripts successfully transfer data
- Queries return expected results

## 3. Testing Structure

Tests are organized with the following structure:

```
src/
└── app/
    ├── components/
    │   ├── __tests__/
    │   │   ├── ReadingCard.test.tsx
    │   │   └── TypewriterQuotes.test.tsx
    │   ├── ReadingCard.tsx
    │   └── TypewriterQuotes.tsx
    ├── api/
    │   ├── __tests__/
    │   │   └── quotes.test.ts
    │   └── quotes/
    │       └── route.ts
    └── readings/
        ├── __tests__/
        │   ├── page.test.tsx
        │   └── detail.test.tsx
        ├── page.tsx
        └── [slug]/
            └── page.tsx
scripts/
└── __tests__/
    └── migrateData.test.ts
```

## 4. Mocking Strategy

### 4.1 Component Mocking

- Mocking child components in parent component tests
- Using `jest.mock()` to replace visual components with simplified versions

### 4.2 API Mocking

- Mocking `fetch` for client-side API calls
- Mocking Next.js API routes for testing server-side logic

### 4.3 Database Mocking

- Mocking Prisma client to avoid actual database connections
- Using in-memory test data for migration tests

## 5. Running Tests

```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 6. Known Issues and Workarounds

1. **Next.js API Route Testing**: The NextRequest/NextResponse objects require special mocking.
2. **React 19 act() Warnings**: Test components with correct act() wrapping.
3. **Prisma Client Mock**: When mocking PrismaClient, remember to mock all used methods.

## 7. Continuous Integration

For CI/CD pipeline integration:

1. Tests run before deployment
2. Coverage thresholds: 80% statements, 70% branches, 80% functions, 80% lines
3. Tests must pass before merging PRs

## 8. Future Improvements

1. **E2E Testing**: Add Playwright for end-to-end testing
2. **Visual Regression Testing**: Implement Storybook and visual tests
3. **Performance Testing**: Add tests for page load times and database query performance