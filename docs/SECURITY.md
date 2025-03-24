# Vanity Security Architecture

## Overview

This document provides a comprehensive overview of the security architecture in the Vanity application. It serves as the central reference for all security-related aspects of the system and provides links to implementation details where relevant.

## Table of Contents

1. [Security Principles](#security-principles)
2. [Authentication and Authorization](#authentication-and-authorization)
   - [Admin Authentication](#admin-authentication)
   - [API Token Authentication](#api-token-authentication)
   - [Password Security](#password-security)
3. [Data Protection](#data-protection)
   - [CSRF Protection](#csrf-protection)
   - [SQL Injection Prevention](#sql-injection-prevention)
   - [Input Validation](#input-validation)
4. [Error Handling and Logging](#error-handling-and-logging)
5. [Cookie Security](#cookie-security)
6. [Security Configuration](#security-configuration)
7. [Security Testing](#security-testing)
8. [Security Best Practices](#security-best-practices)

## Security Principles

The Vanity application's security architecture is built on these key principles:

1. **Defense in Depth**: Multiple layers of security controls to protect against various threats
2. **Least Privilege**: Components only have permissions necessary to function
3. **Secure by Default**: Security features enabled by default
4. **Fail Securely**: System defaults to a secure state when errors occur
5. **Environment-Aware Security**: Controls adapt based on the runtime environment

## Authentication and Authorization

### Admin Authentication

The application uses cookie-based authentication for admin users with the following features:

- HTTP-only cookies to prevent JavaScript access
- Secure cookie attributes in production environments
- Session-based authentication with configurable timeouts
- CSRF protection for all authenticated requests

**Admin Login Process:**

1. Admin credentials are validated against environment variables
2. Session cookie is created with secure attributes
3. CSRF token is generated for subsequent requests

### API Token Authentication

For server-to-server authentication, the application uses API token validation:

- Bearer token authentication scheme
- Environment variable-based token storage
- Middleware approach for consistent application
- Development mode bypass for easier local development

**Token Generation:**

Generate a secure token with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For implementation details, see the token validation middleware in the codebase.

### Password Security

The application uses bcrypt for secure password hashing, providing:

- Protection against database breaches
- Defense against rainbow table attacks
- Configurable work factor for future security adjustments

**Setting Up a Hashed Password:**

1. Generate a secure hash:
   ```bash
   node scripts/generate-hash.js your_secure_password
   ```

2. Add the generated hash to your .env file:
   ```
   ADMIN_PASSWORD="$2b$10$your_hash_will_look_like_this"
   ```

## Data Protection

### CSRF Protection

Cross-Site Request Forgery protection uses the double-submit cookie pattern:

- Secure random token generation
- Token validation on all state-changing operations
- Client-side implementation with automatic token inclusion

**Key Implementation Features:**

- CSRF tokens are stored as HTTP-only cookies
- Tokens are validated for all POST, PUT, and DELETE operations
- Client-side utility simplifies token inclusion in requests

**Developer Usage:**

For API requests, include the CSRF token in the X-CSRF-Token header:
```javascript
fetch('/api/resource', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

### SQL Injection Prevention

SQL injection protection is implemented through:

- Prisma ORM for automatic parameter sanitization
- Parameterized queries for raw SQL operations
- Input validation before database operations

**Best Practices:**

1. Use Prisma's query builder methods instead of raw SQL when possible
2. If raw SQL is necessary, always use parameterized queries
3. Validate all user inputs before using them in queries

**Example of Secure Database Access:**

```typescript
// SAFE: Using Prisma's query builder
const reading = await prisma.reading.findUnique({
  where: { slug },
  select: { id: true, title: true, author: true }
});
```

### Input Validation

All user inputs are validated to prevent security vulnerabilities and data corruption:

- Field-specific validation rules
- Standardized error responses
- Different validation for creation vs. update operations

**Input Validation Process:**

1. Define validation schema for each resource type
2. Validate incoming data against the schema
3. Return standardized validation errors when validation fails

## Error Handling and Logging

The application implements a centralized error handling approach that:

- Provides consistent error responses across all API endpoints
- Enhances security by masking sensitive details in production
- Streamlines debugging with detailed information in development
- Standardizes error categorization for easier client-side handling

**Error Types and Status Codes:**

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input, missing required fields, etc. |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid authentication credentials |
| `AUTHORIZATION_ERROR` | 403 | Valid authentication but insufficient permissions |
| `NOT_FOUND_ERROR` | 404 | Requested resource does not exist |
| `DATABASE_ERROR` | 500 | Database-related issues (masked in production) |
| `SERVER_ERROR` | 500 | General server-side errors |
| `EXTERNAL_SERVICE_ERROR` | 503 | Issues with external services/APIs |
| `UNKNOWN_ERROR` | 500 | Unclassified errors |

## Cookie Security

Authentication cookies are configured with secure attributes:

- **httpOnly**: Prevents JavaScript access to cookies
- **secure**: (in production) Ensures cookies are only sent over HTTPS
- **sameSite**: Restricts cross-origin cookie usage
- **path**: Limits cookie access to specific paths
- **maxAge**: Sets appropriate cookie lifetimes

## Security Configuration

Security-related environment variables:

```
# Authentication
ADMIN_PASSWORD="$2b$10$..." # Bcrypt hash, not plaintext
API_TOKEN="..." # For API authentication

# Security Configuration
NODE_ENV="production" # Affects security behavior
NEXTAUTH_URL="https://yourdomain.com" # For secure cookie settings
NEXTAUTH_SECRET="..." # For session encryption

# Database
DATABASE_URL="..." # Connection string (keep private)
```

## Security Testing

The application includes comprehensive security tests:

1. **Unit Tests**: Verify security utility functions work correctly
2. **Integration Tests**: Verify security middleware correctly validates inputs
3. **API Tests**: Verify API routes are protected by security middleware
4. **Client Tests**: Verify client-side code correctly implements security features

## Security Best Practices

When working on the Vanity application, follow these security best practices:

1. **Never** store sensitive information in the codebase or client-side code
2. **Always** use the centralized error handling utility for API responses
3. **Always** validate all user inputs before processing
4. **Always** use HTTPS in production environments
5. **Always** use the CSRF protection for state-changing operations
6. **Never** disable security features in production
7. **Always** follow the principle of least privilege
8. **Regularly** update dependencies to address security vulnerabilities
9. **Always** use parameterized queries for database operations
10. **Never** log sensitive information