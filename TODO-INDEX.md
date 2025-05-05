# Project Setup TODO List - Index

The original TODO list has been split into five focused plans based on a scope assessment. Each plan is independently implementable, with recommendations to complete them in the following order:

1. [Plan 1: Local Tooling & Core Quality Standards](TODO-1.md) - Ensure developers adhere to standards locally.
2. [Plan 2: Infrastructure & CI/CD Setup](TODO-2.md) - Establish automated quality gates.
3. [Plan 3: Node.js/TypeScript Backend Foundation](TODO-3.md) - Set up the core language environment and testing.
4. [Plan 4: Frontend Foundation](TODO-4.md) - Build the UI development environment.
5. [Plan 5: Project Documentation & Contribution Guidelines](TODO-5.md) - Finalize documentation.

## Dependencies Between Plans

- **Plan 3 & 4** depend on **Plan 1** for base linting/formatting configurations.
- **Plan 2 (CI)** depends on scripts and configurations established in **Plan 1** (lint, format check), **Plan 3** (test, typecheck, build), and potentially **Plan 4** (component tests, storybook build) to execute checks.
- **Plan 1 (Hooks)** should ideally mirror checks run by **Plan 2 (CI)**.
- **Plan 4 (Frontend)** depends on the TypeScript and testing foundation from **Plan 3**.
- **Plan 5 (Docs)** depends informationally on the outcomes and configurations of Plans 1-4.
