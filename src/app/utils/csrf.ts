/**
 * CSRF Protection Utility
 * 
 * This module provides functions to generate, validate and manage CSRF tokens
 * to protect against Cross-Site Request Forgery attacks.
 */

import crypto from 'crypto';

// Constants
export const CSRF_TOKEN_COOKIE = 'csrf_token';
export const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
export const CSRF_TOKEN_FIELD = 'csrfToken';

/**
 * Generate a cryptographically secure random token
 * @returns A secure random string suitable for CSRF protection
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a CSRF token for forms
 * This can be used in server components to get a token for a form
 * 
 * @returns A CSRF token
 */
export function getFormToken(): string {
  return generateToken();
}

/**
 * Validate a CSRF token against a stored token.
 * 
 * @param providedToken - The token to validate
 * @param expectedToken - The expected token to compare against
 * @returns True if the token is valid, false otherwise
 */
export function validateToken(providedToken: string, expectedToken: string): boolean {
  if (!providedToken || !expectedToken) {
    return false;
  }
  
  try {
    // Make sure both values are of the same length for timingSafeEqual
    const providedBuffer = Buffer.from(providedToken);
    const expectedBuffer = Buffer.from(expectedToken);
    
    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  } catch (error) {
    console.error('CSRF token validation error:', error);
    return false;
  }
}

/**
 * Extract and validate a CSRF token from form data.
 * This is a helper function to be used in API route handlers.
 * 
 * @param formData - The form data from the request
 * @param expectedToken - The expected token to compare against
 * @returns True if the token is valid, false otherwise
 */
export function validateFormToken(formData: FormData, expectedToken: string): boolean {
  const providedToken = formData.get(CSRF_TOKEN_FIELD) as string;
  
  if (!providedToken) {
    console.error('CSRF validation failed: No token found in form data');
    return false;
  }
  
  return validateToken(providedToken, expectedToken);
}

/**
 * Create cookie options for CSRF token
 */
export function getCsrfCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 // 1 hour in seconds
  };
}

// Export a default object with all functions for convenient import
const csrf = {
  generateToken,
  getFormToken,
  validateToken,
  validateFormToken,
  getCsrfCookieOptions,
  CSRF_TOKEN_COOKIE,
  CSRF_TOKEN_HEADER,
  CSRF_TOKEN_FIELD
};

export default csrf;