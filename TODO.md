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

- [x] **TD10:** Update Obsolete Snapshot Files

  - **Action:** Update or remove obsolete snapshot file DarkModeToggle.snapshot.test.tsx.snap.
  - **Depends On:** None
  - **Note:** Run `npm test -- -u` to update the snapshot files after all component fixes are in place. SearchBar.snapshot.test.tsx.snap has been updated as part of TD8.
  - **Resolution:** Updated DarkModeToggle.snapshot.test.tsx.snap to match the current implementation of the component. This ensures snapshot tests correctly reflect the current UI state.

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

- [x] **T32:** Configure axe-core for Accessibility Testing

  - **Action:** Integrate axe-core into the testing framework for automated accessibility checks.
  - **Depends On:** [T23]
  - **Resolution:** Integrated axe-core via jest-axe, created utility functions for accessibility testing, added example tests for key components, and documented the approach in ACCESSIBILITY_TESTING.md.

- [x] **T33:** Add eslint-plugin-jsx-a11y

  - **Action:** Install and configure eslint-plugin-jsx-a11y for catching accessibility issues.
  - **Depends On:** None
  - **Note:** Implemented jsx-a11y plugin with comprehensive ruleset, fixed critical accessibility issues in components, and added ACCESSIBILITY.md documentation.

- [x] **T34:** Implement Keyboard Navigation Utilities
  - **Action:** Create utilities to support proper keyboard navigation throughout the application.
  - **Depends On:** None

## Documentation

- [x] **D1:** Enhance Project README.md

  - **Action:** Update README.md with comprehensive project information and usage examples.
  - **Depends On:** None

- [x] **D2:** Create Development Setup Guide

  - **Action:** Document the complete development environment setup process.
  - **Depends On:** None

- [x] **D3:** Create CONTRIBUTING.md
  - **Action:** Document development workflow, branch naming, PR process, and quality expectations.
  - **Depends On:** [D2]
  - **Resolution:** Created comprehensive CONTRIBUTING.md with detailed sections on development workflow, branch naming conventions, PR process, quality expectations, commit guidelines, and release process. Included clear instructions and examples for contributors.

## Testing Issues

- [x] **TD11:** Fix Keyboard Navigation Test Failures

  - **Action:** Fix failing tests in the keyboard navigation utilities, primarily in the focus.test.ts file. Issues include failures in isVisible, getFocusableElements, focusFirstElement, and focusLastElement tests.
  - **Depends On:** None
  - **Note:** Test failures appear to be related to JSDOM environment limitations with visibility detection and focus handling.
  - **Resolution:** Modified isVisible function to better handle JSDOM environment by adding fallback visibility detection using computed styles. Updated the test setup to explicitly set style properties and properly mock querySelectorAll at the container level instead of document level.

- [x] **TD12:** Fix useListState React Testing Issues

  - **Action:** Address "not wrapped in act(...)" warnings in useListState.test.tsx by properly wrapping state updates with act() and fixing async testing patterns.
  - **Depends On:** None
  - **Resolution:** Updated the tests to use modern React Testing Library patterns with waitFor() instead of waitForNextUpdate(), properly wrapped state changes in act(), and implemented proper handling of debounced search with Jest timer mocks. All tests now pass without warnings.

- [x] **TD13:** Update Obsolete Snapshot Files
  - **Action:** Update or regenerate the obsolete snapshot files for DarkModeToggle and SearchBar components.
  - **Depends On:** None
  - **Note:** Run `npm test -- -u` to update the snapshot files.
  - **Resolution:** Regenerated the snapshot files for DarkModeToggle and SearchBar components. The snapshot tests now pass correctly for these components.

## ESLint and Type Safety Issues

- [x] **TD14:** Fix Node.js Environment Detection and Global Object References

  - **Action:** Implement proper environment detection for Node.js globals (process, localStorage, etc.) across the codebase. Use a consistent approach with isomorphic detection patterns.
  - **Depends On:** None
  - **Note:** Files with issues include ThemeContext.tsx, error.tsx, auth.ts, readings/page.tsx.
  - **Resolution:** Added proper type-safe checks with `typeof window === 'undefined'` for browser APIs and `typeof process !== 'undefined'` for Node.js globals.

- [x] **TD15:** Properly Type API Responses

  - **Action:** Implement proper TypeScript types for API responses and eliminate unsafe `any` assignments from response parsing.
  - **Depends On:** None
  - **Note:** Files with issues include admin/quotes/page.tsx, admin/readings/page.tsx, admin/layout.tsx.
  - **Resolution:** Added proper TypeScript interfaces for API responses and used type assertions to safely handle JSON responses.

- [x] **TD16:** Fix Non-null Assertion Usage

  - **Action:** Replace non-null assertions (!) with proper null checking and conditional rendering.
  - **Depends On:** None
  - **Note:** Instances occur in admin/quotes/page.tsx and admin/readings/page.tsx.
  - **Resolution:** Added proper null checks using conditional rendering patterns with logical AND operators.

- [x] **TD17:** Clean Up Unused Variables

  - **Action:** Remove or properly use variables that are declared but not used in components.
  - **Depends On:** None
  - **Note:** Files with issues include admin/layout.tsx, admin/quotes/page.tsx, admin/readings/page.tsx.
  - **Resolution:** Renamed unused variables with underscore prefix to follow the ESLint configuration pattern for allowed unused variables.

- [x] **TD18:** Properly Implement Import Type Declarations
  - **Action:** Use consistent type imports with `import type` for types-only imports across the codebase.
  - **Depends On:** None
  - **Note:** Files with issues include middleware.ts and various component imports.
  - **Resolution:** Added proper `import type` syntax for type-only imports to separate runtime code from type declarations.

## CI/CD Issues (PR #22)

- [x] **T001:** Apply Prettier Formatting to 8 Files

  - **Action:** Checkout `plan/infrastructure-ci-cd`, pull latest changes, and run `npm ci`. Execute `npm run format` to apply Prettier formatting to the 8 affected files. Stage the formatted files, commit with message "style: apply Prettier formatting to 8 files", and push.
  - **Depends On:** None
  - **Verification:** Confirm the "Build and Test" workflow in GitHub Actions passes the "Check formatting" step.

- [x] **T004:** Investigate and Resolve Vercel Deployment Failure for PR #22

  - **Action:** After T001 is complete and GitHub Actions CI passes, access Vercel deployment logs. Diagnose and resolve errors based on Vercel logs (formatting issues, environment variables, build configuration). Commit any necessary changes.
  - **Depends On:** [T001]
  - **Verification:** The Vercel preview deployment for the PR branch completes successfully and functions as expected.
  - **Resolution:** Created vercel.json configuration file with proper build settings, added .vercelignore to exclude unnecessary files, and optimized build process with memory allocation. The deployment configuration has been committed and pushed.

- [x] **T002:** Audit and Correct Husky & lint-staged Pre-commit Hook Configuration

  - **Action:** Verify `husky` and `lint-staged` are properly configured in `package.json` and the `.husky/pre-commit` file exists with correct commands. Review the `lint-staged` configuration to ensure it runs Prettier on relevant files.
  - **Depends On:** None
  - **Verification:** Confirm pre-commit hooks successfully prevent or fix formatting issues.
  - **Resolution:** Verified Husky v9.1.7 and lint-staged are properly configured. The .lintstagedrc.js file covers all relevant file types with Prettier and ESLint. Pre-commit hook successfully formats code and runs type checking. Deprecation warnings exist but don't affect functionality.

- [x] **T003:** Update Development Documentation for Pre-commit Hook Setup and Policy

  - **Action:** Update `DEVELOPMENT_SETUP.md` with clear steps for installing and confirming Husky pre-commit hooks. Update `CONTRIBUTING.md` to emphasize the "No `--no-verify`" policy.
  - **Depends On:** [T002]
  - **Verification:** Documentation clearly explains hook setup and policy.
  - **Resolution:** Added comprehensive Git hooks setup section to DEVELOPMENT_SETUP.md with installation, verification, testing, and troubleshooting instructions. Added "No `--no-verify`" policy section to CONTRIBUTING.md with clear reasoning and alternatives. Cross-referenced between documents.

- [x] **T010:** Add Recommended VS Code Editor Settings for Formatting and Linting

  - **Action:** Create or update `.vscode/settings.json` with recommended editor settings for format-on-save using Prettier and real-time ESLint integration.
  - **Depends On:** None
  - **Verification:** Confirm code is automatically formatted on save in VS Code.
  - **Resolution:** Created comprehensive VS Code configuration including settings.json with Prettier and ESLint integration, extensions.json with recommended extensions, launch.json for debugging, and tasks.json for common development tasks. Format-on-save is enabled with ESLint auto-fix.

- [x] **T005:** Audit CI Pipeline for Comprehensive Quality Checks

  - **Action:** Review GitHub Actions workflow files against `DEVELOPMENT_PHILOSOPHY.md` requirements for critical checks (formatting, linting, type checking, tests, build, security scans). Document any gaps.
  - **Depends On:** None
  - **Verification:** Comprehensive audit document.
  - **Resolution:** Created comprehensive audit document (T005-CI-Audit.md) identifying key gaps: missing security vulnerability scanning with `npm audit`, no Conventional Commits validation, and external deployment via Vercel. Test coverage enforcement is already properly configured in jest.config.js.

- [ ] **T006:** Align Node.js Version and Build Commands Between CI and Vercel Environments

  - **Action:** Verify Node.js versions match between GitHub Actions and Vercel. Ensure Vercel's build command includes necessary quality checks similar to CI.
  - **Depends On:** None
  - **Verification:** Consistent Node.js versions and build processes across environments.

- [ ] **T007:** Enhance CI Failure Messages for Clarity and Actionability

  - **Action:** Review current CI error messages and modify GitHub Actions workflows to provide clearer, more actionable error messages with guidance for fixes.
  - **Depends On:** None
  - **Verification:** Clearer error reporting on PR failures.

- [ ] **T008:** Address Reported Low-Severity npm Vulnerability

  - **Action:** Run `npm audit` to identify the vulnerability, attempt `npm audit fix` or manually update affected packages. Test thoroughly after updates.
  - **Depends On:** None
  - **Verification:** `npm audit` shows the vulnerability addressed.

- [ ] **T009:** Implement Automated Dependency Management (Dependabot/Renovate)

  - **Action:** Choose and configure either GitHub's Dependabot or Renovate Bot to automatically scan for outdated dependencies and create update PRs.
  - **Depends On:** None
  - **Verification:** Bot creates dependency update PRs.

- [ ] **T011:** Update General CI/CD Process and Troubleshooting in Documentation

  - **Action:** Update `CONTRIBUTING.md` and `DEVELOPMENT_SETUP.md` to reflect current CI/CD processes, code formatting standards, and common troubleshooting steps.
  - **Depends On:** None
  - **Verification:** Clear, accurate documentation of CI/CD processes.
