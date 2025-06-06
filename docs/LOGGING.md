# Structured Logging Guide

## Overview

This document describes the structured logging approach used in the Vanity project. Our logging strategy prioritizes structured, contextual, and actionable logs that enable effective debugging, monitoring, and observability in both development and production environments.

## Why Structured Logging?

Structured logging provides several key benefits over traditional string-based logging:

1. **Machine Parseable**: JSON format enables efficient parsing and analysis by log aggregation systems
2. **Contextual**: Rich metadata provides complete context for each log entry
3. **Searchable**: Structured fields allow for precise filtering and querying
4. **Consistent**: Standardized format ensures reliable log analysis across the entire system
5. **Correlatable**: Request tracking enables tracing requests through the entire system

## Mandatory Log Fields

Every log entry **MUST** include these standard fields:

```typescript
{
  "timestamp": "2025-05-29T10:30:45.123Z",     // ISO 8601 UTC timestamp
  "level": "info",                              // Log level (debug, http, info, warn, error)
  "message": "User authentication successful",  // Clear, descriptive message
  "service_name": "vanity",                    // Service identifier
  "correlation_id": "abc123def456",            // Request/trace ID for correlation
  "function_name": "authenticateUser",         // Optional: function where log originated
  "module_name": "auth/middleware"             // Optional: module where log originated
}
```

## Log Levels and Usage

### DEBUG (Level 0)

**Purpose**: Detailed diagnostic information for development and troubleshooting
**Production**: Disabled by default
**Use for**:

- Variable values and state changes
- Control flow tracing
- Detailed function entry/exit

```typescript
logger.debug('Processing user request', {
  function_name: 'processRequest',
  user_id: '12345',
  request_data: { action: 'update_profile' },
});
```

### HTTP (Level 1)

**Purpose**: HTTP request/response logging
**Production**: Enabled
**Use for**:

- Request start/completion
- API calls and responses
- External service interactions

```typescript
logger.http('POST /api/users completed', {
  method: 'POST',
  url: '/api/users',
  durationMs: 245,
  status: 201,
});
```

### INFO (Level 2)

**Purpose**: Routine operational events and significant state transitions
**Production**: Default level
**Use for**:

- Application startup/shutdown
- Process completion
- Business logic milestones
- Configuration changes

```typescript
logger.info('User profile updated successfully', {
  function_name: 'updateProfile',
  user_id: '12345',
  fields_updated: ['name', 'email'],
});
```

### WARN (Level 3)

**Purpose**: Potentially harmful situations that were handled gracefully
**Production**: Always enabled
**Use for**:

- Recoverable errors
- Resource limits approached
- Deprecated API usage
- Fallback mechanisms triggered

```typescript
logger.warn('Database connection retry attempted', {
  function_name: 'connectToDatabase',
  attempt: 2,
  max_attempts: 3,
  error_reason: 'connection_timeout',
});
```

### ERROR (Level 4)

**Purpose**: Serious errors causing operation failure
**Production**: Always enabled
**Use for**:

- Unhandled exceptions
- Failed external dependencies
- Data corruption
- Critical system failures

```typescript
logger.error(
  'Failed to save user data',
  {
    function_name: 'saveUser',
    user_id: '12345',
  },
  new Error('Database constraint violation')
);
```

## Error Logging Requirements

For ERROR level logs, additional error details are automatically included:

```typescript
{
  "timestamp": "2025-05-29T10:30:45.123Z",
  "level": "error",
  "message": "Failed to save user data",
  "service_name": "vanity",
  "correlation_id": "abc123def456",
  "function_name": "saveUser",
  "user_id": "12345",
  "error_details": {
    "type": "ValidationError",
    "message": "Database constraint violation",
    "stack": "ValidationError: Database constraint violation\\n    at saveUser (/app/src/users.ts:42:15)..."
  }
}
```

## Correlation ID and Request Tracking

Every request is assigned a unique correlation ID that follows the request through all system components:

1. **Generation**: Automatically generated for new requests or extracted from `x-correlation-id` header
2. **Propagation**: Included in all log entries for that request context
3. **Response**: Returned in response headers for client tracking

```typescript
import { CorrelationContext } from '@/lib/logger';

// Set correlation ID for a request context
CorrelationContext.set('request-123');

// All subsequent logs will include this correlation ID
logger.info('Processing request'); // correlation_id: "request-123"
```

## Usage Examples

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Simple info log
logger.info('Application started');

// Log with metadata
logger.info('User login successful', {
  function_name: 'authenticateUser',
  user_id: '12345',
  login_method: 'email',
});

// Error logging with exception
try {
  await processPayment(paymentData);
} catch (error) {
  logger.error(
    'Payment processing failed',
    {
      function_name: 'processPayment',
      payment_id: paymentData.id,
      amount: paymentData.amount,
    },
    error
  );
}
```

### Component-Specific Logging

For components that need consistent metadata, use the component logger:

```typescript
import { createComponentLogger } from '@/middleware/logging';

const log = createComponentLogger('UserService');

log.info('User created successfully', {
  user_id: '12345',
  email: 'user@example.com',
});
// Automatically includes: component: "UserService"
```

### HTTP Request Logging

```typescript
// Log incoming request
logger.http('GET /api/users', {
  method: 'GET',
  url: '/api/users',
  query: { page: 1, limit: 10 },
  userAgent: 'Mozilla/5.0...',
});

// Log request completion
logger.http('GET /api/users completed', {
  method: 'GET',
  url: '/api/users',
  status: 200,
  durationMs: 156,
});
```

## What NOT to Log

**NEVER log sensitive information:**

- ❌ Passwords, API keys, tokens, secrets
- ❌ Full credit card numbers
- ❌ Personal Identifiable Information (PII) unless required and masked
- ❌ Verbose internal data structures (use DEBUG level only)
- ❌ Raw request bodies containing sensitive data

**Safe logging examples:**

```typescript
// ❌ BAD
logger.info('User login', {
  email: 'user@example.com',
  password: 'secret123', // Never log passwords!
});

// ✅ GOOD
logger.info('User login successful', {
  user_id: '12345',
  login_method: 'email',
});

// ✅ GOOD - Masked sensitive data
logger.info('Payment processed', {
  card_last_four: '1234', // Only last 4 digits
  amount: 99.99,
  currency: 'USD',
});
```

## Configuration

### Environment Variables

- `LOG_LEVEL`: Minimum log level (debug, http, info, warn, error)
- `SERVICE_NAME`: Service identifier for logs (default: "vanity")
- `NODE_ENV`: Environment mode affects output format

### Development vs Production

**Development**: Human-readable console output

```
2025-05-29T10:30:45.123Z [INFO]: User login successful
```

**Production**: Structured JSON output

```json
{
  "timestamp": "2025-05-29T10:30:45.123Z",
  "level": "info",
  "message": "User login successful",
  "service_name": "vanity",
  "correlation_id": "abc123"
}
```

## Log Analysis and Monitoring

### Querying Logs

With structured logging, you can efficiently filter and analyze logs:

```bash
# Find all errors for a specific user
jq 'select(.level == "error" and .user_id == "12345")' logs.json

# Find all requests taking longer than 1 second
jq 'select(.durationMs > 1000)' logs.json

# Trace a specific request by correlation ID
jq 'select(.correlation_id == "abc123def456")' logs.json
```

### Key Metrics to Monitor

1. **Error Rate**: Count of ERROR level logs per time period
2. **Response Times**: Distribution of `durationMs` values
3. **Request Volume**: Count of HTTP level logs
4. **Error Patterns**: Common error types and frequencies

## Best Practices

1. **Be Descriptive**: Use clear, actionable messages
2. **Include Context**: Add relevant metadata for debugging
3. **Use Appropriate Levels**: Follow the level guidelines strictly
4. **Avoid Spam**: Don't log in tight loops without sampling
5. **Log Errors Once**: Don't re-log the same error at multiple levels
6. **Include Business Context**: Add relevant IDs (user_id, order_id, etc.)
7. **Use Correlation IDs**: Always maintain request context

## Testing Logging

When writing tests that verify logging behavior:

```typescript
import { logger } from '@/lib/logger';

// Mock console methods to capture log output
const consoleSpy = jest.spyOn(console, 'log');

// Test your function
myFunction();

// Verify logging occurred
expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Expected log message'));
```

## Migration from Console Logging

If migrating from `console.log` statements:

```typescript
// ❌ OLD
console.log('User created:', userId);

// ✅ NEW
logger.info('User created successfully', {
  function_name: 'createUser',
  user_id: userId,
});
```

## Integration with Monitoring Systems

Our structured logs are designed to integrate with:

- **Log Aggregation**: ELK Stack, Splunk, Datadog
- **APM Tools**: New Relic, AppDynamics
- **Cloud Platforms**: AWS CloudWatch, Google Cloud Logging, Azure Monitor

The consistent JSON format ensures compatibility with most modern logging and monitoring solutions.
