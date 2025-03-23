/**
 * Tests for useListState hook - Adapted for React 19
 */

import { renderHook, act } from '@testing-library/react';
import { useListState } from '../useListState';

// Mock data
interface TestItem {
  id: number;
  name: string;
}

// Mock fetch function
const mockFetchItems = jest.fn();

// Default test response
const defaultResponse = {
  data: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ],
  totalCount: 2,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10
};

// Setup and cleanup
beforeEach(() => {
  mockFetchItems.mockReset();
  mockFetchItems.mockResolvedValue(defaultResponse);
});

describe('useListState', () => {
  it('initializes with default values', async () => {
    let fetchPromiseResolve: (value: unknown) => void;
    const fetchPromise = new Promise(resolve => {
      fetchPromiseResolve = resolve;
    });
    
    mockFetchItems.mockImplementation(() => {
      return fetchPromise;
    });

    const { result } = renderHook(() => useListState<TestItem>({
      fetchItems: mockFetchItems,
      fetchOnMount: true
    }));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Resolve the fetch promise
    act(() => {
      fetchPromiseResolve(defaultResponse);
    });
    
    // Need to wait for the next tick for state to update
    await act(async () => {
      await Promise.resolve();
    });

    // Default state should be set
    expect(result.current.items).toEqual(defaultResponse.data);
    expect(result.current.search).toBe('');
    expect(result.current.sort).toEqual({ field: 'id', order: 'desc' });
    expect(result.current.pagination.pageSize).toBe(10);
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('accepts initial values', () => {
    const { result } = renderHook(() => useListState<TestItem>({
      fetchItems: mockFetchItems,
      initialSearch: 'test',
      initialSort: { field: 'name', order: 'asc' },
      initialPageSize: 20,
      fetchOnMount: false
    }));

    // Initial values should be set
    expect(result.current.search).toBe('test');
    expect(result.current.sort).toEqual({ field: 'name', order: 'asc' });
    expect(result.current.pagination.pageSize).toBe(20);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles errors', async () => {
    // Mock error
    const testError = new Error('Network error');
    mockFetchItems.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useListState<TestItem>({
      fetchItems: mockFetchItems,
      fetchOnMount: true
    }));

    // Wait for state updates to complete
    await act(async () => {
      await Promise.resolve();
    });

    // Error should be set
    expect(result.current.error).toBe(testError.message);
    expect(result.current.isLoading).toBe(false);
  });
});