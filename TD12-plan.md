# TD12 Plan: Fix useListState React Testing Issues

## Issue Analysis

After examining the `useListState.test.tsx` file and the corresponding hook implementation, I've identified the key issues causing the "not wrapped in act(...)" warnings:

1. **Asynchronous State Updates**:

   - The hook makes asynchronous API calls and updates state based on the response.
   - The test isn't properly waiting for or wrapping all state updates in `act()` calls.

2. **Multiple Dispatch Calls**:

   - The implementation has multiple consecutive dispatch calls (e.g., `SET_ITEMS`, `SET_TOTAL_ITEMS`, and `SET_LOADING` in sequence).
   - Each dispatch causes a React state update that needs to be properly handled in tests.

3. **Deprecated Testing Methods**:

   - The test uses `waitForNextUpdate()` which is deprecated in the latest versions of React Testing Library.
   - The newer approach uses `waitFor()` with specific assertions.

4. **setTimeout Usage for Debouncing**:
   - The hook uses setTimeout for debouncing search, which creates timing challenges for testing.

## Implementation Approach

To address these issues while maintaining the hook's functionality, I'll:

1. **Modernize Test Patterns**:

   - Replace deprecated `waitForNextUpdate()` with the more explicit `waitFor()` pattern.
   - Use `act()` to wrap all state updates properly, especially for async operations.

2. **Create a Custom Render Hook Utility**:

   - Implement a helper function to properly set up and wait for async updates.
   - This will simplify test cases and ensure consistent handling.

3. **Fix Individual Test Cases**:

   - Update each test case to follow modern React Testing Library patterns.
   - Ensure all assertions occur after state updates have completed.

4. **Control Timeout Behavior**:
   - Use Jest's timer mocks to control setTimeout behavior for testing debounced functions.

## Specific Changes

1. **Improve Test Setup**:

   - Create a utility for rendering hooks with consistent async handling.
   - Use proper cleanup between tests to prevent state leakage.

2. **Update Test Assertions**:

   - Replace `waitForNextUpdate()` with `waitFor(() => expect(...))` pattern.
   - Ensure all state changes are wrapped in `act()` calls.

3. **Implement Jest Timer Mocks**:
   - Use `jest.useFakeTimers()` to control setTimeout for debounce testing.
   - Add explicit `jest.runAllTimers()` calls to advance timers.

## Implementation Details

```typescript
// Example of updated test pattern
it('initializes with default values', async () => {
  const { result } = renderHook(() =>
    useListState<TestItem>({
      fetchItems: mockFetchItems,
      fetchOnMount: true,
    })
  );

  // Check initial loading state
  expect(result.current.isLoading).toBe(true);

  // Wait for the loading state to change
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  // Now check the final state after data loading
  expect(result.current.items).toEqual(defaultResponse.data);
  expect(result.current.search).toBe('');
  expect(result.current.sort).toEqual({ field: 'id', order: 'desc' });
  expect(result.current.pagination.pageSize).toBe(10);
  expect(result.current.pagination.currentPage).toBe(1);
});
```

For tests involving user actions like changing page or search:

```typescript
it('changes page and fetches new data', async () => {
  const { result } = renderHook(() =>
    useListState<TestItem>({
      fetchItems: mockFetchItems,
      fetchOnMount: true,
    })
  );

  // Wait for initial load to complete
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  // Set up mock for next page
  mockFetchItems.mockResolvedValueOnce({
    ...defaultResponse,
    currentPage: 2,
  });

  // Change page
  act(() => {
    result.current.setPage(2);
  });

  // Wait for loading to start
  await waitFor(() => {
    expect(result.current.isLoading).toBe(true);
  });

  // Then wait for it to finish
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  // Check that fetch was called with updated offset
  expect(mockFetchItems).toHaveBeenCalledWith(
    expect.objectContaining({
      offset: 10, // Page 2 with page size 10
    })
  );
});
```

This approach follows modern React Testing Library best practices and ensures all state updates are properly handled with `act()` and `waitFor()`.
