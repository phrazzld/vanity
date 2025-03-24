/**
 * NextAuth.js Middleware
 * 
 * This middleware protects admin routes by checking for valid NextAuth sessions.
 * It redirects unauthenticated users to the login page.
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// The withAuth function replaces our custom middleware with NextAuth's middleware
// It automatically checks for valid sessions for protected routes
export default withAuth(
  // Augment the basic withAuth function with custom logic
  function middleware(request: NextRequest) {
    console.log(`Middleware running for: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback runs before the middleware logic
      // You can customize authentication rules here
      authorized({ token }) {
        // Only allow authenticated users with valid tokens
        return !!token;
      },
    },
    // Protected pages redirect to login page if unauthorized
    pages: {
      signIn: "/admin/login",
    },
  }
);

// Configure which routes the middleware should run on
export const config = {
  // Only run on admin routes, excluding the login page and auth API endpoints
  matcher: [
    "/admin/:path*",
    // Exclude login page and auth API endpoints from middleware checks
    "/((?!admin/login|api/auth).*)",
  ],
};