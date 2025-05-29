# Audit Filter Test Mocks

This directory contains mock implementations for external dependencies used by the audit-filter module. These mocks enable testing without touching the filesystem or spawning real processes.

## Available Mocks

- `fs.ts` - Mock implementation of Node.js `fs` module (specifically `readFileSync` and `existsSync`)
- `child_process.ts` - Mock implementation of Node.js `child_process` module (specifically `execSync`)
- `mockHelpers.ts` - Common utilities for creating mock data and managing mock state
- `setupMocks.ts` - Convenience functions for setting up common test scenarios

## Usage

### Basic Usage

The recommended way to use these mocks is through the `setupMocks` module, which provides high-level functions for common test scenarios:

```typescript
import {
  resetMocks,
  setupCleanAuditWithAllowlist,
  setupVulnerabilitiesWithMatchingAllowlist,
  // ...more scenario setups
} from '../__mocks__/setupMocks';

describe('My Test Suite', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    resetMocks();
  });

  test('should handle clean audit result', () => {
    // Setup the mock scenario
    setupCleanAuditWithAllowlist();

    // Now run your code that uses fs and child_process
    // It will use the mock implementations
  });
});
```

### Available Scenarios

The `setupMocks` module provides several pre-configured scenarios:

- `setupCleanAuditWithAllowlist()` - Clean audit with no vulnerabilities and a valid allowlist
- `setupVulnerabilitiesWithMatchingAllowlist()` - Vulnerabilities with matching allowlist entries
- `setupVulnerabilitiesWithPartialAllowlist()` - Vulnerabilities with some missing allowlist entries
- `setupVulnerabilitiesWithExpiredAllowlist()` - Vulnerabilities with expired allowlist entries
- `setupMissingAllowlist()` - Missing allowlist file
- `setupMalformedAllowlist()` - Malformed allowlist JSON
- `setupNpmAuditFailure()` - npm audit command fails
- `setupAllowlistReadFailure()` - Reading allowlist file fails

### Advanced Usage

For more complex scenarios, you can directly access the mock modules:

```typescript
import { childProcessMock, fsMock } from '../__mocks__/setupMocks';

test('custom scenario', () => {
  // Configure npm audit to return custom output
  childProcessMock.mockCommandOutput('npm audit --json', customOutput);

  // Add a custom file to the mock filesystem
  fsMock.addMockFile('/custom/path/allowlist.json', customAllowlist);

  // Configure npm audit to simulate failure
  childProcessMock.mockExecSyncFailure(customError);
});
```

### Verifying Mock Calls

You can verify that your code correctly interacts with the dependencies:

```typescript
test('should read allowlist file', () => {
  // ... run your code

  // Verify fs.existsSync was called with the correct path
  expect(fsMock.existsSync).toHaveBeenCalledWith('/expected/path');

  // Verify fs.readFileSync was called with the correct parameters
  expect(fsMock.readFileSync).toHaveBeenCalledWith('/expected/path', 'utf-8');

  // Verify child_process.execSync was called with the correct command
  expect(childProcessMock.execSync).toHaveBeenCalledWith('npm audit --json', expect.anything());
});
```

## Mock State

Each mock maintains its state in a `mockState` object, which you can inspect during tests:

```typescript
test('should track file operations', () => {
  // ... run your code

  // Inspect the last file path that was read
  console.log(fsMock.mockState.lastReadFilePath);

  // Inspect the last command that was executed
  console.log(childProcessMock.mockState.lastCommand);
});
```

## Implementing New Tests

When implementing new tests that use these mocks:

1. Import the necessary setup functions from `../mocks/setupMocks`
2. Reset the mocks in `beforeEach` using `resetMocks()`
3. Set up the desired scenario using the provided setup functions
4. Run your code that interacts with `fs` and `child_process`
5. Verify the expected results
6. Optionally, verify that the mocks were called correctly

See `integration.test.ts` for examples of how to use these mocks effectively.
