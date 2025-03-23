/**
 * Tests for useReadingsList and useQuotesList hooks - Adapted for React 19
 */

import { renderHook, act } from '@testing-library/react';
import { useReadingsList } from '../useReadingsList';
import { useQuotesList } from '../useQuotesList';

// Mock fetch
const originalFetch = global.fetch;
let mockFetchResolve: (value: any) => void;
let mockFetchPromise: Promise<any>;

beforeEach(() => {
  mockFetchPromise = new Promise((resolve) => {
    mockFetchResolve = resolve;
  });
  
  global.fetch = jest.fn().mockImplementation((url) => {
    // Store the URL that was called for testing
    (global.fetch as jest.Mock).lastCalledWithUrl = url;
    return {
      ok: true,
      json: () => mockFetchPromise
    };
  });
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('useReadingsList and useQuotesList', () => {
  it('useReadingsList constructs correct API URL with parameters', async () => {
    renderHook(() => 
      useReadingsList({
        initialSearch: 'test search',
        initialFilters: { status: 'read' },
        initialSort: { field: 'title', order: 'asc' },
        initialPageSize: 5,
        fetchOnMount: true
      })
    );
    
    // Get the actual URL that was called
    const url = (global.fetch as any).lastCalledWithUrl;
    
    // Check that the URL contains the expected parameters
    expect(url).toMatch(/^\/api\/readings\?/);
    expect(url).toMatch(/search=test(\+|%20)search/); // Match either + or %20 encoding
    expect(url).toMatch(/status=read/);
    expect(url).toMatch(/sortBy=title/);
    expect(url).toMatch(/sortOrder=asc/);
    expect(url).toMatch(/limit=5/);
    
    // Complete the fetch
    act(() => {
      mockFetchResolve({
        data: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: 5
      });
    });
  });
  
  it('useQuotesList constructs correct API URL with parameters', async () => {
    renderHook(() => 
      useQuotesList({
        initialSearch: 'wisdom',
        initialSort: { field: 'author', order: 'asc' },
        initialPageSize: 15,
        fetchOnMount: true
      })
    );
    
    // Get the actual URL that was called
    const url = (global.fetch as any).lastCalledWithUrl;
    
    // Check that the URL contains the expected parameters
    expect(url).toMatch(/^\/api\/quotes\?/);
    expect(url).toMatch(/search=wisdom/);
    expect(url).toMatch(/sortBy=author/);
    expect(url).toMatch(/sortOrder=asc/);
    expect(url).toMatch(/limit=15/);
    
    // Complete the fetch
    act(() => {
      mockFetchResolve({
        data: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: 15
      });
    });
  });
  
  it('useReadingsList handles API errors', async () => {
    // Set up mocks
    global.fetch = jest.fn().mockImplementation(() => ({
      ok: false,
      statusText: 'Not Found'
    }));
    
    // Suppress console errors for clean test output
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const { result } = renderHook(() => 
      useReadingsList({ fetchOnMount: true })
    );
    
    // Wait for the state update
    await act(async () => {
      await Promise.resolve();
    });
    
    // Check that error state is set
    expect(result.current.error).toBe('Error fetching readings: Not Found');
    expect(result.current.isLoading).toBe(false);
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});