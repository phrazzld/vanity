/**
 * Tests for API token validation middleware
 */
import { tokenProtection, API_TOKEN_HEADER, API_TOKEN_SCHEME } from '../token';
import { NextRequest, NextResponse } from 'next/server';

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  return {
    __esModule: true,
    NextRequest: jest.fn().mockImplementation((url) => {
      const actualUrl = url || 'http://localhost:3000/api/test';
      return {
        url: actualUrl,
        method: 'POST',
        headers: new Map(),
        clone: function() { return this; }
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

describe('API token validation middleware', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset environment
    process.env = { ...originalEnv };
    
    // Set API token in environment
    process.env.API_TOKEN = 'test-api-token';
  });
  
  afterEach(() => {
    // Restore environment variables
    process.env = originalEnv;
  });
  
  it('should pass validation with a valid token', async () => {
    // Create a request with valid token
    const req = new NextRequest('http://localhost:3000/api/test');
    req.headers.set(API_TOKEN_HEADER, `${API_TOKEN_SCHEME} test-api-token`);
    
    // Test the middleware
    const result = await tokenProtection(req);
    
    // Should return null (meaning validation passed)
    expect(result).toBeNull();
  });
  
  it('should reject requests without a token', async () => {
    // Create a request without a token
    const req = new NextRequest('http://localhost:3000/api/test');
    
    // Test the middleware
    const result = await tokenProtection(req);
    
    // Should return a 401 response
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
    
    // Should have an error message
    const data = await result?.json();
    expect(data).toHaveProperty('error', 'Authentication required');
  });
  
  it('should reject requests with an invalid token format', async () => {
    // Create a request with invalid token format (missing Bearer prefix)
    const req = new NextRequest('http://localhost:3000/api/test');
    req.headers.set(API_TOKEN_HEADER, 'test-api-token');
    
    // Test the middleware
    const result = await tokenProtection(req);
    
    // Should return a 401 response
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
    
    // Should have an error message
    const data = await result?.json();
    expect(data).toHaveProperty('error', 'Authentication required');
  });
  
  it('should reject requests with an incorrect token value', async () => {
    // Create a request with incorrect token
    const req = new NextRequest('http://localhost:3000/api/test');
    req.headers.set(API_TOKEN_HEADER, `${API_TOKEN_SCHEME} wrong-token`);
    
    // Test the middleware
    const result = await tokenProtection(req);
    
    // Should return a 401 response
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
    
    // Should have an error message
    const data = await result?.json();
    expect(data).toHaveProperty('error', 'Invalid authentication token');
  });
  
  it('should pass validation when API_TOKEN is not configured', async () => {
    // Remove API token from environment
    delete process.env.API_TOKEN;
    
    // Create a request with any token
    const req = new NextRequest('http://localhost:3000/api/test');
    req.headers.set(API_TOKEN_HEADER, `${API_TOKEN_SCHEME} any-token-will-work`);
    
    // Should pass validation (for development convenience)
    const result = await tokenProtection(req);
    expect(result).toBeNull();
  });
  
  it('should handle case-sensitive token comparison', async () => {
    // Create a request with case-modified token
    const req = new NextRequest('http://localhost:3000/api/test');
    req.headers.set(API_TOKEN_HEADER, `${API_TOKEN_SCHEME} TEST-api-TOKEN`);
    
    // Test the middleware
    const result = await tokenProtection(req);
    
    // Should return a 401 response (tokens should match exactly)
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
  });
  
  it('should allow requests with the special admin-session-token', async () => {
    // Create a request with the special admin token
    const req = new NextRequest('http://localhost:3000/api/test');
    req.headers.set(API_TOKEN_HEADER, `${API_TOKEN_SCHEME} admin-session-token`);
    
    // Test the middleware
    const result = await tokenProtection(req);
    
    // Should pass validation (admin token should always work)
    expect(result).toBeNull();
  });
});