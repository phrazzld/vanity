/**
 * Integration Tests for CSRF Middleware
 * 
 * These tests verify the CSRF middleware correctly validates tokens
 * for various HTTP methods and request scenarios.
 */

import { csrfProtection } from '../csrf';
import { CSRF_TOKEN_COOKIE, CSRF_TOKEN_HEADER } from '@/app/utils/csrf';

// Avoid importing NextRequest directly to prevent errors
// instead, create our own mock implementation
class MockRequest {
  method: string;
  headers: Map<string, string>;
  cookies: { get: (name: string) => { value: string } | undefined };

  constructor({ method = 'GET', csrfCookie = null, csrfHeader = null } = {}) {
    this.method = method;
    this.headers = new Map();
    
    if (csrfHeader) {
      this.headers.set(CSRF_TOKEN_HEADER, csrfHeader);
    }
    
    this.cookies = {
      get: jest.fn((name) => {
        if (name === CSRF_TOKEN_COOKIE && csrfCookie) {
          return { value: csrfCookie };
        }
        return undefined;
      })
    };
  }
}

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
  };
});

describe('CSRF Middleware Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Safe HTTP methods', () => {
    it('should allow GET requests without CSRF token', async () => {
      const req = new MockRequest({ method: 'GET' });
      const result = await csrfProtection(req as any);
      
      expect(result).toBeNull();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it('should allow HEAD requests without CSRF token', async () => {
      const req = new MockRequest({ method: 'HEAD' });
      const result = await csrfProtection(req as any);
      
      expect(result).toBeNull();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it('should allow OPTIONS requests without CSRF token', async () => {
      const req = new MockRequest({ method: 'OPTIONS' });
      const result = await csrfProtection(req as any);
      
      expect(result).toBeNull();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('Unsafe HTTP methods', () => {
    it('should block POST requests without CSRF cookie', async () => {
      const req = new MockRequest({ 
        method: 'POST',
        csrfCookie: null
      });
      
      await csrfProtection(req as any);
      
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    });

    it('should block POST requests with missing CSRF header', async () => {
      const req = new MockRequest({ 
        method: 'POST',
        csrfCookie: 'valid-token',
        csrfHeader: null
      });
      
      await csrfProtection(req as any);
      
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    });

    it('should block PUT requests with mismatched tokens', async () => {
      const req = new MockRequest({ 
        method: 'PUT',
        csrfCookie: 'valid-token',
        csrfHeader: 'different-token'
      });
      
      await csrfProtection(req as any);
      
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    });

    it('should allow POST requests with matching CSRF tokens', async () => {
      const req = new MockRequest({ 
        method: 'POST',
        csrfCookie: 'valid-token',
        csrfHeader: 'valid-token'
      });
      
      const result = await csrfProtection(req as any);
      
      expect(result).toBeNull();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it('should allow PUT requests with matching CSRF tokens', async () => {
      const req = new MockRequest({ 
        method: 'PUT',
        csrfCookie: 'valid-token',
        csrfHeader: 'valid-token'
      });
      
      const result = await csrfProtection(req as any);
      
      expect(result).toBeNull();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it('should allow DELETE requests with matching CSRF tokens', async () => {
      const req = new MockRequest({ 
        method: 'DELETE',
        csrfCookie: 'valid-token',
        csrfHeader: 'valid-token'
      });
      
      const result = await csrfProtection(req as any);
      
      expect(result).toBeNull();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });
});