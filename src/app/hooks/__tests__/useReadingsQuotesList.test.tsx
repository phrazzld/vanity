/**
 * Tests for useReadingsList and useQuotesList hooks
 */

import { renderHook } from '@testing-library/react-hooks';
import { useReadingsList } from '../useReadingsList';
import { useQuotesList } from '../useQuotesList';

// Mock fetch
global.fetch = jest.fn();

describe('useReadingsList and useQuotesList', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    // Mock successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      }),
    });
  });

  it('useReadingsList constructs correct API URL with parameters', async () => {
    // Don't actually call fetch during this test
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderHook(() =>
      useReadingsList({
        initialSearch: 'test search',
        initialFilters: { status: 'read' },
        initialSort: { field: 'title', order: 'asc' },
        initialPageSize: 5,
        fetchOnMount: true,
      })
    );

    // Check that fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/readings\?/));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('search=test%20search'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('status=read'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('sortBy=title'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('sortOrder=asc'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=5'));
  });

  it('useQuotesList constructs correct API URL with parameters', async () => {
    // Don't actually call fetch during this test
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderHook(() =>
      useQuotesList({
        initialSearch: 'wisdom',
        initialSort: { field: 'author', order: 'asc' },
        initialPageSize: 15,
        fetchOnMount: true,
      })
    );

    // Check that fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/quotes\?/));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('search=wisdom'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('sortBy=author'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('sortOrder=asc'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('limit=15'));
  });

  it('useReadingsList handles API errors', async () => {
    // Mock error response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    // Suppress console errors for clean test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() => useReadingsList({ fetchOnMount: true }));

    // Wait for the error to be processed
    await waitForNextUpdate();

    // Check that error state is set
    expect(result.current.error).toBe('Error fetching readings: Not Found');
    expect(result.current.isLoading).toBe(false);

    // Restore console.error
    console.error = originalConsoleError;
  });
});
