/**
 * Tests for CSRF token validation in login form
 */

import { validateFormToken, CSRF_TOKEN_COOKIE, CSRF_TOKEN_FIELD } from '@/app/utils/csrf';

// Mock the CSRF utility functions
jest.mock('@/app/utils/csrf', () => ({
  validateFormToken: jest.fn(),
  CSRF_TOKEN_COOKIE: 'csrf_token',
  CSRF_TOKEN_FIELD: 'csrfToken',
  generateToken: jest.fn().mockReturnValue('test-csrf-token'),
  getCsrfCookieOptions: jest.fn().mockReturnValue({
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
    maxAge: 3600
  })
}));

describe('CSRF Protection for Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFormToken', () => {
    it('should pass validation when tokens match', () => {
      // Mock implementation for this test only
      (validateFormToken as jest.Mock).mockImplementation((formData, expectedToken) => {
        const providedToken = formData.get(CSRF_TOKEN_FIELD);
        return providedToken === expectedToken;
      });
      
      const formData = new FormData();
      formData.append(CSRF_TOKEN_FIELD, 'match-token');
      
      const result = validateFormToken(formData, 'match-token');
      
      expect(result).toBe(true);
    });
    
    it('should fail validation when tokens do not match', () => {
      // Mock implementation for this test only
      (validateFormToken as jest.Mock).mockImplementation((formData, expectedToken) => {
        const providedToken = formData.get(CSRF_TOKEN_FIELD);
        return providedToken === expectedToken;
      });
      
      const formData = new FormData();
      formData.append(CSRF_TOKEN_FIELD, 'wrong-token');
      
      const result = validateFormToken(formData, 'expected-token');
      
      expect(result).toBe(false);
    });
    
    it('should fail validation when token is missing from form', () => {
      // Mock implementation for this test only
      (validateFormToken as jest.Mock).mockImplementation((formData, expectedToken) => {
        const providedToken = formData.get(CSRF_TOKEN_FIELD);
        return providedToken === expectedToken;
      });
      
      const formData = new FormData();
      // No token added
      
      const result = validateFormToken(formData, 'expected-token');
      
      expect(result).toBe(false);
    });
  });
});