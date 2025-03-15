import { GET, POST, PUT, DELETE } from '../readings/route';
import * as db from '@/lib/db';
import type { Reading, ReadingInput } from '@/types';
import { NextRequest } from 'next/server';

// Mock the db module
jest.mock('@/lib/db', () => ({
  getReadings: jest.fn(),
  getReading: jest.fn(),
  createReading: jest.fn(),
  updateReading: jest.fn(),
  deleteReading: jest.fn(),
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
      const actualUrl = url || 'http://localhost:3000/api/readings';
      return {
        url: actualUrl,
        headers: new Map(),
        json: jest.fn(),
        nextUrl: new URL(actualUrl),
      };
    }),
  };
});

describe('/api/readings endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns all readings successfully', async () => {
      // Mock data
      const mockReadings: Reading[] = [
        {
          id: 1,
          slug: 'book-1',
          title: 'Book 1',
          author: 'Author 1',
          finishedDate: new Date('2023-01-01'),
          coverImageSrc: 'image1.jpg',
          thoughts: 'Good book',
          dropped: false,
        },
        {
          id: 2,
          slug: 'book-2',
          title: 'Book 2',
          author: 'Author 2',
          finishedDate: null,
          coverImageSrc: null,
          thoughts: '',
          dropped: false,
        },
      ];

      // Mock database function response
      (db.getReadings as jest.Mock).mockResolvedValueOnce(mockReadings);

      // Create request with no query params
      const req = new NextRequest('http://localhost:3000/api/readings');

      // Call the handler
      const response = await GET(req);

      // Check the response
      expect(response.status).toBe(200);

      // Verify correct data was returned
      const data = await response.json();
      expect(data).toEqual(mockReadings);

      // Verify database function was called
      expect(db.getReadings).toHaveBeenCalledTimes(1);
      expect(db.getReading).not.toHaveBeenCalled();
    });

    it('returns a single reading by slug', async () => {
      // Mock data
      const mockReading: Reading = {
        id: 1,
        slug: 'test-book',
        title: 'Test Book',
        author: 'Test Author',
        finishedDate: new Date('2023-01-01'),
        coverImageSrc: 'test.jpg',
        thoughts: 'Test thoughts',
        dropped: false,
      };

      // Mock database function response
      (db.getReading as jest.Mock).mockResolvedValueOnce(mockReading);

      // Create request with slug param
      const req = new NextRequest('http://localhost:3000/api/readings?slug=test-book');

      // Call the handler
      const response = await GET(req);

      // Check the response
      expect(response.status).toBe(200);

      // Verify correct data was returned
      const data = await response.json();
      expect(data).toEqual(mockReading);

      // Verify database function was called correctly
      expect(db.getReading).toHaveBeenCalledTimes(1);
      expect(db.getReading).toHaveBeenCalledWith('test-book');
      expect(db.getReadings).not.toHaveBeenCalled();
    });

    it('returns 404 when reading not found', async () => {
      // Mock database function to return null
      (db.getReading as jest.Mock).mockResolvedValueOnce(null);

      // Create request with slug param
      const req = new NextRequest('http://localhost:3000/api/readings?slug=nonexistent');

      // Call the handler
      const response = await GET(req);

      // Check error response
      expect(response.status).toBe(404);

      // Verify error message
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Reading not found');
    });

    it('handles database errors', async () => {
      // Mock database error
      (db.getReadings as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      // Create request
      const req = new NextRequest('http://localhost:3000/api/readings');

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
    it('creates a reading successfully with valid authentication', async () => {
      // Mock reading input and created reading
      const mockInput: ReadingInput = {
        slug: 'new-book',
        title: 'New Book',
        author: 'New Author',
        finishedDate: null,
        thoughts: 'Initial thoughts',
      };

      const mockCreatedReading: Reading = {
        id: 3,
        slug: 'new-book',
        title: 'New Book',
        author: 'New Author',
        finishedDate: null,
        coverImageSrc: null,
        thoughts: 'Initial thoughts',
        dropped: false,
      };

      // Mock database function and request json
      (db.createReading as jest.Mock).mockResolvedValueOnce(mockCreatedReading);

      // Create request with auth header and mock body
      const req = new NextRequest('http://localhost:3000/api/readings');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(mockInput);

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(201);

      // Verify correct data was returned
      const data = await response.json();
      expect(data).toEqual(mockCreatedReading);

      // Verify database function was called with correct data
      expect(db.createReading).toHaveBeenCalledTimes(1);
      expect(db.createReading).toHaveBeenCalledWith(mockInput);
    });

    it('returns 401 without authentication', async () => {
      // Create request without auth header
      const req = new NextRequest('http://localhost:3000/api/readings');

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(401);

      // Verify error message
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Authentication required');

      // Verify database function was not called
      expect(db.createReading).not.toHaveBeenCalled();
    });

    it('validates input data', async () => {
      // Create invalid input (missing title)
      const invalidInput = {
        slug: 'test-slug',
        // Missing required title
        author: 'Test Author',
      };

      // Mock request with auth header and invalid body
      const req = new NextRequest('http://localhost:3000/api/readings');
      req.headers.set('Authorization', 'Bearer test-token');
      req.json = jest.fn().mockResolvedValueOnce(invalidInput);

      // Call the handler
      const response = await POST(req);

      // Check the response
      expect(response.status).toBe(400);

      // Verify error message
      const data = await response.json();
      expect(data).toHaveProperty('error');

      // Verify database function was not called
      expect(db.createReading).not.toHaveBeenCalled();
    });
  });

  // Tests for PUT and DELETE would follow a similar pattern
  // These are just representative examples to demonstrate the approach
});