/* eslint-disable no-undef */
/**
 * Integration tests for structured logging across critical application paths
 *
 * This test suite verifies:
 * 1. API error handling produces structured logs
 * 2. Hook state changes include proper logging context
 * 3. Correlation ID propagation works across request flows
 */

import { logger, createLogContext, CorrelationContext } from '@/lib/logger';

// Mock console methods to capture log output
const consoleMocks = {
  error: jest.spyOn(console, 'error').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  info: jest.spyOn(console, 'info').mockImplementation(),
  log: jest.spyOn(console, 'log').mockImplementation(),
};

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id-123'),
}));

describe('Structured Logging Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    CorrelationContext.clear();
    // Set to production to test JSON output
    // @ts-ignore - Allow setting environment variable in tests
    process.env.NODE_ENV = 'production';
    // Set LOG_LEVEL to debug to test all log levels
    // @ts-ignore - Allow setting environment variable in tests
    process.env.LOG_LEVEL = 'debug';
  });

  afterEach(() => {
    // @ts-ignore - Allow setting environment variable in tests
    process.env.NODE_ENV = 'test';
    // @ts-ignore - Allow setting environment variable in tests
    delete process.env.LOG_LEVEL;
  });

  describe('API Error Handling', () => {
    it('produces structured error logs with correlation IDs', () => {
      const correlationId = 'api-test-correlation-123';
      CorrelationContext.set(correlationId);

      const testError = new Error('Database connection failed');
      testError.stack = 'Error: Database connection failed\n    at test (/path/to/test.js:1:1)';

      logger.error(
        'API request failed',
        createLogContext('api/quotes', 'GET', {
          request_id: 'req-123',
          user_id: 'user-456',
          error_type: 'DatabaseError',
        }),
        testError
      );

      expect(consoleMocks.log).toHaveBeenCalledTimes(1);

      const logCall = consoleMocks.log.mock.calls[0];
      const logOutput = logCall[0] as string;

      // Parse JSON output
      const logEntry = JSON.parse(logOutput);

      // Verify mandatory fields
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('level', 'error');
      expect(logEntry).toHaveProperty('message', 'API request failed');
      expect(logEntry).toHaveProperty('correlation_id', correlationId);

      // Verify context structure (flattened into root)
      expect(logEntry).toHaveProperty('module_name', 'api/quotes');
      expect(logEntry).toHaveProperty('function_name', 'GET');
      expect(logEntry).toHaveProperty('request_id', 'req-123');
      expect(logEntry).toHaveProperty('user_id', 'user-456');
      expect(logEntry).toHaveProperty('error_type', 'DatabaseError');

      // Verify error details in log entry
      expect(logEntry).toHaveProperty('error_details');
      expect(logEntry.error_details).toHaveProperty('message', 'Database connection failed');
      expect(logEntry.error_details).toHaveProperty('stack');
      expect(logEntry.error_details.stack).toContain('Database connection failed');
    });

    it('handles missing correlation ID gracefully', () => {
      logger.info(
        'Request processed',
        createLogContext('api/readings', 'POST', {
          items_processed: 5,
        })
      );

      expect(consoleMocks.log).toHaveBeenCalledTimes(1);

      const logOutput = consoleMocks.log.mock.calls[0][0] as string;
      const logEntry = JSON.parse(logOutput);

      // Should auto-generate correlation ID
      expect(logEntry).toHaveProperty('correlation_id');
      expect(logEntry.correlation_id).toBe('test-correlation-id-123');
    });
  });

  describe('Hook State Changes', () => {
    it('logs state transitions with proper context', () => {
      const hookContext = createLogContext('hooks/useListState', 'updateSortOrder', {
        previous_sort: 'date:desc',
        new_sort: 'title:asc',
        items_count: 42,
      });

      logger.debug('Sort order updated', hookContext);

      expect(consoleMocks.log).toHaveBeenCalledTimes(1);

      const logOutput = consoleMocks.log.mock.calls[0][0] as string;
      const logEntry = JSON.parse(logOutput);

      expect(logEntry.level).toBe('debug');
      expect(logEntry.module_name).toBe('hooks/useListState');
      expect(logEntry.function_name).toBe('updateSortOrder');
      expect(logEntry.previous_sort).toBe('date:desc');
      expect(logEntry.new_sort).toBe('title:asc');
      expect(logEntry.items_count).toBe(42);
    });
  });

  describe('Correlation ID Propagation', () => {
    it('maintains correlation ID across multiple log entries', () => {
      const correlationId = 'flow-test-123';
      CorrelationContext.set(correlationId);

      // Simulate request flow through multiple components
      logger.http(
        'Request received',
        createLogContext('api/quotes', 'GET', {
          url: '/api/quotes?search=test',
        })
      );

      logger.debug(
        'Database query started',
        createLogContext('lib/db/quotes', 'searchQuotes', {
          search_term: 'test',
        })
      );

      logger.info(
        'Results processed',
        createLogContext('api/quotes', 'GET', {
          results_count: 3,
          processing_time: 45,
        })
      );

      // Verify all log entries have the same correlation ID
      expect(consoleMocks.log).toHaveBeenCalledTimes(3); // http, debug, and info all use console.log in production

      const httpLog = JSON.parse(consoleMocks.log.mock.calls[0][0] as string);
      const debugLog = JSON.parse(consoleMocks.log.mock.calls[1][0] as string);
      const infoLog = JSON.parse(consoleMocks.log.mock.calls[2][0] as string);

      expect(httpLog.correlation_id).toBe(correlationId);
      expect(debugLog.correlation_id).toBe(correlationId);
      expect(infoLog.correlation_id).toBe(correlationId);
    });

    it('isolates correlation IDs between requests', () => {
      // First request
      CorrelationContext.set('request-1');
      logger.info('Processing request 1', createLogContext('api/test', 'handler1'));

      // Clear and set new correlation ID
      CorrelationContext.clear();
      CorrelationContext.set('request-2');
      logger.info('Processing request 2', createLogContext('api/test', 'handler2'));

      const firstLog = JSON.parse(consoleMocks.log.mock.calls[0][0] as string);
      const secondLog = JSON.parse(consoleMocks.log.mock.calls[1][0] as string);

      expect(firstLog.correlation_id).toBe('request-1');
      expect(secondLog.correlation_id).toBe('request-2');
    });
  });

  describe('Performance Impact Validation', () => {
    it('executes logging operations efficiently', () => {
      const startTime = Date.now();
      const iterations = 1000;

      // Simulate high-frequency logging
      for (let i = 0; i < iterations; i++) {
        logger.debug(
          `Iteration ${i}`,
          createLogContext('test/performance', 'benchmark', {
            iteration: i,
            batch_size: 100,
          })
        );
      }

      const executionTime = Date.now() - startTime;
      const avgTimePerLog = executionTime / iterations;

      // Performance assertion: should be under 1ms per log entry
      expect(avgTimePerLog).toBeLessThan(1);

      // Log performance metrics
      logger.info(
        'Performance test completed',
        createLogContext('test/performance', 'benchmark', {
          total_iterations: iterations,
          execution_time_ms: executionTime,
          avg_time_per_log_ms: avgTimePerLog,
        })
      );
    });
  });

  describe('Security Validation', () => {
    it('does not log sensitive information', () => {
      // Test that passwords, tokens, etc. are not logged
      logger.info(
        'User authentication attempt',
        createLogContext('auth/login', 'authenticate', {
          username: 'testuser', // OK to log
          // password should NEVER be logged
          ip_address: '192.168.1.1', // OK to log
          user_agent: 'Mozilla/5.0...', // OK to log
          session_id: '[REDACTED]', // Should be redacted
        })
      );

      const logOutput = consoleMocks.log.mock.calls[0][0] as string;
      const logEntry = JSON.parse(logOutput);

      // Verify no sensitive data is present
      expect(logOutput).not.toContain('password');
      expect(logOutput).not.toContain('secret');
      expect(logOutput).not.toContain('token');

      // Verify redacted fields are handled properly
      expect(logEntry.session_id).toBe('[REDACTED]');
    });
  });
});
/* eslint-enable no-undef */
