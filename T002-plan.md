# T002 Plan: Set up mocking for external dependencies

## Overview

This task involves implementing Jest mocks for external dependencies that are used in the `audit-filter-new.ts` script. These mocks will enable testing without touching the filesystem or spawning real processes, ensuring that tests run consistently and in isolation. The primary dependencies to mock are:

1. `child_process.execSync` (for running npm audit)
2. `fs.readFileSync` (for reading the allowlist file)
3. `fs.existsSync` (for checking if the allowlist file exists)

## Approach

I'll create a structured, reusable mocking approach that adheres to the project's development philosophy, particularly the focus on maintainability, testability, and explicit contracts.

### 1. Create Jest Mock Files Structure

- Create a dedicated `__mocks__` directory alongside the existing `__tests__` directory in the `src/lib/audit-filter` folder
- Separate mock files for each node module being mocked to maintain focus and separation of concerns

### 2. Implement Type-Safe, Configurable Mocks

For each external dependency, I'll implement:

- A properly typed mock implementation
- Configuration functions to set up different scenarios
- Clear default behaviors that align with common test cases
- Helper functions for common mock patterns

### 3. Set Up Module Mock Initialization

- Create a setup file for initializing mocks with default values
- Create helper functions for setting up common mock scenarios
- Support reset functionality to ensure tests remain isolated

### 4. Document Usage Patterns

- Add clear documentation for how to use the mocks in tests
- Include examples for common scenarios

## Implementation Steps

1. Create the mock directory structure
2. Implement type-safe mock for `child_process`
3. Implement type-safe mock for `fs` (covering both `readFileSync` and `existsSync`)
4. Create a common mock helper module for setting up test scenarios
5. Update the Jest configuration if needed
6. Create example tests that demonstrate mock usage

## Detailed Implementation

### 1. Directory Structure

```
src/lib/audit-filter/
├── __mocks__/
│   ├── child_process.ts  # Mock for child_process
│   ├── fs.ts             # Mock for fs
│   └── mockHelpers.ts    # Common mock utilities
├── __tests__/
│   ├── core.test.ts      # Existing tests
│   └── integration.test.ts # New integration tests using mocks
```

### 2. Mock Implementation Approach

Each mock will follow this pattern:

- Use Jest's `jest.mock()` to mock the module
- Provide type-safe mock implementations
- Create utility functions to configure the mocks for different scenarios
- Use a reset mechanism to ensure test isolation

### 3. Usage in Tests

Tests will:

1. Import the mock configuration helpers
2. Set up the mock behavior needed for each test
3. Execute the code under test
4. Verify the results

## Expected Outcomes

1. All external I/O is properly mocked
2. Tests can simulate various scenarios (file exists/doesn't exist, command success/failure)
3. Mocks are reusable across different test suites
4. Testing can be done without filesystem access or process spawning
5. Mock implementation is type-safe and maintainable
