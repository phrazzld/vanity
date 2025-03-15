/**
 * Auth route handler
 * 
 * This file handles authentication routes for the admin section.
 */

import { NextRequest, NextResponse } from "next/server";
import auth from "@/auth";

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
      // Clear the authentication cookie when signing out
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('admin_authenticated');
      response.cookies.delete('admin_user');
      return response;
    }
    case 'session': {
      // Check if user is authenticated from cookie
      const isAuthenticated = request.cookies.has('admin_authenticated');
      const userStr = request.cookies.get('admin_user')?.value;
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
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() 
      });
    }
    default:
      return new Response(`Auth endpoint: ${authAction}`, { status: 200 });
  }
}

// Handle POST requests for login actions
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const callbackUrl = formData.get('callbackUrl') as string || '/admin';
    
    // Use our auth utility to validate credentials
    const result = auth.validateCredentials(username, password);
    
    if (result.success) {
      // Set authentication cookie and redirect to callback URL
      const response = NextResponse.redirect(new URL(callbackUrl, request.url));
      
      // Set a cookie to track authentication status - in a real app, you'd use a secure httpOnly cookie
      // with proper session management. This is just for demo purposes.
      response.cookies.set({
        name: 'admin_authenticated',
        value: 'true',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Store user info in a cookie for display purposes
      if (result.user) {
        response.cookies.set({
          name: 'admin_user',
          value: JSON.stringify({
            name: result.user.name,
            email: result.user.email,
            role: result.user.role
          }),
          path: '/',
          maxAge: 60 * 60 * 24, // 24 hours
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
      
      return response;
    }
    
    // Redirect to login with error on failure
    return NextResponse.redirect(
      new URL('/admin/login?error=CredentialsSignin', request.url)
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(
      new URL('/admin/login?error=InternalError', request.url)
    );
  }
}