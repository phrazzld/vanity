import { GET, POST, PUT, DELETE } from '../quotes/route';
import * as db from '@/lib/db';
import type { Quote, QuoteInput } from '@/types';
import { NextRequest } from 'next/server';

// Mock the db module
jest.mock('@/lib/db', () => ({
  getQuotes: jest.fn(),
  getQuote: jest.fn(),
  createQuote: jest.fn(),
  updateQuote: jest.fn(),
  deleteQuote: jest.fn(),
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
      const actualUrl = url || 'http://localhost:3000/api/quotes';
      return {
        url: actualUrl,
        headers: new Map(),
        json: jest.fn(),
        nextUrl: new URL(actualUrl),
      };
    }),
  };
});

describe('/api/quotes endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns quotes successfully', async () => {
      // Mock data
      const mockQuotes: Quote[] = [
        { id: 1, text: 'Quote 1', author: 'Author 1' },
        { id: 2, text: 'Quote 2', author: 'Author 2' },
      ];
      
      // Mock database function response
      (db.getQuotes as jest.Mock).mockResolvedValueOnce(mockQuotes);
      
      // Create request
      const req = new NextRequest('http://localhost:3000/api/quotes');
      
      // Call the handler
      const response = await GET(req);
      
      // Check the response
      expect(response.status).toBe(200);
      
      // Verify correct data was returned
      const data = await response.json();
      expect(data).toEqual(mockQuotes);
      
      // Verify database function was called
      expect(db.getQuotes).toHaveBeenCalledTimes(1);
      expect(db.getQuote).not.toHaveBeenCalled();
    });

    it('returns a single quote by ID', async () => {
      // Mock data
      const mockQuote: Quote = {
        id: 1,
        text: 'Test Quote',
        author: 'Test Author',
      };

      // Mock database function response
      (db.getQuote as jest.Mock).mockResolvedValueOnce(mockQuote);

      // Create request with ID param
      const req = new NextRequest('http://localhost:3000/api/quotes?id=1');

      // Call the handler
      const response = await GET(req);

      // Check the response
      expect(response.status).toBe(200);

      // Verify correct data was returned
      const data = await response.json();
      expect(data).toEqual(mockQuote);

      // Verify database function was called correctly
      expect(db.getQuote).toHaveBeenCalledTimes(1);
      expect(db.getQuote).toHaveBeenCalledWith(1);
      expect(db.getQuotes).not.toHaveBeenCalled();
    });

    it('handles database errors', async () => {
      // Mock database error
      (db.getQuotes as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      
      // Create request
      const req = new NextRequest('http://localhost:3000/api/quotes');
      
      // Call the handler
      const response = await GET(req);
      
      // Check error response
      expect(response.status).toBe(500);
      
      // Verify error message
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST', () => {
    it('creates a quote successfully with valid authentication', async () => {
      // Mock quote input and created quote
      const mockInput: QuoteInput = {
        text: 'New Quote',
        author: 'New Author'
      };

      const mockCreatedQuote: Quote = {
        id: 3,
        text: 'New Quote',
        author: 'New Author'
      };

      // Mock database function and request json
      (db.createQuote as jest.Mock).mockResolvedValueOnce(mockCreatedQuote);

      // Create request with auth header and mock body
      const req = new NextRequest('http://localhost:3000/api/quotes');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(mockInput);

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(201);

      // Verify correct data was returned
      const data = await response.json();
      expect(data).toEqual(mockCreatedQuote);

      // Verify database function was called with correct data
      expect(db.createQuote).toHaveBeenCalledTimes(1);
      expect(db.createQuote).toHaveBeenCalledWith(mockInput);
    });

    it('returns 401 without authentication', async () => {
      // Create request without auth header
      const req = new NextRequest('http://localhost:3000/api/quotes');

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(401);

      // Verify error message
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Authentication required');

      // Verify database function was not called
      expect(db.createQuote).not.toHaveBeenCalled();
    });
  });
});