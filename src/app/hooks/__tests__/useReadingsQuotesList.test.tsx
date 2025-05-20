/**
 * Tests for useReadingsList and useQuotesList hooks
 * @jest-environment jsdom
 */

/* eslint-env jest */

import { renderHook, waitFor } from '@testing-library/react';
import { useReadingsList } from '../useReadingsList';
import { useQuotesList } from '../useQuotesList';

// Use globalThis instead of global to ensure compatibility across environments
// The fetch property exists on globalThis in both Node.js and browser environments
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

describe('useReadingsList and useQuotesList', () => {
  // Store original fetch implementation to restore after tests
  const originalFetch = globalThis.fetch;

  // Clean up after all tests
  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.resetAllMocks();

    // Mock successful response
    mockFetch.mockResolvedValue({
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
    mockFetch.mockImplementation(() => new Promise(() => {}));

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
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/readings\?/));
    // Note: URLSearchParams encodes spaces as '+' not '%20', so we check for 'search=test+search'
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('search=test+search'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('status=read'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortBy=title'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortOrder=asc'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=5'));
  });

  it('useQuotesList constructs correct API URL with parameters', async () => {
    // Don't actually call fetch during this test
    mockFetch.mockImplementation(() => new Promise(() => {}));

    renderHook(() =>
      useQuotesList({
        initialSearch: 'wisdom',
        initialSort: { field: 'author', order: 'asc' },
        initialPageSize: 15,
        fetchOnMount: true,
      })
    );

    // Check that fetch was called with correct URL
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/quotes\?/));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('search=wisdom'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortBy=author'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortOrder=asc'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=15'));
  });

  it('useReadingsList handles API errors', async () => {
    // Mock error response
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    // Suppress console errors for clean test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Using async API for modern React Testing Library
    const { result } = renderHook(() => useReadingsList({ fetchOnMount: true }));

    // Wait for the error state to be set
    // This is more reliable than fixed timeouts
    await waitFor(
      () => {
        expect(result.current.error).toBe('Error fetching readings: Not Found');
      },
      { timeout: 1000 }
    );

    // Check additional state
    expect(result.current.isLoading).toBe(false);

    // Restore console.error
    console.error = originalConsoleError;
  });
});
