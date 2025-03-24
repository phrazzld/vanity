# Security Best Practices

This document outlines the security measures implemented in this application and provides guidance on secure configuration.

## Password Security

### Admin Password Hashing

The application supports bcrypt password hashing for the admin authentication system. This provides significant security benefits over plaintext password storage:

- Protection against database breaches
- Defense against rainbow table attacks
- Configurable work factor to adjust security as hardware improves

#### Setting Up a Hashed Password

1. Use the provided utility script to generate a secure hash:

```bash
# Generate a hash for your secure password
node scripts/generate-hash.js your_secure_password
```

2. Add the generated hash to your .env file:

```
ADMIN_PASSWORD="$2b$10$your_hash_will_look_like_this"
```

#### How it Works

- The authentication system automatically detects if the ADMIN_PASSWORD is a bcrypt hash or plaintext
- If a bcrypt hash is detected (starts with `$2b$`), it uses bcrypt.compare() for secure verification
- If plaintext is detected, it will work for backward compatibility but log a warning

#### Password Hashing API

For programmatic access, you can use the auth utility:

```typescript
import auth from '@/auth';

// Generate a hash with default work factor (10)
const hash = await auth.hashPassword('secure_password');

// Generate a hash with custom work factor
const strongerHash = await auth.hashPassword('secure_password', 12);
```

## SQL Injection Prevention

All database queries use parameterized queries via Prisma's query builder to prevent SQL injection attacks. Raw SQL queries have been eliminated or properly sanitized.

## CSRF Protection

Cross-Site Request Forgery protection is implemented for all forms and API endpoints that modify data.

## Cookie Security

Authentication cookies are configured with secure attributes:
- httpOnly: Prevents JavaScript access to cookies
- secure: (in production) Ensures cookies are only sent over HTTPS
- sameSite: Restricts cross-origin cookie usage

## Input Validation

All user inputs are validated before processing to prevent injection attacks and data corruption.

## API Security

API routes are protected with appropriate authentication and authorization checks.

## Error Handling

Errors are handled safely to prevent information leakage in production.