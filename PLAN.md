# Security Audit for Vanity Next.js Application

This security audit reconsiders vulnerabilities in the context of a single-user admin panel used only by the site owner. The priorities have been adjusted accordingly.

## Critical Vulnerabilities

### 1. SQL Injection Vulnerabilities

**Location:** `/src/lib/db/readings.ts` (lines 21-26, 48-62, 162-171), `/src/lib/db/quotes.ts`

**Description:**  
The application uses raw SQL queries with direct parameter interpolation, creating SQL injection vulnerabilities. Even in a single-user context, this remains critical as malicious content could trigger SQL injection when viewed in the admin panel.

**Technical Details:**
- User inputs are directly interpolated into SQL queries using template literals
- Examples: 
  - `WHERE slug = ${slug}` in `getReading` (line 24)
  - `WHERE id = ${id}` in quotes.ts for `getQuote`
- No proper SQL escaping or parameterization

**Remediation:**
1. Use Prisma's query builder instead of raw queries:
```typescript
const reading = await prisma.reading.findUnique({
  where: { slug: slug }
});
```

2. When raw queries are necessary, use parameterized queries:
```typescript
const reading = await prisma.$queryRawUnsafe(
  'SELECT * FROM "Reading" WHERE slug = $1 LIMIT 1',
  slug
);
```

## High Vulnerabilities

### 2. Basic Password Security

**Location:** `/src/auth.ts` (lines 17-58)

**Description:**  
Even for a single-user system, storing and comparing passwords in plaintext creates unnecessary risk. This is particularly important if you reuse this password elsewhere.

**Technical Details:**
- Admin credentials stored as environment variables without hashing
- Direct string comparison for password validation
- While less critical for a personal project, this still represents poor security practice

**Remediation:**
1. Implement basic password hashing (simplified for single-user context):
```typescript
import * as bcrypt from 'bcrypt';

// Store hashed password in env variable 
// When validating:
const match = await bcrypt.compare(password, adminPasswordHash);
if (username === adminUsername && match) {
  // Authentication successful
}
```

### 3. Missing CSRF Protection

**Location:** `/src/app/admin/login/page.tsx` and API routes

**Description:**  
CSRF protection remains important even for a single user. If you browse other sites while logged into your admin panel, a malicious site could trigger unwanted actions.

**Technical Details:**
- No CSRF tokens in forms
- API endpoints have no CSRF validation
- This could allow attacks that leverage your authenticated session

**Remediation:**
1. Implement a simple CSRF token system:
```typescript
// Generate a token during login and store in cookie
// Add the token to forms:
<input type="hidden" name="csrf_token" value={csrfToken} />

// Validate in API routes:
if (request.cookies.get('csrf_token')?.value !== formData.get('csrf_token')) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
}
```

## Medium Vulnerabilities

### 4. Insecure Cookie Configuration

**Location:** `/src/app/api/auth/[...nextauth]/route.ts` (lines 82-91, 96-109)

**Description:**  
While less critical for a personal admin panel, improving cookie security is still beneficial to protect your session.

**Technical Details:**
- The `secure` attribute is conditionally set
- The `sameSite` attribute is set to `'lax'` 
- The `path` attribute is set to `/`, exposing cookies to all routes

**Remediation:**
1. Simple improvements to cookie configuration:
```typescript
response.cookies.set({
  name: 'admin_authenticated',
  value: 'true',
  path: '/admin', // More specific path
  maxAge: 60 * 60 * 24,
  httpOnly: true,
  secure: true, // Always use HTTPS in production
  sameSite: 'strict'
});
```

### 5. Input Validation

**Location:** `/src/app/api/readings/route.ts` (validateReadingInput function)

**Description:**  
Even in a single-user context, input validation prevents errors and unexpected behavior.

**Technical Details:**
- Limited validation of input types and formats
- Potential for errors or data corruption from malformed inputs

**Remediation:**
1. Implement basic validation (simplified for personal use):
```typescript
function validateReadingInput(data: any) {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'Invalid data format' };
  }
  
  if (data.title && typeof data.title !== 'string') {
    return { valid: false, message: 'Title must be a string' };
  }
  
  // Basic validation for other fields...
  
  return { valid: true };
}
```

## Low Vulnerabilities

### 6. Simple API Authorization

**Location:** `/src/app/api/readings/route.ts` (lines 227-233, 304-310, 386-392)

**Description:**  
For a personal project, the current Bearer token approach could be made slightly more robust without overcomplicating the system.

**Technical Details:**
- Authentication checks only verify token format
- No actual token value validation

**Remediation:**
1. Implement a simple token validation (appropriate for personal use):
```typescript
// Use a consistent token value from environment
const validToken = process.env.API_TOKEN;

// In API routes
const authToken = request.headers.get('Authorization')?.split(' ')[1];
if (authToken !== validToken) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 7. Error Handling Improvements

**Location:** Throughout the codebase

**Description:**  
For a personal project, some basic improvements to error handling will make debugging easier without overcomplicating the system.

**Technical Details:**
- Inconsistent error handling
- Some errors expose implementation details

**Remediation:**
1. Implement a simple error handler:
```typescript
function handleApiError(error: unknown, isAdmin = true) {
  console.error('Error:', error);
  
  return NextResponse.json(
    { 
      error: 'An error occurred', 
      // Show details only in development or to admin
      details: (process.env.NODE_ENV !== 'production' || isAdmin) 
        ? String(error) 
        : undefined 
    },
    { status: 500 }
  );
}
```

## Implementation Priorities

For a single-user admin panel, here are the adjusted priorities:

1. Fix SQL injection vulnerabilities - these remain the most critical issue
2. Implement basic password hashing - important for security hygiene
3. Add simple CSRF protection - protects against cross-site attacks
4. Improve input validation - prevents errors and unexpected behavior
5. Enhance cookie security - better protection for your admin session

## Recommended Packages (Simplified)

For a personal project, we can simplify the package recommendations:

1. **bcrypt** - For basic password hashing
   ```
   npm install bcrypt
   npm install @types/bcrypt --save-dev
   ```

2. A simpler alternative to full NextAuth (for personal projects):
   ```typescript
   // Custom auth middleware that checks for admin cookie
   // and redirects to login if not present
   ```

This approach balances security with simplicity for a personal admin panel without overengineering the solution.