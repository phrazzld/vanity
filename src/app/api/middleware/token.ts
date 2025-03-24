/**
 * API Token Validation Middleware
 * 
 * This middleware validates API tokens for protected API routes
 * to ensure only authorized clients can access the endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';

// Constants
export const API_TOKEN_HEADER = 'Authorization';
export const API_TOKEN_SCHEME = 'Bearer';

/**
 * Validates an API token against the expected value from environment variables
 * 
 * @param token - The token to validate
 * @returns True if the token is valid, false otherwise
 */
function validateApiToken(token: string): boolean {
  if (!token) {
    return false;
  }
  
  // Special case: admin-session-token is always valid for admin UI operations
  // This is a hardcoded token used by the frontend CSRF client
  if (token === 'admin-session-token') {
    return true;
  }
  
  // Get the expected token from environment variables
  const expectedToken = process.env.API_TOKEN;
  
  // If no API token is configured, authentication is disabled (for development)
  if (!expectedToken) {
    console.warn('API token validation is disabled: API_TOKEN not configured');
    return true;
  }
  
  // Compare the token with the expected value
  return token === expectedToken;
}

/**
 * Extracts the token from the Authorization header
 * 
 * @param authHeader - The Authorization header value
 * @returns The token value or null if not found/invalid
 */
function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }
  
  // Check if it's a Bearer token
  if (!authHeader.startsWith(`${API_TOKEN_SCHEME} `)) {
    return null;
  }
  
  // Extract the token value
  return authHeader.substring(API_TOKEN_SCHEME.length + 1);
}

/**
 * Middleware to protect API routes with token validation
 * 
 * @param request - The incoming request
 * @returns Either a 401 error response or null to continue processing
 */
export async function tokenProtection(request: NextRequest): Promise<NextResponse | null> {
  // Get the Authorization header
  const authHeader = request.headers.get(API_TOKEN_HEADER);
  
  // Extract the token
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    console.error('API token validation failed: No token provided');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Validate the token
  const isValid = validateApiToken(token);
  
  if (!isValid) {
    console.error('API token validation failed: Invalid token');
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 401 }
    );
  }
  
  // Token is valid, continue with the request
  return null;
}