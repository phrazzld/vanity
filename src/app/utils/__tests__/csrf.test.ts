/**
 * CSRF Utility Tests
 */

import csrf, { 
  generateToken, 
  getFormToken,
  validateToken,
  validateFormToken,
  CSRF_TOKEN_COOKIE,
  CSRF_TOKEN_HEADER,
  CSRF_TOKEN_FIELD,
  getCsrfCookieOptions 
} from '../csrf';
import crypto from 'crypto';

// Mock crypto.randomBytes
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
  timingSafeEqual: jest.fn()
}));

describe('CSRF Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a secure random token', () => {
      // Mock the crypto.randomBytes implementation
      const mockBuffer = Buffer.from('testbuffer'.repeat(4)); // 32 bytes
      (crypto.randomBytes as jest.Mock).mockReturnValue(mockBuffer);
      
      const token = generateToken();
      
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(token).toBe(mockBuffer.toString('hex'));
    });
  });

  describe('getFormToken', () => {
    it('should generate a new token', () => {
      // Mock the crypto.randomBytes implementation
      const mockBuffer = Buffer.from('formtoken'.repeat(4)); // 32 bytes
      (crypto.randomBytes as jest.Mock).mockReturnValue(mockBuffer);
      
      const token = getFormToken();
      
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(token).toBe(mockBuffer.toString('hex'));
    });
  });

  describe('validateToken', () => {
    it('should return false if provided token is missing', () => {
      const result = validateToken('', 'expectedToken');
      expect(result).toBe(false);
    });

    it('should return false if expected token is missing', () => {
      const result = validateToken('providedToken', '');
      expect(result).toBe(false);
    });

    it('should compare tokens using timingSafeEqual', () => {
      const providedToken = 'providedToken';
      const expectedToken = 'expectedToken';
      
      (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);
      
      const result = validateToken(providedToken, expectedToken);
      
      expect(result).toBe(true);
      expect(crypto.timingSafeEqual).toHaveBeenCalledWith(
        Buffer.from(providedToken),
        Buffer.from(expectedToken)
      );
    });

    it('should handle crypto exceptions gracefully', () => {
      const providedToken = 'providedToken';
      const expectedToken = 'expectedToken';
      
      (crypto.timingSafeEqual as jest.Mock).mockImplementation(() => {
        throw new Error('Mock crypto error');
      });
      
      // Mock console.error to prevent test output noise
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = validateToken(providedToken, expectedToken);
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('validateFormToken', () => {
    it('should validate token from form data', () => {
      const providedToken = 'provided-token';
      const expectedToken = 'expected-token';
      
      const formData = new FormData();
      formData.append(CSRF_TOKEN_FIELD, providedToken);
      
      // Mock the validateToken function result
      (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);
      
      const result = validateFormToken(formData, expectedToken);
      
      expect(result).toBe(true);
    });

    it('should return false if form token is missing', () => {
      const expectedToken = 'expected-token';
      const formData = new FormData();
      // No token set in form data
      
      // Mock console.error to prevent test output noise
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = validateFormToken(formData, expectedToken);
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getCsrfCookieOptions', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    
    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });
    
    it('should return secure cookie in production', () => {
      process.env.NODE_ENV = 'production';
      
      const options = getCsrfCookieOptions();
      
      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe('strict');
      expect(options.path).toBe('/');
      expect(options.maxAge).toBe(60 * 60); // 1 hour
    });
    
    it('should return non-secure cookie in development', () => {
      process.env.NODE_ENV = 'development';
      
      const options = getCsrfCookieOptions();
      
      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(false);
      expect(options.sameSite).toBe('strict');
      expect(options.path).toBe('/');
      expect(options.maxAge).toBe(60 * 60); // 1 hour
    });
  });

  describe('default export', () => {
    it('should export all CSRF utility functions', () => {
      expect(csrf.generateToken).toBe(generateToken);
      expect(csrf.getFormToken).toBe(getFormToken);
      expect(csrf.validateToken).toBe(validateToken);
      expect(csrf.validateFormToken).toBe(validateFormToken);
      expect(csrf.getCsrfCookieOptions).toBe(getCsrfCookieOptions);
      expect(csrf.CSRF_TOKEN_COOKIE).toBe(CSRF_TOKEN_COOKIE);
      expect(csrf.CSRF_TOKEN_HEADER).toBe(CSRF_TOKEN_HEADER);
      expect(csrf.CSRF_TOKEN_FIELD).toBe(CSRF_TOKEN_FIELD);
    });
  });
});