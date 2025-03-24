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

// Mock the CSRF middleware
jest.mock('../middleware/csrf', () => ({
  csrfProtection: jest.fn().mockResolvedValue(null),
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
    
    it('validates required fields', async () => {
      // Create invalid input (missing text)
      const invalidInput = {
        author: 'Test Author'
        // Missing required text
      };

      // Mock request with auth header and invalid body
      const req = new NextRequest('http://localhost:3000/api/quotes');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(invalidInput);

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(400);

      // Verify error message
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('validationErrors');
      expect(data.validationErrors).toHaveProperty('text', 'Quote text is required');

      // Verify database function was not called
      expect(db.createQuote).not.toHaveBeenCalled();
    });

    it('validates field formats and lengths', async () => {
      // Create input with multiple validation issues
      const invalidInput = {
        text: 'A'.repeat(1001), // Text too long
        author: { name: 'Not a string' }, // Wrong author type
        unexpectedField: 'This field should not be here' // Unexpected field
      };

      // Mock request with auth header and invalid body
      const req = new NextRequest('http://localhost:3000/api/quotes');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(invalidInput);

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(400);

      // Verify error message and validation errors
      const data = await response.json();
      expect(data).toHaveProperty('error', 'VALIDATION_ERROR');
      expect(data).toHaveProperty('message', 'Validation failed');
      expect(data).toHaveProperty('validationErrors');
      
      // Check specific field errors
      const errors = data.validationErrors;
      expect(errors).toHaveProperty('text', 'Quote text must be less than 1000 characters');
      expect(errors).toHaveProperty('author', 'Author must be a string or null');
      expect(errors).toHaveProperty('_unexpected'); // Should catch unexpected fields

      // Verify database function was not called
      expect(db.createQuote).not.toHaveBeenCalled();
    });
    
    it('detects and blocks potentially unsafe content', async () => {
      // Create input with unsafe HTML/script content
      const unsafeInput = {
        text: 'Normal text <script>alert("XSS")</script> more text',
        author: 'Normal author'
      };

      // Mock request with auth header and unsafe body
      const req = new NextRequest('http://localhost:3000/api/quotes');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(unsafeInput);

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(400);

      // Verify validation errors
      const data = await response.json();
      expect(data).toHaveProperty('validationErrors');
      expect(data.validationErrors).toHaveProperty(
        'text', 'Quote text contains potentially unsafe content'
      );

      // Verify database function was not called
      expect(db.createQuote).not.toHaveBeenCalled();
    });
    
    it('handles empty strings in author field by converting to null', async () => {
      // Create input with empty author string
      const input = {
        text: 'Valid quote text',
        author: ''  // Empty string should be converted to null
      };

      const mockCreatedQuote: Quote = {
        id: 3,
        text: 'Valid quote text',
        author: null // Should be stored as null
      };

      // Mock database function
      (db.createQuote as jest.Mock).mockResolvedValueOnce(mockCreatedQuote);

      // Mock request
      const req = new NextRequest('http://localhost:3000/api/quotes');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(input);

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(201);
      
      // Verify the author was converted to null in the database call
      expect(db.createQuote).toHaveBeenCalledWith(expect.objectContaining({
        text: 'Valid quote text',
        author: null
      }));
    });
    
    it('rejects whitespace-only strings in author field', async () => {
      // Create input with whitespace-only author
      const input = {
        text: 'Valid quote text',
        author: '   '  // Whitespace-only string
      };

      // Mock request
      const req = new NextRequest('http://localhost:3000/api/quotes');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(input);

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(400);
      
      // Verify validation errors
      const data = await response.json();
      expect(data.validationErrors).toHaveProperty(
        'author', 'Author cannot be empty or only whitespace'
      );
      
      // Verify database function was not called
      expect(db.createQuote).not.toHaveBeenCalled();
    });
  });
  
  describe('PUT', () => {
    it('updates a quote successfully with valid authentication', async () => {
      // Mock quote input and updated quote
      const mockInput: Partial<QuoteInput> = {
        text: 'Updated Quote Text'
      };

      const mockUpdatedQuote: Quote = {
        id: 1,
        text: 'Updated Quote Text',
        author: 'Original Author'
      };

      // Mock database function and request json
      (db.updateQuote as jest.Mock).mockResolvedValueOnce(mockUpdatedQuote);

      // Create request with auth header and mock body
      const req = new NextRequest('http://localhost:3000/api/quotes?id=1');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(mockInput);

      // Call the handler
      const response = await PUT(req);

      // Check the response
      expect(response.status).toBe(200);

      // Verify correct data was returned
      const data = await response.json();
      expect(data).toEqual(mockUpdatedQuote);

      // Verify database function was called with correct data
      expect(db.updateQuote).toHaveBeenCalledTimes(1);
      expect(db.updateQuote).toHaveBeenCalledWith(1, mockInput);
    });

    it('validates input data for updates', async () => {
      // Create input with validation issues
      const invalidInput = {
        text: '',  // Empty text
        author: 123  // Wrong type
      };

      // Mock request with auth header and invalid body
      const req = new NextRequest('http://localhost:3000/api/quotes?id=1');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(invalidInput);

      // Call the handler
      const response = await PUT(req);

      // Check the response
      expect(response.status).toBe(400);

      // Verify error message and validation errors
      const data = await response.json();
      expect(data).toHaveProperty('error', 'VALIDATION_ERROR');
      expect(data).toHaveProperty('message', 'Validation failed');
      expect(data).toHaveProperty('validationErrors');
      
      // Check specific field errors
      const errors = data.validationErrors;
      expect(errors).toHaveProperty('text');
      expect(errors).toHaveProperty('author');

      // Verify database function was not called
      expect(db.updateQuote).not.toHaveBeenCalled();
    });
    
    it('validates ID parameter', async () => {
      // Mock request with invalid ID
      const req = new NextRequest('http://localhost:3000/api/quotes?id=invalid');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce({ text: 'Valid text' });

      // Call the handler
      const response = await PUT(req);

      // Check the response
      expect(response.status).toBe(400);

      // Verify error message
      const data = await response.json();
      expect(data).toHaveProperty('error', 'VALIDATION_ERROR');
      expect(data).toHaveProperty('message');

      // Verify database function was not called
      expect(db.updateQuote).not.toHaveBeenCalled();
    });
  });
});