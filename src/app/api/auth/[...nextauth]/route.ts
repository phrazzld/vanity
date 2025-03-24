/**
 * Auth route handler
 * 
 * This file handles authentication routes for the admin section.
 */

import { NextRequest, NextResponse } from "next/server";
import auth from "@/auth";
import { validateFormToken, CSRF_TOKEN_COOKIE } from "@/app/utils/csrf";
import cookieSecurity, { getSecureCookieName, getSecureCookieOptions } from "@/app/utils/cookie-security";

/**
 * Handlers for authentication routes
 */

// Handle GET requests to auth endpoints
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const authAction = pathSegments[pathSegments.length - 1];
  
  switch (authAction) {
    case 'signin':
      return NextResponse.redirect(new URL('/admin/login', request.url));
    case 'signout': {
      // Clear the authentication cookies when signing out
      const response = NextResponse.redirect(new URL('/', request.url));
      
      // Delete cookies with the correct name based on environment and with proper path attribute
      const cookieName = getSecureCookieName(cookieSecurity.AUTH_COOKIE_NAME);
      const userCookieName = getSecureCookieName(cookieSecurity.USER_COOKIE_NAME);
      
      response.cookies.delete(cookieName, { path: '/admin' });
      response.cookies.delete(userCookieName, { path: '/admin' });
      
      return response;
    }
    case 'session': {
      // Check if user is authenticated from cookie using the correct name based on environment
      const cookieName = getSecureCookieName(cookieSecurity.AUTH_COOKIE_NAME);
      const userCookieName = getSecureCookieName(cookieSecurity.USER_COOKIE_NAME);
      
      const isAuthenticated = request.cookies.has(cookieName);
      const userStr = request.cookies.get(userCookieName)?.value;
      let user = null;
      
      if (isAuthenticated && userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Failed to parse user cookie:', e);
        }
      }
      
      return NextResponse.json({ 
        user,
        isAuthenticated,
        expires: new Date(Date.now() + 1000 * cookieSecurity.COOKIE_MAX_AGE).toISOString() // Matching cookie expiration
      });
    }
    default:
      return new Response(`Auth endpoint: ${authAction}`, { status: 200 });
  }
}

// Handle POST requests for login actions
export async function POST(request: NextRequest) {
  try {
    console.log('POST request to auth endpoint received');
    
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const callbackUrl = formData.get('callbackUrl') as string || '/admin';
    
    // Validate CSRF token
    const csrfToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
    
    if (!csrfToken) {
      console.error('CSRF validation failed: No token found in cookies');
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent('CSRF token missing')}`, request.url)
      );
    }
    
    // Validate the token from the form against the cookie
    const isValidCsrf = validateFormToken(formData, csrfToken);
    
    if (!isValidCsrf) {
      console.error('CSRF validation failed: Invalid token');
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent('Invalid security token')}`, request.url)
      );
    }
    
    console.log(`Login attempt: username=${username}, callbackUrl=${callbackUrl}`);
    console.log(`Current environment: ${process.env.NODE_ENV}`);
    
    // Use our auth utility to validate credentials
    const result = await auth.validateCredentials(username, password);
    
    if (result.success) {
      console.log('Credentials validated successfully, setting cookies...');
      
      // Build the callback URL
      const redirectUrl = new URL(callbackUrl, request.url);
      console.log(`Redirecting to: ${redirectUrl.toString()}`);
      
      // Set authentication cookie and redirect to callback URL
      const response = NextResponse.redirect(redirectUrl);
      
      // Set a cookie to track authentication status with enhanced security
      response.cookies.set({
        name: getSecureCookieName(cookieSecurity.AUTH_COOKIE_NAME),
        value: 'true',
        ...getSecureCookieOptions()
      });
      
      // Store user info in a cookie for display purposes
      if (result.user) {
        console.log('Setting user cookie...');
        response.cookies.set({
          name: getSecureCookieName(cookieSecurity.USER_COOKIE_NAME),
          value: JSON.stringify({
            name: result.user.name,
            email: result.user.email,
            role: result.user.role
          }),
          ...getSecureCookieOptions()
        });
      }
      
      console.log('Returning redirect response...');
      return response;
    }
    
    console.log('Authentication failed, redirecting to login page with error');
    // Redirect to login with error on failure
    const errorMessage = result.message || 'CredentialsSignin';
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  } catch (error) {
    console.error('Login error:', error);
    // Provide more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error details: ${errorMessage}`);
    
    return NextResponse.redirect(
      new URL(`/admin/login?error=InternalError&message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}