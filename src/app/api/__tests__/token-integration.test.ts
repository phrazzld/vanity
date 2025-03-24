/**
 * Integration tests for API token validation with API endpoints
 */
import { POST as createQuote } from '../quotes/route';
import { POST as createReading } from '../readings/route';
import { NextRequest } from 'next/server';
import { API_TOKEN_HEADER, API_TOKEN_SCHEME } from '../middleware/token';
import * as db from '@/lib/db';

// Mock the database module
jest.mock('@/lib/db', () => ({
  createQuote: jest.fn(),
  createReading: jest.fn(),
}));

// Mock the CSRF middleware
jest.mock('../middleware/csrf', () => ({
  csrfProtection: jest.fn().mockResolvedValue(null),
}));

// Mock cookies for token validation
jest.mock('next/server', () => {
  return {
    __esModule: true,
    NextRequest: jest.fn().mockImplementation((url) => {
      const actualUrl = url || 'http://localhost:3000/api/test';
      return {
        url: actualUrl,
        method: 'POST',
        headers: new Map(),
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'csrf-token' }),
        },
        json: jest.fn().mockResolvedValue({}),
        clone: function() { return this; },
        nextUrl: new URL(actualUrl),
      };
    }),
    NextResponse: {
      json: jest.fn((data, options) => {
        return {
          status: options?.status || 200,
          headers: new Map(),
          json: async () => data,
        };
      }),
    },
  };
});

// Store the original env variables
const originalEnv = process.env;

describe('API token integration with endpoints', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock database operations for successful responses
    (db.createQuote as jest.Mock).mockResolvedValue({ id: 1, text: 'Test Quote', author: 'Test Author' });
    (db.createReading as jest.Mock).mockResolvedValue({ 
      id: 1, 
      slug: 'test-reading',
      title: 'Test Reading', 
      author: 'Test Author' 
    });
    
    // Reset environment
    process.env = { ...originalEnv };
    
    // Set API token in environment
    process.env.API_TOKEN = 'test-api-token';
  });
  
  afterEach(() => {
    // Restore environment variables
    process.env = originalEnv;
  });
  
  describe('Quotes API', () => {
    it('should create a quote with valid token', async () => {
      // Create a mock quote input
      const quoteInput = { text: 'Test Quote', author: 'Test Author' };
      
      // Create a request with a valid token
      const req = new NextRequest('http://localhost:3000/api/quotes');
      req.headers.set(API_TOKEN_HEADER, `${API_TOKEN_SCHEME} test-api-token`);
      req.json = jest.fn().mockResolvedValue(quoteInput);
      
      // Make the request
      const response = await createQuote(req);
      
      // Should return a successful response
      expect(response.status).toBe(201);
      
      // Should have called the database
      expect(db.createQuote).toHaveBeenCalledWith(quoteInput);
    });
    
    it('should reject requests without a valid token', async () => {
      // Create a request without a token
      const req = new NextRequest('http://localhost:3000/api/quotes');
      req.json = jest.fn().mockResolvedValue({ text: 'Test Quote' });
      
      // Make the request
      const response = await createQuote(req);
      
      // Should return an error response
      expect(response.status).toBe(401);
      
      // Should not have called the database
      expect(db.createQuote).not.toHaveBeenCalled();
    });
  });
  
  describe('Readings API', () => {
    it('should create a reading with valid token', async () => {
      // Create a mock reading input
      const readingInput = { 
        title: 'Test Reading', 
        author: 'Test Author',
        slug: 'test-reading'
      };
      
      // Create a request with a valid token
      const req = new NextRequest('http://localhost:3000/api/readings');
      req.headers.set(API_TOKEN_HEADER, `${API_TOKEN_SCHEME} test-api-token`);
      req.json = jest.fn().mockResolvedValue(readingInput);
      
      // Make the request
      const response = await createReading(req);
      
      // Should return a successful response
      expect(response.status).toBe(201);
      
      // Should have called the database
      expect(db.createReading).toHaveBeenCalledWith(readingInput);
    });
    
    it('should reject requests without a valid token', async () => {
      // Create a request without a token
      const req = new NextRequest('http://localhost:3000/api/readings');
      req.json = jest.fn().mockResolvedValue({ title: 'Test Reading' });
      
      // Make the request
      const response = await createReading(req);
      
      // Should return an error response
      expect(response.status).toBe(401);
      
      // Should not have called the database
      expect(db.createReading).not.toHaveBeenCalled();
    });
  });
});