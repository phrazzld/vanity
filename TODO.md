# Project TODO List

This file contains all remaining tasks for the Vanity project. Each task is atomic, well-defined, and includes clear dependencies.

## Technical Debt

- [x] **TD1:** Fix Type Errors Identified by Strict TypeScript Configuration

  - **Action:** Systematically address type errors flagged by the stricter TypeScript settings. Prioritize errors in core files (e.g., API routes, database interfaces).
  - **Depends On:** None

- [x] **TD6:** Fix TypewriterQuotes Timer Type Issues

  - **Action:** Properly address TypeScript type errors related to timer functions in TypewriterQuotes.tsx. The current implementation uses `any` type with eslint-disable comments as a temporary workaround, but this should be replaced with proper typing.
  - **Depends On:** None
  - **Note:** Issues include: Type 'Timeout' is not assignable to type 'number'. The component uses `setTimeout` and `setInterval` which return values of type `Timeout` in Node.js or `number` in browsers.
  - **Resolution:** Used `ReturnType<typeof globalThis.setTimeout>` and `ReturnType<typeof globalThis.setInterval>` to properly type timer variables in a way that works in both browser and Node.js environments without requiring explicit NodeJS type imports.

- [x] **TD7:** Fix ReadingCard Component Tests
  - **Action:** Address failures in ReadingCard component tests related to TestingLibrary query recommendations, style testing, and interaction testing.
  - **Depends On:** None
  - **Note:** Issues include: TestingLibraryElementError suggesting better queries (queryByText instead of queryByTestId), and possibly problems with style assertions and hover interaction testing.
  - **Resolution:** Updated tests to use semantically meaningful queries like getByText and getByRole instead of testIds, modified style assertions to be more robust and compatible with the testing environment, and improved interaction testing with hover/touch simulation.
- [x] **TD8:** Fix SearchBar Component Snapshot Tests

  - **Action:** Update SearchBar component snapshot tests to match the new component structure after accessibility and role attribute fixes.
  - **Depends On:** None
  - **Note:** Snapshot test failures occurred after moving role="search" from a div to the form element for accessibility.
  - **Resolution:** Updated snapshots to reflect the new component structure with `role="search"` on the form element instead of the div. All tests are now passing.

- [x] **TD9:** Fix useReadingsQuotesList Test Environment

  - **Action:** Fix the test environment setup in useReadingsQuotesList.test.tsx to properly mock global.fetch.
  - **Depends On:** None
  - **Note:** Test fails with error "TypeError: Cannot set properties of undefined (setting 'fetch')" when trying to set global.fetch = jest.fn().
  - **Resolution:** Used globalThis.fetch instead of global.fetch for better cross-environment compatibility, implemented proper waitFor logic for async tests, and fixed URL encoding expectations in the tests.

- [ ] **TD10:** Update Obsolete Snapshot Files

  - **Action:** Update or remove obsolete snapshot file DarkModeToggle.snapshot.test.tsx.snap.
  - **Depends On:** None
  - **Note:** Run `npm test -- -u` to update the snapshot files after all component fixes are in place. SearchBar.snapshot.test.tsx.snap has been updated as part of TD8.

- [x] **TD2:** Fix ESLint v9 Integration with lint-staged
  - **Action:** Resolve the integration issues between ESLint v9 and lint-staged. Research and implement a solution that allows ESLint v9 to work correctly in the pre-commit hook.
  - **Depends On:** None
- [x] **TD3:** Fix ESLint Configuration for Test Files
  - **Action:** Resolve ESLint errors in test files by properly configuring ESLint for Jest environment, converting test utility files from .ts to .tsx where JSX is used, and ensuring TypeScript configuration includes test files.
  - **Depends On:** None
- [x] **TD4:** Fix ESLint Parameter Naming Issues in State Management
  - **Action:** Resolve ESLint unused parameter warnings in interface implementations. Configure ESLint to handle parameter naming consistency between interface definitions and implementations in state management hooks and stores.
  - **Depends On:** [T30]
- [x] **TD5:** Fix Failing Tests
  - **Action:** Address failing tests in components including TypewriterQuotes, YearSection, and Prisma client mocks. Fix issues with testing library queries and timer mocks in Jest environment.
  - **Depends On:** None
  - **Progress:** Fixed all critical test issues:
    - Fixed TypewriterQuotes component timer handling and cleanup
    - Fixed YearSection tests with proper role-based queries
    - Fixed Prisma client mocks with proper Jest environment
    - Fixed SearchBar tests with proper act() wrapping for state updates
    - Fixed React Hooks tests with modern Testing Library approaches
    - Fixed ReadingCard tests with proper DOM assertion patterns

## Storybook Implementation

- [x] **T11:** Resolve Storybook and ESLint v9 Dependency Conflicts

  - **Action:** Analyze dependency conflicts between Storybook, its addons, typescript-eslint, and ESLint v9. Apply a resolution strategy (e.g., using `--legacy-peer-deps` during install, pinning specific versions, configuring ESLint overrides for Storybook).
  - **Depends On:** None

- [x] **T12:** Install Storybook Core Packages and Essential Addons

  - **Action:** Install Storybook core (`@storybook/react`, `storybook`), Next.js integration (`@storybook/nextjs`), essential addons, accessibility addon, and dark mode addon using the resolution strategy from T11.
  - **Depends On:** [T11]

- [x] **T13:** Initialize and Configure Basic Storybook Setup

  - **Action:** Create `.storybook/main.ts` and `.storybook/preview.ts` with proper configuration. Add Storybook scripts to `package.json`.
  - **Depends On:** [T12]

- [x] **T14:** Configure Tailwind CSS Integration in Storybook

  - **Action:** Import globals.css in `.storybook/preview.ts` and ensure proper Tailwind/PostCSS processing.
  - **Depends On:** [T13]

- [x] **T15:** Configure Theme Context in Storybook

  - **Action:** Add a global decorator to wrap stories in `ThemeProvider` to enable theme context for components.
  - **Depends On:** [T14]

- [x] **T16:** Configure Dark Mode Support in Storybook

  - **Action:** Configure the `storybook-dark-mode` addon to integrate with Tailwind's dark mode.
  - **Depends On:** [T13, T15]

- [x] **T17:** Configure Accessibility Testing in Storybook

  - **Action:** Set up `@storybook/addon-a11y` in `main.ts` and configure accessibility rules as needed.
  - **Depends On:** [T13]

- [x] **T18:** Create DarkModeToggle Component Stories

  - **Action:** Create `DarkModeToggle.stories.ts` with stories for different states and interactions.
  - **Depends On:** [T15, T16, T17]

- [x] **T19:** Create SearchBar Component Stories

  - **Action:** Create `SearchBar.stories.ts` with stories for various states, filters, button variants, and behaviors.
  - **Depends On:** [T15, T16, T17]

- [x] **T20:** Document Storybook Usage Guidelines

  - **Action:** Add documentation for using Storybook and creating component stories.
  - **Depends On:** [T13]

- [x] **T21:** Add Storybook to CI Pipeline
  - **Action:** Update GitHub Actions workflow to include Storybook build checks.
  - **Depends On:** [T13]

## Component Testing

- [x] **T23:** Set Up React Testing Library Configuration

  - **Action:** Create dedicated test setup for React Testing Library with ThemeProvider and necessary mocks.
  - **Depends On:** None
  - **Note:** Initial implementation works but ESLint configuration for test files needs improvement. See TD3.

- [x] **T24:** Implement Component Test Patterns

  - **Action:** Create example tests demonstrating preferred patterns for component testing.
  - **Depends On:** [T23]
  - **Note:** Implemented comprehensive patterns documentation and enhanced tests for SearchBar, TypewriterQuotes, and ReadingCard components to demonstrate best practices.

- [x] **T25:** Add Snapshot Testing Configuration
  - **Action:** Set up snapshot testing for components with documentation on best practices.
  - **Depends On:** [T23]

## Styling Strategy

- [x] **T26:** Enhance Tailwind CSS Configuration

  - **Action:** Review and improve Tailwind configuration to align with design needs.
  - **Depends On:** None

- [x] **T27:** Create Design Token System

  - **Action:** Establish design tokens in Tailwind config for colors, typography, spacing, etc.
  - **Depends On:** [T26]

- [x] **T28:** Implement Responsive Design Utilities
  - **Action:** Create utilities leveraging Tailwind's responsive modifiers with documentation.
  - **Depends On:** [T26]

## State Management

- [x] **T29:** Evaluate State Management Options

  - **Action:** Assess state management needs and select an appropriate solution.
  - **Depends On:** None
  - **Note:** Completed evaluation with recommendation for hybrid approach using TanStack Query for server state and Zustand for UI state.

- [x] **T30:** Implement Core State Management

  - **Action:** Set up the selected state management solution with initial configuration.
  - **Depends On:** [T29]
  - **Note:** Implemented hybrid approach with TanStack Query for server state and Zustand for UI state, with example components and documentation.

- [x] **T31:** Configure State Management Developer Tools
  - **Action:** Set up developer tools for debugging and development.
  - **Depends On:** [T30]
  - **Note:** Implemented Redux DevTools for Zustand stores and enhanced TanStack Query DevTools configuration.

## Accessibility Standards

- [ ] **T32:** Configure axe-core for Accessibility Testing

  - **Action:** Integrate axe-core into the testing framework for automated accessibility checks.
  - **Depends On:** [T23]

- [x] **T33:** Add eslint-plugin-jsx-a11y

  - **Action:** Install and configure eslint-plugin-jsx-a11y for catching accessibility issues.
  - **Depends On:** None
  - **Note:** Implemented jsx-a11y plugin with comprehensive ruleset, fixed critical accessibility issues in components, and added ACCESSIBILITY.md documentation.

- [ ] **T34:** Implement Keyboard Navigation Utilities
  - **Action:** Create utilities to support proper keyboard navigation throughout the application.
  - **Depends On:** None

## Documentation

- [ ] **D1:** Enhance Project README.md

  - **Action:** Update README.md with comprehensive project information and usage examples.
  - **Depends On:** None

- [ ] **D2:** Create Development Setup Guide

  - **Action:** Document the complete development environment setup process.
  - **Depends On:** None

- [ ] **D3:** Create CONTRIBUTING.md
  - **Action:** Document development workflow, branch naming, PR process, and quality expectations.
  - **Depends On:** [D2]

## Optional Enhancements

- [ ] **OPT1:** Integrate Visual Regression Testing

  - **Action:** Set up Chromatic or similar tool for visual regression testing.
  - **Depends On:** [T19, T21]

- [ ] **OPT2:** Enhance Error Handling System

  - **Action:** Implement global error handling with user-friendly messages and UI components.
  - **Depends On:** None

- [ ] **OPT3:** Implement Internationalization (i18n)
  - **Action:** Set up solution for supporting multiple languages in the application.
  - **Depends On:** None
