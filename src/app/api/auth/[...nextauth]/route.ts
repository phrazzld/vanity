/**
 * Auth route handler
 *
 * This file handles authentication routes for the admin section.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import auth from '@/auth';
import { logger, createLogContext, CorrelationContext } from '@/lib/logger';
import { nanoid } from 'nanoid';

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

      // Define user shape
      interface AdminUser {
        name: string;
        email: string;
        role: string;
      }

      let user: AdminUser | null = null;

      if (isAuthenticated && userStr) {
        try {
          // Parse with type safety
          const parsedUser = JSON.parse(userStr) as AdminUser;
          user = parsedUser;
        } catch (e) {
          logger.warn(
            'Failed to parse user session cookie',
            createLogContext('api/auth', 'GET', {
              error_type: e instanceof Error ? e.constructor.name : 'Unknown',
            })
          );
        }
      }

      return NextResponse.json({
        user,
        isAuthenticated,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      });
    }
    default:
      return new Response(`Auth endpoint: ${authAction}`, { status: 200 });
  }
}

// Handle POST requests for login actions
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const correlationId = request.headers.get('x-correlation-id') || nanoid();
  CorrelationContext.set(correlationId);

  logger.http(
    'Authentication POST request received',
    createLogContext('api/auth', 'POST', {
      url: request.url,
      method: 'POST',
      user_agent: request.headers.get('user-agent'),
      correlation_id: correlationId,
    })
  );

  try {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const callbackUrl = (formData.get('callbackUrl') as string) || '/admin';

    logger.info(
      'Authentication attempt',
      createLogContext('api/auth', 'POST', {
        username: username ? '[PROVIDED]' : '[MISSING]', // Never log actual username
        callback_url: callbackUrl,
        environment:
          typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : 'unknown',
      })
    );

    // Use our auth utility to validate credentials
    const result = auth.validateCredentials(username, password);

    if (result.success) {
      logger.info(
        'Authentication successful',
        createLogContext('api/auth', 'POST', {
          success: true,
          callback_url: callbackUrl,
        })
      );

      // Build the callback URL
      const redirectUrl = new URL(callbackUrl, request.url);
      logger.debug(
        'Setting redirect URL',
        createLogContext('api/auth', 'POST', { redirect_url: redirectUrl.toString() })
      );

      // Set authentication cookie and redirect to callback URL
      const response = NextResponse.redirect(redirectUrl);

      // Set a cookie to track authentication status
      response.cookies.set({
        name: 'admin_authenticated',
        value: 'true',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        // In Vercel preview deployments, we should allow non-secure cookies

        secure:
          typeof process !== 'undefined' &&
          process.env.NODE_ENV === 'production' &&
          !(typeof process !== 'undefined' && process.env.VERCEL_ENV?.includes('preview')),
        sameSite: 'lax',
      });

      // Store user info in a cookie for display purposes
      if (result.user) {
        logger.debug(
          'Setting user session cookie',
          createLogContext('api/auth', 'POST', { user_role: result.user.role })
        );
        response.cookies.set({
          name: 'admin_user',
          value: JSON.stringify({
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          }),
          path: '/',
          maxAge: 60 * 60 * 24, // 24 hours
          httpOnly: true,
          // In Vercel preview deployments, we should allow non-secure cookies

          secure:
            typeof process !== 'undefined' &&
            process.env.NODE_ENV === 'production' &&
            !(typeof process !== 'undefined' && process.env.VERCEL_ENV?.includes('preview')),
          sameSite: 'lax',
        });
      }

      logger.http(
        'Authentication successful - redirecting',
        createLogContext('api/auth', 'POST', {
          response_status: 302,
          duration: Date.now() - startTime,
          redirect_url: redirectUrl.toString(),
        })
      );
      return response;
    }

    logger.warn(
      'Authentication failed',
      createLogContext('api/auth', 'POST', {
        success: false,
        username_provided: !!username,
        callback_url: callbackUrl,
      })
    );
    // Redirect to login with error on failure
    const errorMessage = result.message || 'CredentialsSignin';
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  } catch (error) {
    logger.error(
      'Authentication error occurred',
      createLogContext('api/auth', 'POST', {
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        request_url: request.url,
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.redirect(
      new URL(
        `/admin/login?error=InternalError&message=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    );
  } finally {
    CorrelationContext.clear();
  }
}
