# CSRF Protection

This document explains how Cross-Site Request Forgery (CSRF) protection is implemented in the Vanity application.

## What is CSRF?

Cross-Site Request Forgery (CSRF) is a type of security vulnerability that allows an attacker to induce users to perform actions that they do not intend to perform. It occurs when a malicious website, email, or application causes a user's web browser to perform an unwanted action on a site where the user is authenticated.

For example, if a user is authenticated on a banking website and visits a malicious site, the malicious site could make a request to the banking site's API to transfer money, and the browser would include the user's cookies, making the request appear legitimate.

## How We Protect Against CSRF

The Vanity application implements a robust defense against CSRF attacks using the double-submit cookie pattern:

### 1. Token Generation

- When a user loads the application, a secure random token is generated
- This token is stored both as an HTTP-only cookie and provided to the client-side JavaScript
- The token is cryptographically secure, generated using `crypto.randomBytes(32).toString('hex')`

### 2. Server-Side Validation

- For all state-changing operations (POST, PUT, DELETE), a CSRF middleware validates the token
- The middleware compares the token provided in the request header against the token stored in the cookie
- If the tokens don't match or if either is missing, the request is rejected with a 403 Forbidden status
- GET, HEAD, and OPTIONS requests bypass this check as they don't modify state

### 3. Client-Side Implementation

- Before making state-changing requests, client-side code fetches a CSRF token via `/api/auth/csrf`
- The token is included in the `X-CSRF-Token` header for all state-changing API requests
- Forms include the token as a hidden field named `csrfToken`

## Implementation Details

### API Routes Protection

All state-changing API routes in the application are protected by CSRF middleware:

```typescript
// POST handler example from /api/readings/route.ts
export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfError = await csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }
    
    // Process the request...
  } catch (error) {
    // Error handling...
  }
}
```

### CSRF Middleware

The middleware enforces CSRF token validation:

```typescript
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
```

### Token Generation Endpoint

The application provides an endpoint to generate and retrieve CSRF tokens:

```typescript
// GET handler for /api/auth/csrf/route.ts
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
```

## Best Practices

When developing features that modify state:

1. Always use POST, PUT, or DELETE methods for state-changing operations
2. Always fetch a CSRF token before making state-changing requests
3. Include the CSRF token in the `X-CSRF-Token` header for API requests
4. Include the CSRF token as a hidden field in HTML forms
5. Use the provided utilities to validate tokens (don't create custom validation)
6. When testing API routes, mock the CSRF middleware for unit tests

## Testing CSRF Protection

The application includes comprehensive tests for CSRF protection:

1. **Unit Tests**: Verify CSRF utility functions work correctly
2. **Integration Tests**: Verify the CSRF middleware correctly validates tokens
3. **API Tests**: Verify API routes are protected by CSRF middleware
4. **Client Tests**: Verify client-side code correctly includes CSRF tokens in requests

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security/CSRF)