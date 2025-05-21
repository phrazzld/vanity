# BACKLOG

## High Priority

### Technical Excellence & Foundational Quality

- **[Refactor] Increase API Route Test Coverage to 90% for `src/app/api/`**

  - **Complexity**: Complex
  - **Rationale**: Current API coverage (~36%) is critically low. Achieving 90% is essential for API stability, preventing regressions, enabling stricter CI/CD quality gates, and adhering to the "Testing Strategy (Test Coverage Enforcement)" philosophy.
  - **Expected Outcome**: API routes in `src/app/api/` achieve ≥90% test coverage. Tests cover all HTTP methods, business logic, error scenarios (including standardized error responses), edge cases, and authentication/authorization flows. CI coverage gates can be confidently restored.
  - **Dependencies**: "Enforce Strict Mocking Policy", "Standardize API Error Responses and Centralized Handling"

- **[Refactor] Increase Library (`src/lib/`) Test Coverage to 90%**

  - **Complexity**: Complex
  - **Rationale**: Current library coverage (~17%) is critically low. Core logic and utilities in `src/lib/` (especially database utilities and logger) must be thoroughly tested for reliability and maintainability, as per the "Testing Strategy (Test Coverage Enforcement)" philosophy.
  - **Expected Outcome**: Core library functions in `src/lib/` achieve ≥90% test coverage. Tests cover database utilities, error handling paths, edge cases in utility functions, and logger functionality in all environments.
  - **Dependencies**: "Enforce Strict Mocking Policy"

- **[Refactor] Enforce Strict Mocking Policy: Mock Only True External System Boundaries**

  - **Complexity**: Medium
  - **Rationale**: To ensure tests are robust, less brittle, and accurately reflect system behavior by only mocking true external dependencies (e.g., database clients, third-party APIs), adhering to the "Design for Testability (Mocking Policy)" philosophy.
  - **Expected Outcome**: All existing and new tests are refactored/written to mock only external system boundaries. Internal collaborators or modules are not mocked, leading to higher confidence in test outcomes and better-designed modules.
  - **Dependencies**: Affects all test writing and refactoring efforts.

- **[Refactor] Implement Consistent Structured Logging with Correlation IDs**

  - **Complexity**: Medium
  - **Rationale**: Replace all `console.log` in operational code with a structured logger to achieve centralized, machine-parseable logs with full request tracing, significantly improving debugging and monitoring, as per the "Logging Strategy" philosophy.
  - **Expected Outcome**: All operational logging uses the structured logger. Every log entry includes a `correlation_id` and other mandatory contextual fields. `console.log` is reserved for local development debugging only.
  - **Dependencies**: None

- **[Fix] Remove `eval()` Usage in Data Migration Scripts**

  - **Complexity**: Simple
  - **Rationale**: `eval()` poses a significant security risk. Its removal from data migration scripts is crucial for system security and adherence to "Secure Coding Practices" philosophy.
  - **Expected Outcome**: All instances of `eval()` in `scripts/importData.js` (and any other scripts) are replaced with safer parsing methods (e.g., `JSON.parse`). Data migration processes are free from `eval()`-related vulnerabilities.
  - **Dependencies**: None

- [x] **[Enhancement] Integrate Automated Security Vulnerability Scanning into CI Pipeline**

  - **Complexity**: Medium
  - **Rationale**: To proactively prevent new high-risk security vulnerabilities in code and dependencies from being merged by adding a mandatory CI stage, as per the "Automation (CI/CD Quality Gates)" and "Security (Dependency Management Security)" philosophies.
  - **Expected Outcome**: CI pipeline includes a stage that scans code and dependencies (e.g., using `pnpm audit --level high` or Snyk/Dependabot). The build fails if new critical or high-severity vulnerabilities are detected.
  - **Dependencies**: "Migrate to pnpm" (if `pnpm audit` is used).

- **[Enhancement] Standardize API Error Responses and Centralized Handling**
  - **Complexity**: Medium
  - **Rationale**: To ensure predictable API error behavior, simplify client-side error management, and improve security by not leaking sensitive internal details, aligning with "Consistent Error Handling" and "API Design" philosophies.
  - **Expected Outcome**: A consistent JSON structure is defined and implemented for all API error responses, distinguishing client (4xx) from server (5xx) errors. Centralized error handling ensures all API routes return errors in this format.
  - **Dependencies**: Benefits "Increase API Route Test Coverage".

### Core Architecture & Developer Experience

- **[Refactor] Complete Migration to TanStack Query for Server State and Zustand for UI State**

  - **Complexity**: Complex
  - **Rationale**: To standardize state management across the application using modern, efficient libraries, improving developer experience, performance, testability, and replacing legacy solutions (`useListState`, `ThemeContext`), as per the "State Management" philosophy.
  - **Expected Outcome**: All server-side data fetching, caching, and mutations are handled by TanStack Query. Global UI state (e.g., theme, shared UI toggles) is managed by Zustand. Legacy state management solutions are fully removed.
  - **Dependencies**: None

- **[Refactor] Migrate to pnpm**
  - **Complexity**: Simple
  - **Rationale**: To improve dependency management efficiency, speed, and disk space usage, enhancing the overall developer experience.
  - **Expected Outcome**: Project successfully uses pnpm for all dependency management. `pnpm-lock.yaml` is committed, and CI/CD pipelines are updated. `package-lock.json` or `yarn.lock` removed.
  - **Dependencies**: None

## Medium Priority

### Technical Excellence & Refinement

- **[Refactor] Refactor Code Organization to "Package by Feature, Not Type"**

  - **Complexity**: Medium
  - **Rationale**: To improve codebase navigability, maintainability, and team scalability by grouping files by feature/domain (e.g., readings, quotes, admin) rather than by technical layer, aligning with "Modularity (Package by Feature)" philosophy.
  - **Expected Outcome**: The codebase (especially `src/app/` and `src/lib/`) is restructured to co-locate feature-specific logic, components, types, and tests, leading to higher cohesion and clearer feature boundaries.
  - **Dependencies**: None (can be done incrementally).

- **[Enhancement] Add Integration Tests for Critical User Flows**

  - **Complexity**: Medium
  - **Rationale**: To ensure end-to-end functionality of critical user paths (e.g., reading list navigation and filtering, quote management, admin authentication) and catch bugs that unit tests might miss.
  - **Expected Outcome**: Key user flows are covered by robust integration tests, verifying the interaction between different parts of the system and increasing confidence in deployments.
  - **Dependencies**: Stable API, "Enforce Strict Mocking Policy".

- **[Enhancement] Achieve Comprehensive Storybook Coverage for Key UI Components**

  - **Complexity**: Complex
  - **Rationale**: To create a robust, well-documented, and accessible UI component library that serves as a living design system, improving developer workflow and component quality, as per "Frontend Appendix (Atomic Design, Storybook-First)" philosophy.
  - **Expected Outcome**: Critical UI components (atoms, molecules, key organisms) have comprehensive Storybook stories covering all variants, states (default, hover, active, disabled, error, loading), and include accessibility (a11y) checks. Start with 5-10 key components.
  - **Dependencies**: None

- **[Enhancement] Improve UI Component Test Coverage**
  - **Complexity**: Medium
  - **Rationale**: To increase confidence in UI components by adding tests for untested UI components, error states, loading states, and ensuring accessibility requirements are tested beyond Storybook a11y checks.
  - **Expected Outcome**: Significant improvement in test coverage for UI components. Tests verify various component states and accessibility compliance (e.g., using `@testing-library/jest-dom`, `jest-axe`).
  - **Dependencies**: "Achieve Comprehensive Storybook Coverage" can help identify components and states.

### Data Management & Infrastructure

- **[Refactor] Migrate Project Data to Neon Database**

  - **Complexity**: Medium
  - **Rationale**: To centralize project data management, moving away from static files to a robust database, enabling dynamic updates, richer metadata, and easier administration.
  - **Expected Outcome**: All project data is migrated from static files (e.g., `src/app/projects/data.ts`) to the Neon database and accessed via Prisma. The application reads and displays project data dynamically.
  - **Dependencies**: Database schema defined for projects.

- **[Refactor] Migrate Travel Location Data to Neon Database**

  - **Complexity**: Medium
  - **Rationale**: To centralize travel location data, improving consistency, maintainability, and enabling dynamic updates for the travel page.
  - **Expected Outcome**: All travel location data (e.g., from `src/app/map/data.ts`) is migrated to the Neon database and accessed via Prisma. The travel map/page displays data dynamically.
  - **Dependencies**: Database schema defined for travel locations.

- **[Refactor] Migrate Book Covers and Other Static Assets to Vercel Blob**
  - **Complexity**: Medium
  - **Rationale**: To optimize delivery, reduce load on the application server, and improve scalability for static assets like book covers and project images.
  - **Expected Outcome**: Relevant static assets are hosted on Vercel Blob (or a similar service). Application URLs are updated to point to these assets. Repository size may decrease.
  - **Dependencies**: Vercel Blob (or alternative) account and setup.

### Feature Enhancements & UI/UX Redesigns

- **[Feature] Add Search & Better Organization to Admin Readings/Quotes Management Pages**

  - **Complexity**: Medium
  - **Rationale**: To improve the efficiency and usability of the admin interface for managing a growing number of readings and quotes.
  - **Expected Outcome**: Admin pages for readings and quotes include robust search, filtering, and sorting capabilities. The UI is more organized and intuitive for content management.
  - **Dependencies**: Data for readings/quotes being in the database.

- **[Enhancement] Rework Projects Page to Display Active Projects & Redesign with Clean Logos**

  - **Complexity**: Medium
  - **Rationale**: To enhance user experience by focusing on current, active projects and improving the visual appeal and professionalism of the projects page.
  - **Expected Outcome**: The projects page primarily displays active projects (with an option to view archived ones, if desired). The design is updated to include clean, high-quality project logos and a more modern layout.
  - **Dependencies**: "Migrate Project Data to Neon Database" (to manage active status and logo URLs).

- **[Enhancement] Totally Redesign Readings Gallery (Especially Metadata Ribbons)**

  - **Complexity**: Medium
  - **Rationale**: To improve the visual appeal, information hierarchy, and user experience of the readings gallery, making it more engaging and modern.
  - **Expected Outcome**: A redesigned readings gallery with improved aesthetics, clearer presentation of metadata (e.g., via revamped ribbons or cards), and enhanced usability.
  - **Dependencies**: "Migrate Book Covers and Other Static Assets to Vercel Blob" for optimized cover images.

- **[Enhancement] Totally Redesign Travel Page**
  - **Complexity**: Medium
  - **Rationale**: To modernize the travel page design, potentially enhance its interactivity, and provide a better user experience for showcasing travel locations.
  - **Expected Outcome**: A redesigned travel page with an improved UI/UX, potentially integrating more interactive map features or a more visually appealing gallery of locations.
  - **Dependencies**: "Migrate Travel Location Data to Neon Database".

## Low Priority

### New Features

- **[Feature] Add "Favorite" Flag to Readings**

  - **Complexity**: Simple
  - **Rationale**: To allow users (or admin) to mark specific readings as favorites, enabling personalization, curation, and potentially new filtering options.
  - **Expected Outcome**: Readings can be marked/unmarked as "favorite" via the UI/admin. This status is persisted in the database. UI can optionally highlight or filter by favorites.
  - **Dependencies**: Readings data managed in the database.

- **[Feature] Add Proper Blog Functionality**
  - **Complexity**: Complex
  - **Rationale**: To expand content offerings by adding a fully-featured blog for articles, updates, or other long-form content.
  - **Expected Outcome**: A functional blog section with capabilities for creating, editing, publishing, and displaying posts (e.g., using Markdown/MDX, categories, tags). Data stored in the Neon database.
  - **Dependencies**: Core site architecture stable.

### Research & Exploration

- **[Research] Experiment with Neon MCP Server**
  - **Complexity**: Medium
  - **Rationale**: To explore potential performance, cost, or connection management benefits of using Neon's Managed Components Proxy (MCP) or other advanced Neon features.
  - **Expected Outcome**: A clear understanding of Neon MCP's benefits and drawbacks for this application. A documented recommendation on whether to adopt it, possibly with a prototype.
  - **Dependencies**: None

## Future Considerations

- **[Process]** Formally Adopt Test-Driven Development (TDD) for New Features
  - **Rationale**: To consistently achieve high test coverage from the start of new feature development and improve code design.
  - **Expected Outcome**: New features are developed by writing tests first, ensuring coverage and design clarity.
- **[Enhancement]** Advanced Accessibility Audit and Remediation (WCAG AA/AAA)
  - **Rationale**: To go beyond basic accessibility and ensure the site is usable by the widest possible audience.
  - **Expected Outcome**: Site meets higher levels of WCAG compliance, verified by thorough audits.
- **[Feature]** User Accounts & Personalization (beyond admin)
  - **Rationale**: To allow public users to create accounts, save preferences (e.g., favorites), or other personalized features.
  - **Expected Outcome**: Public user registration, login, and profile management capabilities.
- **[Enhancement]** Internationalization (i18n) and Localization (l10n)
  - **Rationale**: To prepare the application for a global audience by supporting multiple languages.
  - **Expected Outcome**: Core infrastructure for i18n in place; key UI elements translatable.
- **[Enhancement]** Implement Visual Regression Testing
  - **Rationale**: To automatically catch unintended UI changes and ensure visual consistency across releases.
  - **Expected Outcome**: CI pipeline includes visual regression tests for key components and pages.
- **[Feature]** Advanced Analytics and Reporting Dashboard (Admin)
  - **Rationale**: To provide insights into content engagement, user activity, and site performance for admin users.
  - **Expected Outcome**: An admin dashboard displaying key metrics and visualizations.
