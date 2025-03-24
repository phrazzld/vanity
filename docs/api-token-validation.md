# API Token Validation

## Overview

This document describes the API token validation implementation in the Vanity application, which provides a secure mechanism for authenticating API requests to protected endpoints.

## Implementation Details

The application implements token-based authentication using the industry-standard Bearer token scheme with the following features:

1. **Token Storage**: The API token is stored as an environment variable (`API_TOKEN`), making it easy to manage and rotate.

2. **Middleware Approach**: Token validation is implemented as a middleware function that can be applied to any API route.

3. **Bearer Token Format**: The token must be provided in the Authorization header with the Bearer scheme:
   ```
   Authorization: Bearer <your-api-token>
   ```

4. **Development Mode**: When no API token is configured in the environment, authentication is effectively disabled for easier local development.

## Token Generation

For security, the API token should be a long, random string. You can generate a secure token using the following methods:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Configuration

Add the generated token to your environment variables:

1. Add the token to your `.env.local` file:
   ```
   API_TOKEN="your-secure-api-token"
   ```

2. For production deployments, set the environment variable through your hosting provider's dashboard.

## Securing API Routes

API routes that require authentication use the `tokenProtection` middleware:

```typescript
// Example usage in an API route
import { tokenProtection } from '../middleware/token';

export async function POST(request: NextRequest) {
  try {
    // Validate the API token
    const tokenError = await tokenProtection(request);
    if (tokenError) {
      return tokenError;
    }
    
    // Token is valid, continue with the request...
  } catch (error) {
    // Handle errors...
  }
}
```

## Client Usage

To make authenticated requests to the API, clients need to include the API token in the Authorization header:

```javascript
// Example using fetch
const response = await fetch('/api/quotes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiToken}`
  },
  body: JSON.stringify(data)
});
```

## Security Considerations

1. **Environment Variables**: The API token should only be stored in environment variables, never in the codebase.

2. **HTTPS Only**: Always use HTTPS to prevent token interception during transmission.

3. **Token Rotation**: Implement a process for periodically rotating API tokens.

4. **Secure Storage**: Clients should securely store the API token and never expose it in client-side code.

5. **Error Messages**: Authentication errors return generic messages to prevent information leakage.

## Testing

The API token validation is thoroughly tested with:

1. Unit tests for the token validation middleware
2. Integration tests with API endpoints
3. Tests for both valid and invalid token scenarios
4. Tests for token format validation

## Future Improvements

1. Consider implementing token expiration and rotation
2. Add support for different permission levels/scopes
3. Implement rate limiting for API requests
4. Consider moving to a more sophisticated auth system like OAuth or JWT for larger applications