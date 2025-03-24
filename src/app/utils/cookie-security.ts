/**
 * Cookie Security Utilities
 * 
 * Helper functions for working with secure cookies consistently throughout the application.
 */

// Constants for cookie names
export const AUTH_COOKIE_NAME = 'admin_authenticated';
export const USER_COOKIE_NAME = 'admin_user';

// Cookie expiration time in seconds
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

// Helper to get the correct cookie name with prefix in production
export function getSecureCookieName(baseName: string): string {
  return process.env.NODE_ENV === 'production' ? `__Secure-${baseName}` : baseName;
}

// Standard secure cookie options for authentication cookies
export function getSecureCookieOptions(path = '/admin') {
  return {
    path,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };
}

// Export a default object with all utilities
const cookieSecurity = {
  AUTH_COOKIE_NAME,
  USER_COOKIE_NAME,
  COOKIE_MAX_AGE,
  getSecureCookieName,
  getSecureCookieOptions
};

export default cookieSecurity;