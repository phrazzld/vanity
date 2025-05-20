/**
 * NextAuth.js Middleware with Structured Logging
 *
 * This middleware:
 * 1. Sets up request logging with correlation IDs for tracking requests
 * 2. Protects admin routes by checking for authentication
 * 3. Redirects unauthenticated users to the login page
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requestLoggingMiddleware } from './middleware/logging';
import { logger } from './lib/logger';

// Main middleware to handle all middleware functions
export function middleware(request: NextRequest) {
  // First apply the request logging middleware
  const response = requestLoggingMiddleware(request);

  // If the logging middleware returned a response (e.g. a redirect), use it
  if (response && !(response instanceof NextResponse.next().constructor)) {
    return response;
  }

  // Skip the login page - it should be accessible
  if (request.nextUrl.pathname === '/admin/login') {
    logger.debug('Allowing access to login page');
    return NextResponse.next();
  }

  // Also skip auth API endpoints to prevent redirect loops
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    logger.debug('Allowing access to auth API endpoints');
    return NextResponse.next();
  }

  // Check if the path is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    logger.info('Admin route access attempt', { path: request.nextUrl.pathname });

    // Use a simple cookie check for demo purposes
    const isAuthenticated = request.cookies.has('admin_authenticated');

    if (!isAuthenticated) {
      logger.warn('Unauthenticated admin access attempt', {
        path: request.nextUrl.pathname,
        // ip address is not directly accessible in NextRequest
        headers: {
          userAgent: request.headers.get('user-agent') || 'unknown',
          forwarded: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      const url = new URL('/admin/login', request.url);
      // Add the original URL as a callback parameter
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    logger.info('Authenticated admin access', {
      path: request.nextUrl.pathname,
    });
  }

  // Allow all other routes
  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Match all paths for logging, but only protect admin paths
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
