# CSRF Protection Usage Examples

This document shows how to use the CSRF protection utilities in different parts of the application.

## Server Component Example

```tsx
// Page component (server component)
import { getFormToken, CSRF_TOKEN_FIELD } from '@/app/utils/csrf';
import { cookies } from 'next/headers';

export default function LoginPage() {
  // Generate a CSRF token
  const csrfToken = getFormToken();
  
  // Store the token in a cookie (only when rendering page)
  cookies().set('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 // 1 hour in seconds
  });
  
  return (
    <div>
      <h1>Login</h1>
      <form action="/api/auth/signin" method="post">
        <input type="hidden" name={CSRF_TOKEN_FIELD} value={csrfToken} />
        
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        
        <button type="submit">Log in</button>
      </form>
    </div>
  );
}
```

## Using the CSRFForm Component

```tsx
// Page component (server component)
import CSRFFormWrapper from '@/app/components/CSRFFormWrapper';

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <CSRFFormWrapper action="/api/auth/signin" method="post">
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        
        <button type="submit">Log in</button>
      </CSRFFormWrapper>
    </div>
  );
}
```

## API Route Handler Example

```tsx
// Route handler
import { NextRequest, NextResponse } from 'next/server';
import { validateFormToken, CSRF_TOKEN_COOKIE } from '@/app/utils/csrf';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    
    // Get the CSRF token from cookies
    const csrfToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
    
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }
    
    // Validate the CSRF token
    const isValid = validateFormToken(formData, csrfToken);
    
    if (!isValid) {
      // Invalid CSRF token
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }
    
    // Continue with form processing...
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    // Authentication logic...
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Server Action Example (with Next.js App Router)

```tsx
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateFormToken, CSRF_TOKEN_COOKIE, CSRF_TOKEN_FIELD } from '@/app/utils/csrf';

export async function loginAction(formData: FormData) {
  // Get the CSRF token from cookies
  const storedToken = cookies().get(CSRF_TOKEN_COOKIE)?.value;
  
  if (!storedToken) {
    return { error: 'CSRF token missing' };
  }
  
  // Validate the CSRF token
  const isValid = validateFormToken(formData, storedToken);
  
  if (!isValid) {
    return { error: 'Invalid CSRF token' };
  }
  
  // Continue with form processing...
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  // Authentication logic...
  
  // Redirect after successful login
  redirect('/dashboard');
}

// In a client component:
// <CSRFForm action={loginAction}>...</CSRFForm>
```

## AJAX/Fetch Example with CSRF Header

```tsx
'use client';

import { useState } from 'react';
import { CSRF_TOKEN_FIELD, CSRF_TOKEN_HEADER } from '@/app/utils/csrf';

export default function AjaxForm({ csrfToken }: { csrfToken: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          // Include CSRF token in headers
          [CSRF_TOKEN_HEADER]: csrfToken
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }
      
      const data = await response.json();
      console.log('Success:', data);
      
      // Handle success...
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Hidden CSRF token field */}
      <input type="hidden" name={CSRF_TOKEN_FIELD} value={csrfToken} />
      
      {/* Form fields... */}
      
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Security Considerations

1. Always validate CSRF tokens on the server for any state-changing operations
2. Use HTTPS in production to prevent token theft
3. Set proper cookie security attributes (httpOnly, secure, sameSite)
4. Use short-lived tokens to limit the attack window
5. Tokens should be unique per user session
6. Tokens should be cryptographically secure random values