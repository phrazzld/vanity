# TD7 Plan: Fix ReadingCard Component Tests

## Problem

The ReadingCard component tests are currently failing with several issues:

1. TestingLibraryElementError suggesting to use better queries (queryByText instead of queryByTestId)
2. Potential issues with style assertions and hover interaction testing

From the test output error:

```
TestingLibraryElementError: A better query is available, try this:
queryByText(/test book/i)
```

## Implementation Approach

1. Examine the current ReadingCard component test implementation

   - Identify instances where data-testid attributes are used instead of more semantic queries
   - Review how style assertions and interactions (like hover) are being tested

2. Update the tests following Testing Library best practices:

   - Replace queryByTestId with more semantic queries like queryByText, queryByRole, etc.
   - Ensure proper use of Testing Library's userEvent for simulating interactions
   - Review and fix any style assertions that might be brittle or implementation-specific

3. Consider using Testing Library's built-in assertions for checking visibility, presence, etc.

   - Use toBeVisible(), toHaveTextContent(), etc. instead of custom style assertions where possible

4. Run tests to verify fixes
   - First run tests in watch mode to iterate quickly
   - Then run full test suite to ensure no regressions

This approach follows the development philosophy's principles of testability and maintainability by:

- Using more semantic and user-centric testing approaches
- Reducing reliance on implementation details like testIds
- Making tests more robust and less likely to break with implementation changes
