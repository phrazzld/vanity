/**
 * CSRF Middleware for API Routes
 * 
 * This middleware validates CSRF tokens for API routes that modify data
 * to prevent cross-site request forgery attacks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CSRF_TOKEN_COOKIE, CSRF_TOKEN_HEADER } from '@/app/utils/csrf';

/**
 * Validates the CSRF token in a request.
 * The token can be provided either in the X-CSRF-Token header or in the request body.
 * 
 * @param request - The incoming request
 * @param expectedToken - The expected CSRF token from cookies
 * @returns True if the token is valid, false otherwise
 */
function validateCsrfToken(request: NextRequest, expectedToken: string): boolean {
  if (!expectedToken) {
    return false;
  }
  
  // Try to get the token from the header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER);
  
  if (headerToken && headerToken === expectedToken) {
    return true;
  }
  
  // If no valid token in header, return false
  return false;
}

/**
 * Middleware to protect API routes from CSRF attacks
 * 
 * @param request - The incoming request
 * @returns Either a 403 error response or null to continue processing
 */
export async function csrfProtection(request: NextRequest): Promise<NextResponse | null> {
  // Only apply CSRF protection to state-changing methods
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null;
  }
  
  // Get the CSRF token from cookies
  const csrfToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
  
  if (!csrfToken) {
    console.error('CSRF validation failed: No token found in cookies');
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    );
  }
  
  // Validate the token
  const isValid = validateCsrfToken(request, csrfToken);
  
  if (!isValid) {
    console.error('CSRF validation failed: Invalid token');
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  // Token is valid, continue with the request
  return null;
}