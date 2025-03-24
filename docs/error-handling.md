# Error Handling in Vanity

## Overview

This document describes the centralized error handling approach used in the Vanity application, which is designed to:

1. Provide consistent error responses across all API endpoints
2. Enhance security by masking sensitive details in production
3. Streamline debugging with detailed information in development
4. Standardize error categorization for easier client-side handling

## Error Response Format

All API errors follow a standardized format:

```json
{
  "error": "ERROR_TYPE",
  "message": "Human-readable error message",
  "validationErrors": {
    "field1": "Field-specific error message",
    "field2": "Another field-specific error message"
  }
}
```

- **error**: A string constant identifying the error type (e.g., `VALIDATION_ERROR`, `AUTHENTICATION_ERROR`)
- **message**: A human-readable message explaining what went wrong
- **validationErrors**: (Optional) Field-specific validation errors for forms and API inputs
- **details**: (Development only) Additional technical details about the error
- **stack**: (Development only) Stack trace for debugging

## Error Types and Status Codes

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

## Environment-Specific Behavior

### Production Environment

- Generic, user-friendly error messages
- Sensitive technical details are omitted
- Database errors are masked for security
- Stack traces are not included in responses

### Development Environment

- Detailed error messages with full technical information
- Complete stack traces for debugging
- Original error messages preserved
- Comprehensive logging to the console

## Usage Examples

### Basic Error Handling in API Routes

```typescript
import { createErrorResponse, ErrorType } from '@/app/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    // API logic here...
  } catch (error) {
    return createErrorResponse(
      error,
      ErrorType.SERVER,
      'Could not retrieve data at this time'
    );
  }
}
```

### Validation Error Handling

```typescript
import { createValidationErrorResponse } from '@/app/utils/error-handler';

// For field-specific validation errors
const validationErrors = {
  title: 'Title is required',
  author: 'Author cannot be empty'
};

return createValidationErrorResponse(
  'Validation failed',
  validationErrors
);
```

### Custom Error Response with Headers

```typescript
import { createErrorResponse, ErrorType } from '@/app/utils/error-handler';

return createErrorResponse(
  error,
  ErrorType.NOT_FOUND,
  'Resource not found',
  {
    'Cache-Control': 'no-store',
    'X-Error-Reference': errorId
  }
);
```

## Logging

Error logging is integrated with the error handling utility:

1. All errors are automatically logged when creating error responses
2. Log format includes error context and environment-appropriate detail level
3. In development, full stack traces are logged for debugging
4. In production, sensitive details are omitted from logs

## Client-Side Handling

Client-side code can check the `error` field to determine the error type and handle it appropriately:

```javascript
fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    // Handle success...
  })
  .catch(error => {
    if (error.error === 'VALIDATION_ERROR') {
      // Handle validation errors specifically
      displayFieldErrors(error.validationErrors);
    } else if (error.error === 'AUTHENTICATION_ERROR') {
      // Redirect to login page
      redirectToLogin();
    } else {
      // Generic error handling
      showErrorMessage(error.message);
    }
  });
```

## Best Practices

1. Always use the centralized error handling utility for API responses
2. Categorize errors accurately with appropriate error types
3. Provide user-friendly public messages for production
4. Add context when logging errors to aid debugging
5. Avoid exposing sensitive information in error messages
6. Use field-specific validation errors for form inputs