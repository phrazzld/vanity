/**
 * CSRF Protection Tests for API Routes
 * 
 * These tests verify that state-changing API routes (POST, PUT, DELETE)
 * are properly protected against CSRF attacks.
 */

import { POST as postReadings, PUT as putReadings, DELETE as deleteReadings } from '../readings/route';
import { POST as postQuotes, PUT as putQuotes, DELETE as deleteQuotes } from '../quotes/route';
import { csrfProtection } from '../middleware/csrf';
import { NextRequest } from 'next/server';
import { CSRF_TOKEN_COOKIE, CSRF_TOKEN_HEADER } from '@/app/utils/csrf';

// Mock the database modules
jest.mock('@/lib/db', () => ({
  createReading: jest.fn(),
  updateReading: jest.fn(),
  deleteReading: jest.fn(),
  createQuote: jest.fn(),
  updateQuote: jest.fn(),
  deleteQuote: jest.fn(),
}));

// Mock the CSRF middleware - we'll override this in specific tests
jest.mock('../middleware/csrf', () => ({
  csrfProtection: jest.fn(),
}));

// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => {
  return {
    __esModule: true,
    NextResponse: {
      json: jest.fn((data, options) => {
        mockJson(data, options);
        return {
          status: options?.status || 200,
          headers: new Map(),
          json: async () => data,
        };
      }),
    },
    NextRequest: jest.fn().mockImplementation((url) => {
      const actualUrl = url || 'http://localhost:3000/api';
      return {
        method: 'POST', // Default method
        url: actualUrl,
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        cookies: {
          get: jest.fn(),
        },
        nextUrl: new URL(actualUrl),
      };
    }),
  };
});

describe('CSRF Protection for API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset JSON mock
    mockJson.mockReset();
  });

  describe('Readings API', () => {
    /**
     * Tests for POST /api/readings endpoint
     */
    describe('POST /api/readings', () => {
      it('should block requests with missing CSRF token', async () => {
        // Mock CSRF validation to fail with a 403 response
        const csrfError = {
          status: 403,
          json: async () => ({ error: 'CSRF token missing' }),
        };
        (csrfProtection as jest.Mock).mockResolvedValueOnce(csrfError);

        // Create a request with auth header but no CSRF token
        const req = new NextRequest('http://localhost:3000/api/readings');
        req.headers.set('Authorization', 'Bearer test-token');

        // Call the handler
        const response = await postReadings(req);

        // Verify response is the CSRF error
        expect(response).toEqual(csrfError);
        
        // Verify CSRF middleware was called with the request
        expect(csrfProtection).toHaveBeenCalledWith(req);
      });

      it('should proceed when CSRF token is valid', async () => {
        // Mock CSRF validation to succeed (return null)
        (csrfProtection as jest.Mock).mockResolvedValueOnce(null);

        // Create a request with auth and CSRF token
        const req = new NextRequest('http://localhost:3000/api/readings');
        req.headers.set('Authorization', 'Bearer test-token');
        // The actual token is validated in the middleware, not the route handler
        req.headers.set(CSRF_TOKEN_HEADER, 'valid-csrf-token');
        req.json = jest.fn().mockResolvedValueOnce({
          slug: 'test-book',
          title: 'Test Book',
          author: 'Test Author'
        });

        // Call the handler
        await postReadings(req);

        // Verify CSRF middleware was called
        expect(csrfProtection).toHaveBeenCalledWith(req);
      });
    });

    /**
     * Tests for PUT /api/readings endpoint
     */
    describe('PUT /api/readings', () => {
      it('should block requests with invalid CSRF token', async () => {
        // Mock CSRF validation to fail with a 403 response
        const csrfError = {
          status: 403,
          json: async () => ({ error: 'Invalid CSRF token' }),
        };
        (csrfProtection as jest.Mock).mockResolvedValueOnce(csrfError);

        // Create a request with auth header but invalid CSRF token
        const req = new NextRequest('http://localhost:3000/api/readings?slug=test-book');
        req.headers.set('Authorization', 'Bearer test-token');
        req.headers.set(CSRF_TOKEN_HEADER, 'invalid-token');

        // Call the handler
        const response = await putReadings(req);

        // Verify response is the CSRF error
        expect(response).toEqual(csrfError);
        
        // Verify CSRF middleware was called
        expect(csrfProtection).toHaveBeenCalledWith(req);
      });
    });

    /**
     * Tests for DELETE /api/readings endpoint
     */
    describe('DELETE /api/readings', () => {
      it('should block requests with invalid CSRF token', async () => {
        // Mock CSRF validation to fail with a 403 response
        const csrfError = {
          status: 403,
          json: async () => ({ error: 'Invalid CSRF token' }),
        };
        (csrfProtection as jest.Mock).mockResolvedValueOnce(csrfError);

        // Create a request with auth header but invalid CSRF token
        const req = new NextRequest('http://localhost:3000/api/readings?slug=test-book');
        req.headers.set('Authorization', 'Bearer test-token');
        req.method = 'DELETE';

        // Call the handler
        const response = await deleteReadings(req);

        // Verify response is the CSRF error
        expect(response).toEqual(csrfError);
        
        // Verify CSRF middleware was called
        expect(csrfProtection).toHaveBeenCalledWith(req);
      });
    });
  });

  describe('Quotes API', () => {
    /**
     * Tests for POST /api/quotes endpoint
     */
    describe('POST /api/quotes', () => {
      it('should block requests with missing CSRF token', async () => {
        // Mock CSRF validation to fail with a 403 response
        const csrfError = {
          status: 403,
          json: async () => ({ error: 'CSRF token missing' }),
        };
        (csrfProtection as jest.Mock).mockResolvedValueOnce(csrfError);

        // Create a request with auth header but no CSRF token
        const req = new NextRequest('http://localhost:3000/api/quotes');
        req.headers.set('Authorization', 'Bearer test-token');

        // Call the handler
        const response = await postQuotes(req);

        // Verify response is the CSRF error
        expect(response).toEqual(csrfError);
        
        // Verify CSRF middleware was called
        expect(csrfProtection).toHaveBeenCalledWith(req);
      });
    });

    /**
     * Tests for PUT /api/quotes endpoint
     */
    describe('PUT /api/quotes', () => {
      it('should block requests with invalid CSRF token', async () => {
        // Mock CSRF validation to fail with a 403 response
        const csrfError = {
          status: 403,
          json: async () => ({ error: 'Invalid CSRF token' }),
        };
        (csrfProtection as jest.Mock).mockResolvedValueOnce(csrfError);

        // Create a request with auth header but invalid CSRF token
        const req = new NextRequest('http://localhost:3000/api/quotes?id=1');
        req.headers.set('Authorization', 'Bearer test-token');
        req.headers.set(CSRF_TOKEN_HEADER, 'invalid-token');

        // Call the handler
        const response = await putQuotes(req);

        // Verify response is the CSRF error
        expect(response).toEqual(csrfError);
        
        // Verify CSRF middleware was called
        expect(csrfProtection).toHaveBeenCalledWith(req);
      });
    });

    /**
     * Tests for DELETE /api/quotes endpoint
     */
    describe('DELETE /api/quotes', () => {
      it('should block requests with invalid CSRF token', async () => {
        // Mock CSRF validation to fail with a 403 response
        const csrfError = {
          status: 403,
          json: async () => ({ error: 'Invalid CSRF token' }),
        };
        (csrfProtection as jest.Mock).mockResolvedValueOnce(csrfError);

        // Create a request with auth header but invalid CSRF token
        const req = new NextRequest('http://localhost:3000/api/quotes?id=1');
        req.headers.set('Authorization', 'Bearer test-token');
        req.method = 'DELETE';

        // Call the handler
        const response = await deleteQuotes(req);

        // Verify response is the CSRF error
        expect(response).toEqual(csrfError);
        
        // Verify CSRF middleware was called
        expect(csrfProtection).toHaveBeenCalledWith(req);
      });
    });
  });
});