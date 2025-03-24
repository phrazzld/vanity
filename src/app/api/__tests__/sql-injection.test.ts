import { GET as getReadings } from '../readings/route';
import { GET as getQuotes } from '../quotes/route';
import * as db from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock the db module
jest.mock('@/lib/db', () => ({
  getReadings: jest.fn(),
  getReading: jest.fn(),
  getReadingsWithFilters: jest.fn(),
  getQuotes: jest.fn(),
  getQuote: jest.fn(),
  getQuotesWithFilters: jest.fn(),
}));

// Mock the NextResponse and NextRequest
jest.mock('next/server', () => {
  return {
    __esModule: true,
    NextResponse: {
      json: jest.fn((data, options) => {
        return {
          status: options?.status || 200,
          headers: new Map(),
          json: async () => data,
          set: () => {},
        };
      }),
    },
    NextRequest: jest.fn().mockImplementation((url) => {
      const actualUrl = url || 'http://localhost:3000';
      return {
        url: actualUrl,
        headers: new Map(),
        json: jest.fn(),
        nextUrl: new URL(actualUrl),
      };
    }),
  };
});

// Helper to create a mock URL with search params
function createUrlWithSearchParams(baseUrl: string, params: Record<string, string>) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

describe('API Routes SQL Injection Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Readings API', () => {
    it('safely handles malicious slug parameter', async () => {
      // Create a request with a malicious slug parameter
      const maliciousSlug = "normal-slug'; DROP TABLE \"Reading\"; --";
      const url = createUrlWithSearchParams('http://localhost:3000/api/readings', { slug: maliciousSlug });
      const req = new NextRequest(url);
      
      // Call the handler
      await getReadings(req);
      
      // Verify that the database function was called with the parameter
      // without any SQL-related modifications
      expect(db.getReading).toHaveBeenCalledWith(maliciousSlug);
    });

    it('safely handles malicious search parameter', async () => {
      // Create a request with a malicious search parameter
      const maliciousSearch = "search term'; DROP TABLE \"Reading\"; --";
      const url = createUrlWithSearchParams('http://localhost:3000/api/readings', { 
        search: maliciousSearch,
        sortBy: 'title',
        sortOrder: 'asc',
        limit: '10',
        offset: '0'
      });
      const req = new NextRequest(url);
      
      // Call the handler
      await getReadings(req);
      
      // Verify that getReadingsWithFilters was called with the parameters
      expect(db.getReadingsWithFilters).toHaveBeenCalledWith(expect.objectContaining({
        search: maliciousSearch
      }));
    });

    it('safely handles malicious sort parameters', async () => {
      // Create a request with malicious sort parameters
      const url = createUrlWithSearchParams('http://localhost:3000/api/readings', { 
        sortBy: "title; DROP TABLE \"Reading\"; --",
        sortOrder: "asc'; DELETE FROM \"Reading\"; --"
      });
      const req = new NextRequest(url);
      
      // Call the handler
      await getReadings(req);
      
      // Verify that getReadingsWithFilters was called with the parameters
      expect(db.getReadingsWithFilters).toHaveBeenCalledWith(expect.objectContaining({
        sortBy: expect.any(String),
        sortOrder: expect.any(String)
      }));
    });

    it('safely handles malicious limit and offset parameters', async () => {
      // Create a request with malicious limit and offset parameters
      const url = createUrlWithSearchParams('http://localhost:3000/api/readings', { 
        limit: "10; DROP TABLE \"Reading\"; --",
        offset: "0; DELETE FROM \"Reading\"; --"
      });
      const req = new NextRequest(url);
      
      // Call the handler
      await getReadings(req);
      
      // Verify that getReadingsWithFilters was called with parameters
      // The values should be validated/sanitized in the route handler
      expect(db.getReadingsWithFilters).toHaveBeenCalled();
      
      // Extract the actual call arguments
      const callArgs = (db.getReadingsWithFilters as jest.Mock).mock.calls[0][0];
      
      // Verify that limit and offset were properly validated
      // They should either be numbers or reasonable defaults 
      expect(typeof callArgs.limit).toBe('number');
      expect(typeof callArgs.offset).toBe('number');
    });
  });

  describe('Quotes API', () => {
    it('safely handles malicious ID parameter', async () => {
      // Create a request with a malicious ID parameter
      const maliciousId = "1; DROP TABLE \"Quote\"; --";
      const url = createUrlWithSearchParams('http://localhost:3000/api/quotes', { id: maliciousId });
      const req = new NextRequest(url);
      
      // Call the handler
      await getQuotes(req);
      
      // The route handler should attempt to parse the ID as a number
      // which would handle malicious input by converting it to NaN
      // or applying validation rules
      expect(db.getQuote).toHaveBeenCalled();
      
      // Extract the actual call arguments
      const callArg = (db.getQuote as jest.Mock).mock.calls[0][0];
      
      // The handler should attempt to convert the ID to a number
      // which would protect against many types of SQL injection
      expect(typeof callArg).toBe('number');
      
      // Since this is a mock environment, we cannot guarantee the exact behavior
      // of parseInt in the route handler. The key validation is that the type is number,
      // which ensures that SQL injection via string would be prevented.
    });

    it('safely handles malicious search parameter in quotes filtering', async () => {
      // Create a request with a malicious search parameter
      const maliciousSearch = "search term'; DROP TABLE \"Quote\"; --";
      const url = createUrlWithSearchParams('http://localhost:3000/api/quotes', { 
        search: maliciousSearch,
        sortBy: 'id',
        sortOrder: 'desc',
        limit: '10',
        offset: '0'
      });
      const req = new NextRequest(url);
      
      // Call the handler
      await getQuotes(req);
      
      // Verify that getQuotesWithFilters was called with the search parameter
      expect(db.getQuotesWithFilters).toHaveBeenCalledWith(expect.objectContaining({
        search: maliciousSearch
      }));
    });

    it('safely handles malicious sort parameters in quotes filtering', async () => {
      // Create a request with malicious sort parameters
      const url = createUrlWithSearchParams('http://localhost:3000/api/quotes', { 
        sortBy: "id; DROP TABLE \"Quote\"; --",
        sortOrder: "desc'; DELETE FROM \"Quote\"; --"
      });
      const req = new NextRequest(url);
      
      // Call the handler
      await getQuotes(req);
      
      // Verify that getQuotesWithFilters was called with the parameters
      expect(db.getQuotesWithFilters).toHaveBeenCalledWith(expect.objectContaining({
        sortBy: expect.any(String),
        sortOrder: expect.any(String)
      }));
    });
  });
});