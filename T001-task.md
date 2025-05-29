# Task ID: T001

## Title: Refactor `audit-filter.ts` for testability

## Original Ticket Text:

- [~] **T001 · Refactor · P0: Refactor `audit-filter.ts` for testability**
  - **Action:**
    1. Extract all core logic into pure functions/classes, decoupling from CLI entry point
    2. Ensure all dependencies (fs, child_process, etc.) are injected or mockable
    3. Make core functions exportable and testable in isolation
  - **Done-when:**
    1. Core logic can be imported and tested independently of the CLI wrapper
    2. CLI entrypoint primarily orchestrates calls to the refactored core logic
  - **Depends-on:** none

## Implementation Approach Analysis Prompt:

I need to refactor the audit-filter.ts script to separate core logic from the CLI entry point, making it more testable, while maintaining the same functionality.

The current implementation has several issues that make it difficult to test:

1. Direct use of side-effect functions (fs, child_process, process.exit) throughout the codebase
2. No separation between pure logic and CLI/IO operations
3. No clear way to inject dependencies or mock them for testing
4. Hard-coded console.log/error calls spread throughout functions

To make this code more testable, I need to:

1. Separate the pure business logic from side effects
2. Extract a core module with pure functions that can be tested in isolation
3. Create a CLI wrapper that handles IO, process management, and orchestrates the core functions
4. Make dependencies injectable for testing
5. Ensure the refactored code maintains identical behavior

Specifically analyze:

- Which functions contain pure logic vs. side effects
- How to structure the interfaces between core logic and CLI layer
- How to handle dependencies like fs and child_process
- How to handle logging in a way that's testable
- How to structure the exports to make testing easier
- How to maintain the same behavior during refactoring

The refactored code should adhere to the project's development philosophy:

- Simplicity First
- Modularity is Mandatory
- Design for Testability
- Explicit is Better than Implicit
- Document Decisions, Not Mechanics

Please analyze the best approach to refactor this script for testability while maintaining current functionality.
