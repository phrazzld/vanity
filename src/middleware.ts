/**
 * NextAuth.js Middleware
 * 
 * This middleware protects admin routes by checking for authentication.
 * It redirects unauthenticated users to the login page.
 */

import { NextRequest, NextResponse } from "next/server";

// Simple middleware to protect admin routes
export function middleware(request: NextRequest) {
  // Skip the login page - it should be accessible
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check if the path is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // In a real implementation, we would use NextAuth.js to properly check
    // the session. For now, we'll use a simple cookie check for demo purposes.
    const isAuthenticated = request.cookies.has('admin_authenticated');
    
    if (!isAuthenticated) {
      const url = new URL('/admin/login', request.url);
      // Add the original URL as a callback parameter
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
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