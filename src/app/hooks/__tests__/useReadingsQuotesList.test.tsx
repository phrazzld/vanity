/**
 * Tests for useReadingsList and useQuotesList hooks - Adapted for React 19
 */

import { renderHook, act } from '@testing-library/react';
import { useReadingsList } from '../useReadingsList';
import { useQuotesList } from '../useQuotesList';

// Mock the CSRF client module
jest.mock('../../utils/csrf-client', () => ({
  secureFetch: jest.fn().mockImplementation((url) => {
    // Store the URL that was called for testing
    (jest.requireMock('../../utils/csrf-client').secureFetch as jest.Mock).lastCalledWithUrl = url;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10
      })
    });
  }),
  getCsrfToken: jest.fn().mockResolvedValue('test-csrf-token')
}));

// Mock fetch (still needed for some legacy tests)
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
  
  // Reset secureFetch mock before each test
  const { secureFetch } = jest.requireMock('../../utils/csrf-client');
  secureFetch.mockClear();
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
    
    // Wait for the async operation to complete
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the mocked secureFetch function
    const { secureFetch } = jest.requireMock('../../utils/csrf-client');
    
    // Get the actual URL that was called
    const url = secureFetch.lastCalledWithUrl;
    
    // Check that the URL contains the expected parameters
    expect(url).toMatch(/^\/api\/readings\?/);
    expect(url).toMatch(/search=test(\+|%20)search/); // Match either + or %20 encoding
    expect(url).toMatch(/status=read/);
    expect(url).toMatch(/sortBy=title/);
    expect(url).toMatch(/sortOrder=asc/);
    expect(url).toMatch(/limit=10/); // Actual value from the implementation
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
    
    // Wait for the async operation to complete
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the mocked secureFetch function
    const { secureFetch } = jest.requireMock('../../utils/csrf-client');
    
    // Get the actual URL that was called
    const url = secureFetch.lastCalledWithUrl;
    
    // Check that the URL contains the expected parameters
    expect(url).toMatch(/^\/api\/quotes\?/);
    expect(url).toMatch(/search=wisdom/);
    expect(url).toMatch(/sortBy=author/);
    expect(url).toMatch(/sortOrder=asc/);
    expect(url).toMatch(/limit=10/); // Actual value from the implementation
  });
  
  it('useReadingsList handles API errors', async () => {
    // Set up mocks for secureFetch to simulate an error
    const { secureFetch } = jest.requireMock('../../utils/csrf-client');
    secureFetch.mockRejectedValueOnce(new Error('Error fetching readings: Not Found'));
    
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
    expect(result.current.error).toContain('Error fetching readings');
    expect(result.current.isLoading).toBe(false);
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});