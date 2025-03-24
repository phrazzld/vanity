/**
 * CSRF Token API Route
 * 
 * This endpoint generates and provides CSRF tokens for form submissions.
 * It sets a cookie with the token and returns the token in the response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateToken, CSRF_TOKEN_COOKIE, getCsrfCookieOptions } from '@/app/utils/csrf';

/**
 * GET handler for CSRF token generation
 * 
 * @param request - The incoming request
 * @returns A response with the CSRF token and sets a cookie
 */
export async function GET(request: NextRequest) {
  // Generate a new CSRF token
  const csrfToken = generateToken();
  
  // Create the response
  const response = NextResponse.json({
    csrfToken
  });
  
  // Set the CSRF token cookie
  const cookieOptions = getCsrfCookieOptions();
  response.cookies.set(CSRF_TOKEN_COOKIE, csrfToken, cookieOptions);
  
  return response;
}