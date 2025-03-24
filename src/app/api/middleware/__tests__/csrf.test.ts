/**
 * Tests for CSRF middleware
 */

import { CSRF_TOKEN_COOKIE, CSRF_TOKEN_HEADER } from '@/app/utils/csrf';
import { csrfProtection } from '../csrf';

// Mock NextResponse
const mockJson = jest.fn();
const NextResponse = {
  json: mockJson
};

// Mock the next/server module
jest.mock('next/server', () => ({
  NextResponse: {
    json: (...args: any[]) => mockJson(...args)
  }
}));

// Mock console.error to avoid noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('CSRF Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should allow GET requests without CSRF token', async () => {
    const mockRequest = {
      method: 'GET',
      cookies: {
        get: jest.fn()
      },
      headers: {
        get: jest.fn()
      }
    };
    
    const result = await csrfProtection(mockRequest as any);
    
    // Should return null for GET requests
    expect(result).toBeNull();
    expect(mockJson).not.toHaveBeenCalled();
  });
  
  it('should block POST requests without CSRF token', async () => {
    const mockRequest = {
      method: 'POST',
      cookies: {
        get: jest.fn().mockReturnValue(undefined)
      },
      headers: {
        get: jest.fn()
      }
    };
    
    await csrfProtection(mockRequest as any);
    
    // Should return 403 error
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'CSRF token missing' },
      { status: 403 }
    );
  });
  
  it('should block requests with invalid CSRF token in header', async () => {
    const mockRequest = {
      method: 'POST',
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      },
      headers: {
        get: jest.fn().mockImplementation((name) => {
          if (name === CSRF_TOKEN_HEADER) {
            return 'invalid-token';
          }
          return null;
        })
      }
    };
    
    await csrfProtection(mockRequest as any);
    
    // Should return 403 error
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  });
  
  it('should allow requests with valid CSRF token in header', async () => {
    const mockRequest = {
      method: 'POST',
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      },
      headers: {
        get: jest.fn().mockImplementation((name) => {
          if (name === CSRF_TOKEN_HEADER) {
            return 'valid-token';
          }
          return null;
        })
      }
    };
    
    const result = await csrfProtection(mockRequest as any);
    
    // Should return null to continue processing
    expect(result).toBeNull();
    expect(mockJson).not.toHaveBeenCalled();
  });
});