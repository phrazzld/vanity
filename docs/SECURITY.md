# Security Overview

This document provides a comprehensive overview of the security features implemented in the Vanity application, serving as the central reference for all security-related aspects of the system.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Authentication and Access Control](#authentication-and-access-control)
   - [Password Security](#password-security)
   - [API Token Validation](#api-token-validation)
3. [Data Protection](#data-protection)
   - [SQL Injection Prevention](#sql-injection-prevention)
   - [CSRF Protection](#csrf-protection)
   - [Input Validation](#input-validation)
4. [Error Handling and Logging](#error-handling-and-logging)
5. [Cookie Security](#cookie-security)
6. [Security Testing](#security-testing)
7. [Environment Configuration](#environment-configuration)
8. [Security Best Practices](#security-best-practices)
9. [Detailed Documentation](#detailed-documentation)

## Security Architecture

The Vanity application's security architecture is designed around several key principles:

1. **Defense in Depth**: Multiple layers of security controls are implemented to protect against various threats.
2. **Least Privilege**: Components are given only the permissions necessary to function.
3. **Secure by Default**: Security features are enabled by default and require explicit configuration to disable.
4. **Fail Securely**: When errors occur, the system defaults to a secure state.
5. **Environment-Aware Security**: Security controls adapt based on the runtime environment (development vs. production).

## Authentication and Access Control

### Password Security

The application uses bcrypt for secure password hashing, providing:

- Protection against database breaches
- Defense against rainbow table attacks
- Configurable work factor to adjust security as hardware improves

**Setting Up a Hashed Password:**

1. Generate a secure hash:
   ```bash
   node scripts/generate-hash.js your_secure_password
   ```

2. Add the generated hash to your .env file:
   ```
   ADMIN_PASSWORD="$2b$10$your_hash_will_look_like_this"
   ```

For more details, see [Password Hashing Documentation](./password-hashing.md).

### API Token Validation

API routes are protected using an API token validation middleware that implements:

- Bearer token authentication
- Environment-aware validation
- Secure error handling

**Token Generation:**

Generate a secure token with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For more details, see [API Token Validation Documentation](./api-token-validation.md).

## Data Protection

### SQL Injection Prevention

All database operations in the application are protected against SQL injection attacks through:

- Parameterized queries via Prisma's query builder
- Elimination of raw SQL where possible
- Proper parameter sanitization

For more details, see [SQL Injection Prevention Documentation](./sql-injection-prevention.md).

### CSRF Protection

The application implements Cross-Site Request Forgery protection using the double-submit cookie pattern:

- Secure random token generation
- Token validation on all state-changing operations
- Client-side implementation with automatic token inclusion

For more details, see [CSRF Protection Documentation](./csrf-protection.md).

### Input Validation

All user inputs are validated before processing to prevent injection attacks and data corruption:

- Field-specific validation rules
- Standardized error responses
- Different validation for creation vs. update operations

For more details, see [Input Validation Documentation](./input-validation.md).

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

For more details, see [Error Handling Documentation](./error-handling.md).

## Cookie Security

Authentication cookies are configured with secure attributes:

- **httpOnly**: Prevents JavaScript access to cookies
- **secure**: (in production) Ensures cookies are only sent over HTTPS
- **sameSite**: Restricts cross-origin cookie usage
- **path**: Limits cookie access to specific paths
- **maxAge**: Sets appropriate cookie lifetimes

## Security Testing

The application includes comprehensive security tests:

1. **Unit Tests**: Verify security utility functions work correctly
2. **Integration Tests**: Verify security middleware correctly validates inputs
3. **API Tests**: Verify API routes are protected by security middleware
4. **Client Tests**: Verify client-side code correctly implements security features

## Environment Configuration

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

## Detailed Documentation

For more detailed information about specific security features, refer to these documents:

- [Password Hashing](./password-hashing.md)
- [API Token Validation](./api-token-validation.md)
- [SQL Injection Prevention](./sql-injection-prevention.md)
- [CSRF Protection](./csrf-protection.md)
- [Input Validation](./input-validation.md)
- [Error Handling](./error-handling.md)