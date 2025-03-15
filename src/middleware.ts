/**
 * NextAuth.js Middleware
 * 
 * This middleware protects admin routes by checking for authentication.
 * It redirects unauthenticated users to the login page.
 */

import { NextRequest, NextResponse } from "next/server";

// Simple middleware to protect admin routes
export function middleware(request: NextRequest) {
  console.log(`Middleware running for: ${request.nextUrl.pathname}`);
  
  // Skip the login page - it should be accessible
  if (request.nextUrl.pathname === '/admin/login') {
    console.log('Allowing access to login page');
    return NextResponse.next();
  }

  // Also skip auth API endpoints to prevent redirect loops
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    console.log('Allowing access to auth API endpoints');
    return NextResponse.next();
  }

  // Check if the path is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Admin route detected, checking authentication...');
    
    // Use a simple cookie check for demo purposes
    const isAuthenticated = request.cookies.has('admin_authenticated');
    console.log(`Authentication status: ${isAuthenticated}`);
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login page');
      const url = new URL('/admin/login', request.url);
      // Add the original URL as a callback parameter
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    console.log('Authenticated, allowing access to admin route');
  }
  
  // Allow all other routes
  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Match all routes under /admin
    '/admin/:path*',
  ],
};