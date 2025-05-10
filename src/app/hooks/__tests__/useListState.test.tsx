/**
 * Tests for useListState hook
 * @jest-environment jsdom
 */

/* eslint-env jest */

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
    { id: 2, name: 'Item 2' },
  ],
  totalCount: 2,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
};

describe('useListState', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFetchItems.mockReset();
    mockFetchItems.mockResolvedValue(defaultResponse);
  });

  it('initializes with default values', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useListState<TestItem>({
        fetchItems: mockFetchItems,
        fetchOnMount: true,
      })
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for initial fetch to complete
    await waitForNextUpdate();

    // Default state should be set
    expect(result.current.items).toEqual(defaultResponse.data);
    expect(result.current.search).toBe('');
    expect(result.current.sort).toEqual({ field: 'id', order: 'desc' });
    expect(result.current.pagination.pageSize).toBe(10);
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('accepts initial values', async () => {
     
    const { result } = renderHook(() =>
      useListState<TestItem>({
        fetchItems: mockFetchItems,
        initialSearch: 'test',
        initialSort: { field: 'name', order: 'asc' },
        initialPageSize: 20,
        fetchOnMount: false,
      })
    );

    // Initial values should be set
    expect(result.current.search).toBe('test');
    expect(result.current.sort).toEqual({ field: 'name', order: 'asc' });
    expect(result.current.pagination.pageSize).toBe(20);
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches data with correct parameters', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useListState<TestItem>({
        fetchItems: mockFetchItems,
        initialSearch: 'test',
        initialSort: { field: 'name', order: 'asc' },
        initialPageSize: 5,
        fetchOnMount: true,
      })
    );

    // Wait for initial fetch to complete
    await waitForNextUpdate();

    // Check that fetch was called with correct parameters
    expect(mockFetchItems).toHaveBeenCalledWith({
      search: 'test',
      sortBy: 'name',
      sortOrder: 'asc',
      limit: 5,
      offset: 0,
    });
  });

  it('changes page and fetches new data', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useListState<TestItem>({
        fetchItems: mockFetchItems,
        fetchOnMount: true,
      })
    );

    // Wait for initial fetch to complete
    await waitForNextUpdate();

    // Set up mock for next page
    mockFetchItems.mockResolvedValueOnce({
      ...defaultResponse,
      currentPage: 2,
    });

    // Change page
    act(() => {
      result.current.setPage(2);
    });

    // Wait for fetch to complete
    await waitForNextUpdate();

    // Check that fetch was called with updated offset
    expect(mockFetchItems).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 10, // Page 2 with page size 10
      })
    );
  });

  it('updates search and resets to page 1', async () => {
    // Mock for second page
    mockFetchItems.mockResolvedValueOnce({
      ...defaultResponse,
      currentPage: 2,
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useListState<TestItem>({
        fetchItems: mockFetchItems,
        fetchOnMount: true,
        searchDebounce: 0, // Disable debounce for testing
      })
    );

    // Wait for initial fetch to complete
    await waitForNextUpdate();

    // Go to page 2
    act(() => {
      result.current.setPage(2);
    });

    // Wait for fetch to complete
    await waitForNextUpdate();

    // Prepare mock for search results
    mockFetchItems.mockResolvedValueOnce({
      ...defaultResponse,
      data: [{ id: 3, name: 'Item 3' }],
      totalCount: 1,
    });

    // Update search
    act(() => {
      result.current.setSearch('new search');
    });

    // Wait for fetch to complete
    await waitForNextUpdate();

    // Page should be reset to 1
    expect(result.current.pagination.currentPage).toBe(1);

    // Check that fetch was called with updated search and reset page
    expect(mockFetchItems).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'new search',
        offset: 0, // Page 1
      })
    );
  });

  it('handles filter changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useListState<TestItem, { category: string }>({
        fetchItems: mockFetchItems,
        initialFilters: { category: 'all' },
        fetchOnMount: true,
      })
    );

    // Wait for initial fetch to complete
    await waitForNextUpdate();

    // Prepare mock for filtered results
    mockFetchItems.mockResolvedValueOnce({
      ...defaultResponse,
      data: [{ id: 1, name: 'Item 1' }],
      totalCount: 1,
    });

    // Update a single filter
    act(() => {
      result.current.updateFilter('category', 'books');
    });

    // Wait for fetch to complete
    await waitForNextUpdate();

    // Check that fetch was called with updated filter
    expect(mockFetchItems).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'books',
      })
    );

    // Update all filters at once
    mockFetchItems.mockResolvedValueOnce({
      ...defaultResponse,
      data: [{ id: 2, name: 'Item 2' }],
      totalCount: 1,
    });

    act(() => {
      result.current.setFilters({ category: 'movies' });
    });

    // Wait for fetch to complete
    await waitForNextUpdate();

    // Check that fetch was called with updated filters
    expect(mockFetchItems).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'movies',
      })
    );
  });

  it('handles sort changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useListState<TestItem>({
        fetchItems: mockFetchItems,
        fetchOnMount: true,
      })
    );

    // Wait for initial fetch to complete
    await waitForNextUpdate();

    // Prepare mock for sorted results
    mockFetchItems.mockResolvedValueOnce(defaultResponse);

    // Set sort
    act(() => {
      result.current.setSort('name', 'asc');
    });

    // Wait for fetch to complete
    await waitForNextUpdate();

    // Check that fetch was called with updated sort
    expect(mockFetchItems).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'name',
        sortOrder: 'asc',
      })
    );

    // Toggle sort on same field
    mockFetchItems.mockResolvedValueOnce(defaultResponse);

    act(() => {
      result.current.toggleSort('name');
    });

    // Wait for fetch to complete
    await waitForNextUpdate();

    // Should toggle to desc
    expect(mockFetchItems).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'name',
        sortOrder: 'desc',
      })
    );
  });

  it('handles errors', async () => {
    // Mock error
    const testError = new Error('Network error');
    mockFetchItems.mockRejectedValueOnce(testError);

    const { result, waitForNextUpdate } = renderHook(() =>
      useListState<TestItem>({
        fetchItems: mockFetchItems,
        fetchOnMount: true,
      })
    );

    // Wait for fetch to complete with error
    await waitForNextUpdate();

    // Error should be set
    expect(result.current.error).toBe(testError.message);
    expect(result.current.isLoading).toBe(false);
  });
});
