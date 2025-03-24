# Cookie Security Enhancements

This document outlines the security enhancements made to cookies in the application.

## Overview

The application uses two primary cookies for authentication:

1. `admin_authenticated` - Indicates that a user is authenticated
2. `admin_user` - Contains user information for display purposes

## Security Enhancements

The following security enhancements have been implemented:

### 1. Path Restriction

- Cookies are now restricted to the `/admin` path rather than `/`
- This limits cookie exposure to only the admin section of the application

### 2. Secure Attribute

- The `secure` flag is set to `true` in production environments
- This ensures cookies are only sent over HTTPS connections

### 3. HttpOnly Flag

- All cookies are set with the `httpOnly` flag
- This prevents access to cookies via JavaScript, mitigating XSS attacks

### 4. SameSite Policy

- Changed from `lax` to `strict` for stronger protection
- Prevents cookies from being sent in cross-site requests
- Provides additional protection against CSRF attacks

### 5. Cookie Prefixing

- In production, cookies are prefixed with `__Secure-`
- This enforces that these cookies can only be set when the page is served over HTTPS

### 6. Reduced Expiration Time

- Reduced cookie lifetime from 24 hours to 8 hours
- Shorter expiration time limits the window of opportunity for session hijacking

### 7. Centralized Cookie Management

- Created a utility module (`cookie-security.ts`) for consistent cookie handling
- All cookie operations now use centralized utility functions
- Standardized cookie attributes across the application

## Implementation

The cookie security utility provides:

- Constants for cookie names
- A standard expiration time
- A function to get the secure name with proper prefixing
- A function to get secure cookie options with appropriate settings

## Usage

```typescript
import { getSecureCookieName, getSecureCookieOptions } from "@/app/utils/cookie-security";

// Set a cookie with secure attributes
response.cookies.set({
  name: getSecureCookieName('my_cookie'),
  value: 'cookie_value',
  ...getSecureCookieOptions()
});

// For cookies that need a different path
response.cookies.set({
  name: getSecureCookieName('my_cookie'),
  value: 'cookie_value',
  ...getSecureCookieOptions('/different/path')
});
```