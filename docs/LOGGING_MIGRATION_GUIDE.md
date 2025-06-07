# Logging Migration Guide

## Overview

This guide provides standardized templates and security patterns for migrating from `console.log` to structured logging using our enhanced logger system.

## Core Principles

1. **Structured Logging**: All logs use consistent JSON structure in production
2. **Context Standardization**: Every log includes `module_name` and `function_name`
3. **Correlation Tracking**: Requests are tracked through `correlation_id`
4. **Security First**: Sensitive data is never logged
5. **Environment Awareness**: Human-readable in dev, JSON in production

## Usage Templates

### Template 1: React Hook Logging

**Use Case**: State management hooks, data fetching hooks, custom business logic hooks

**Pattern**:

```typescript
import { logger, createLogContext } from '@/lib/logger';

export const useDataHook = () => {
  const logContext = createLogContext('hooks/useDataHook', 'fetchData');

  const fetchData = async (params: DataParams) => {
    logger.info(
      'Starting data fetch',
      createLogContext('hooks/useDataHook', 'fetchData', {
        params: { ...params, apiKey: '[REDACTED]' }, // Security: redact sensitive fields
        attempt: 1,
      })
    );

    try {
      const result = await apiCall(params);

      logger.info(
        'Data fetch successful',
        createLogContext('hooks/useDataHook', 'fetchData', {
          resultCount: result.length,
          duration: performance.now() - startTime,
        })
      );

      return result;
    } catch (error) {
      logger.error(
        'Data fetch failed',
        createLogContext('hooks/useDataHook', 'fetchData', {
          params: { ...params, apiKey: '[REDACTED]' },
          error_type: error.constructor.name,
        }),
        error
      );

      throw error;
    }
  };

  return { fetchData };
};
```

**Key Points**:

- Use hook name as module_name (e.g., 'hooks/useDataHook')
- Use function name as function_name
- Redact sensitive parameters in logs
- Include performance metrics when relevant
- Log both success and error states
- Pass Error object to logger.error for stack traces

### Template 2: API Route Logging

**Use Case**: Next.js API routes, request handling, authentication endpoints

**Pattern**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger, createLogContext, CorrelationContext } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Set correlation ID for request tracking
  const correlationId = request.headers.get('x-correlation-id') || nanoid();
  CorrelationContext.set(correlationId);

  const logContext = createLogContext('api/example', 'GET');

  logger.http(
    'API request received',
    createLogContext('api/example', 'GET', {
      url: request.url,
      method: 'GET',
      user_agent: request.headers.get('user-agent'),
      correlation_id: correlationId,
    })
  );

  try {
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    };

    logger.info(
      'Processing request with parameters',
      createLogContext('api/example', 'GET', {
        params,
        validation_status: 'passed',
      })
    );

    const data = await fetchData(params);

    logger.http(
      'API request completed successfully',
      createLogContext('api/example', 'GET', {
        response_status: 200,
        result_count: data.length,
        duration: performance.now() - startTime,
      })
    );

    return NextResponse.json(data);
  } catch (error) {
    logger.error(
      'API request failed',
      createLogContext('api/example', 'GET', {
        error_type: error.constructor.name,
        request_url: request.url,
      }),
      error
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    // Clear correlation context after request
    CorrelationContext.clear();
  }
}
```

**Key Points**:

- Set correlation ID from request header or generate new one
- Use 'api/routeName' as module_name
- Use HTTP method as function_name
- Log request start, processing steps, and completion
- Include request metadata (URL, method, user agent)
- Clear correlation context after request
- Use logger.http for HTTP-specific logs
- Include performance metrics

### Template 3: React Component Logging

**Use Case**: UI components with complex logic, error boundaries, data fetching components

**Pattern**:

```typescript
import React, { useEffect, useState } from 'react';
import { logger, createLogContext } from '@/lib/logger';

interface DataComponentProps {
  userId: string;
  onError?: (error: Error) => void;
}

export const DataComponent: React.FC<DataComponentProps> = ({
  userId,
  onError
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const logContext = createLogContext('components/DataComponent', 'loadData');

  const loadData = async () => {
    setLoading(true);

    logger.info('Component data load initiated', createLogContext(
      'components/DataComponent',
      'loadData',
      {
        user_id: userId, // OK to log user ID if not PII
        component_state: 'loading'
      }
    ));

    try {
      const result = await fetchUserData(userId);

      setData(result);
      setLoading(false);

      logger.info('Component data load successful', createLogContext(
        'components/DataComponent',
        'loadData',
        {
          user_id: userId,
          result_count: result.length,
          component_state: 'loaded'
        }
      ));

    } catch (error) {
      setLoading(false);

      logger.error('Component data load failed', createLogContext(
        'components/DataComponent',
        'loadData',
        {
          user_id: userId,
          component_state: 'error',
          error_type: error.constructor.name
        }
      ), error);

      onError?.(error);
    }
  };

  const handleUserAction = (actionType: string, metadata?: Record<string, unknown>) => {
    logger.info('User interaction logged', createLogContext(
      'components/DataComponent',
      'handleUserAction',
      {
        user_id: userId,
        action_type: actionType,
        ...metadata
      }
    ));
  };

  useEffect(() => {
    logger.debug('Component mounted', createLogContext(
      'components/DataComponent',
      'useEffect',
      { user_id: userId }
    ));

    loadData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Component JSX */}
      <button onClick={() => handleUserAction('refresh', { trigger: 'manual' })}>
        Refresh Data
      </button>
    </div>
  );
};
```

**Key Points**:

- Use 'components/ComponentName' as module_name
- Use specific function names (loadData, handleUserAction, useEffect)
- Log component lifecycle events
- Log user interactions with context
- Include component state in metadata
- Avoid logging sensitive user data
- Use logger.debug for development-only information

## Security Patterns - What NOT to Log

### ❌ Never Log These

1. **Authentication Credentials**

   ```typescript
   // WRONG
   logger.info('Login attempt', { username, password }); // Never log passwords

   // RIGHT
   logger.info('Login attempt', { username, password: '[REDACTED]' });
   ```

2. **Personal Identifiable Information (PII)**

   ```typescript
   // WRONG
   logger.info('User profile', {
     email: 'user@example.com',
     phone: '+1234567890',
     ssn: '123-45-6789',
   });

   // RIGHT
   logger.info('User profile updated', {
     user_id: 'user123',
     fields_updated: ['email', 'phone'],
   });
   ```

3. **API Keys and Secrets**

   ```typescript
   // WRONG
   logger.info('API call', { apiKey: 'secret-key-123' });

   // RIGHT
   logger.info('API call', { apiKey: '[REDACTED]', endpoint: '/api/data' });
   ```

4. **Session Tokens**

   ```typescript
   // WRONG
   logger.info('Session', { token: 'jwt-token-here' });

   // RIGHT
   logger.info('Session created', {
     user_id: 'user123',
     expires_at: expirationTime,
   });
   ```

5. **Credit Card/Payment Information**

   ```typescript
   // WRONG
   logger.info('Payment', { cardNumber: '4111111111111111' });

   // RIGHT
   logger.info('Payment processed', {
     transaction_id: 'txn123',
     last_four: '1111',
     amount: 99.99,
   });
   ```

### ✅ Safe to Log

1. **User IDs** (if not email addresses)
2. **Timestamps and durations**
3. **Result counts and pagination info**
4. **Error types and HTTP status codes**
5. **Request URLs** (without sensitive query params)
6. **Component states and user action types**

### 🔍 Redaction Patterns

```typescript
// Utility function for safe parameter logging
const redactSensitiveFields = (obj: Record<string, unknown>) => {
  const sensitive = ['password', 'token', 'apiKey', 'secret', 'key', 'auth'];
  const redacted = { ...obj };

  for (const field of sensitive) {
    if (redacted[field]) {
      redacted[field] = '[REDACTED]';
    }
  }

  return redacted;
};

// Usage
logger.info(
  'API call',
  createLogContext('api/secure', 'POST', { params: redactSensitiveFields(requestParams) })
);
```

## Migration Checklist

### Before Migration

- [ ] Identify console.\* usage category (A/B/C/D/E from audit)
- [ ] Choose appropriate template (Hook/API/Component)
- [ ] Review data being logged for security concerns

### During Migration

- [ ] Import logger and createLogContext
- [ ] Replace console.\* with appropriate logger method
- [ ] Add required context (module_name, function_name)
- [ ] Redact sensitive information
- [ ] Include relevant metadata

### After Migration

- [ ] Test in development (human-readable output)
- [ ] Test in production simulation (JSON output)
- [ ] Verify correlation_id propagation
- [ ] Run existing tests (should pass without changes)
- [ ] Check log output includes all required fields

## Testing Your Logs

### Development Testing

```bash
# Run in development mode
npm run dev:log

# Trigger the functionality and check console output
# Should see human-readable logs like:
# 2024-01-15T10:30:00.000Z [INFO]: Data fetch successful { module_name: 'hooks/useData', function_name: 'fetchData', result_count: 10 }
```

### Production Testing

```bash
# Simulate production environment
NODE_ENV=production npm run build && npm start

# Check log output is JSON
# Should see: {"timestamp":"2024-01-15T10:30:00.000Z","level":"info","message":"Data fetch successful","service_name":"vanity","correlation_id":"abc123","module_name":"hooks/useData","function_name":"fetchData","result_count":10}
```

### Integration Testing

```typescript
// Add to your test files
import { logger } from '@/lib/logger';

// Mock logger in tests
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    http: jest.fn(),
  },
  createLogContext: jest.fn((module, func, extra) => ({
    module_name: module,
    function_name: func,
    ...extra,
  })),
}));

// Test that logging occurs with correct context
expect(logger.info).toHaveBeenCalledWith(
  'Expected message',
  expect.objectContaining({
    module_name: 'expected-module',
    function_name: 'expected-function',
  })
);
```

## Common Pitfalls

1. **Forgetting correlation ID context** - Always set in API routes
2. **Logging sensitive data** - Use redaction patterns
3. **Missing required context** - Always use createLogContext
4. **Over-logging in hot paths** - Consider performance impact
5. **Not testing both environments** - Verify dev and prod output

## Performance Considerations

- Structured logging has minimal overhead in production
- Avoid logging in tight loops or hot paths
- Use logger.debug for verbose development-only logs
- Consider async logging for high-volume applications

## Support

For questions about logging migration:

1. Check this guide first
2. Review existing migrated files as examples
3. Test your changes in both development and production modes
4. Ensure all tests pass before committing
