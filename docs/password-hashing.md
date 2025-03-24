# Password Hashing Implementation

## Overview

This document describes the password hashing implementation in the Vanity application, specifically how we securely store and validate admin passwords.

## Implementation Details

The application uses the industry-standard `bcrypt` library for password hashing with the following features:

1. **Salted Hashing**: Each password is automatically salted during the hashing process, which protects against rainbow table attacks.

2. **Configurable Work Factor**: The default salt rounds is set to 10, but can be adjusted for different security/performance needs.

3. **Gradual Migration**: The system supports both hashed and plain-text password comparison for backward compatibility.

4. **Transparent Usage**: The validation logic automatically detects whether a password is hashed (by checking if it starts with '$2b$').

## Password Storage

Admin passwords should be stored in environment variables as bcrypt hashes rather than plain text. The `.env.example` file has been updated to reflect this requirement.

## How to Generate Hashed Passwords

You can generate a hashed password using the following Node.js code:

```javascript
const auth = require('./path/to/auth');

async function generateHashedPassword() {
  const plainTextPassword = 'your-secure-password';
  const hashedPassword = await auth.hashPassword(plainTextPassword);
  console.log('Hashed password for .env file:', hashedPassword);
}

generateHashedPassword();
```

## Authentication Flow

1. The system reads the admin username and password from environment variables
2. When a user attempts to log in, the system first compares the username
3. If the username matches, the system checks if the stored password is hashed
4. For hashed passwords, bcrypt.compare() is used to safely compare the input against the hash
5. For plain text passwords (legacy mode), direct string comparison is used

## Security Considerations

1. **Never Log Passwords**: The system masks usernames in logs and never logs passwords.

2. **Error Messages**: Authentication errors return generic messages to prevent information leakage.

3. **Environment Variables**: Sensitive credentials are stored in environment variables, not in the codebase.

4. **Strong Hashing**: bcrypt is specifically designed for password hashing with built-in work factor adjustments.

## Testing

Comprehensive tests ensure:

1. Both plain text and hashed password validation works correctly
2. Different salt rounds are properly supported
3. Error handling behaves securely
4. Empty and special character passwords are handled properly

## Future Improvements

1. Consider implementing a scheduled password rotation policy
2. Add password complexity requirements
3. Implement account lockout after failed attempts
4. Transition to a more robust authentication system like NextAuth.js