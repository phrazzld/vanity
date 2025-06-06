/* eslint-disable no-undef */
import { logger, CorrelationContext } from '../logger';

// Mock console methods
const consoleMocks = {
  error: jest.spyOn(console, 'error').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  info: jest.spyOn(console, 'info').mockImplementation(),
  log: jest.spyOn(console, 'log').mockImplementation(),
};

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id'),
}));

// Store original NODE_ENV to restore later
const originalEnv = process.env.NODE_ENV as string | undefined;

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the correlation context between tests
    CorrelationContext.clear();
    // Set to development to test console output
    // @ts-ignore - Temporarily allow process.env modification in tests
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    // @ts-ignore - Temporarily allow process.env modification in tests
    process.env.NODE_ENV = originalEnv;
  });

  it('logs messages with correct format in development', () => {
    logger.info('Test message');

    expect(consoleMocks.info).toHaveBeenCalledTimes(1);
    const logOutput = (consoleMocks.info?.mock?.calls?.[0]?.[0] as string) || '';
    expect(logOutput).toContain('[INFO]: Test message');
    expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('generates and stores correlation ID', () => {
    // The correlation ID is generated but not displayed in dev logs
    // We can verify it exists by checking the CorrelationContext
    logger.info('Test message');
    expect(CorrelationContext.current.correlationId).toBe('test-correlation-id');
  });

  it('allows setting a custom correlation ID', () => {
    const customId = 'custom-correlation-id';
    CorrelationContext.set(customId);

    logger.error('Test error message');

    expect(CorrelationContext.current.correlationId).toBe(customId);
    expect(consoleMocks.error).toHaveBeenCalledTimes(1);
    const logOutput = (consoleMocks.error?.mock?.calls?.[0]?.[0] as string) || '';
    expect(logOutput).toContain('[ERROR]: Test error message');
  });

  it('includes additional metadata in log messages', () => {
    const metadata = { userId: '123', action: 'login' };
    logger.warn('Test warning', metadata);

    expect(consoleMocks.warn).toHaveBeenCalledTimes(1);
    const logOutput = (consoleMocks.warn?.mock?.calls?.[0]?.[0] as string) || '';
    expect(logOutput).toContain('[WARN]: Test warning');

    const logData = (consoleMocks.warn?.mock?.calls?.[0]?.[1] as Record<string, unknown>) || {};
    expect(logData).toEqual(metadata);
  });

  it('handles different log levels correctly', () => {
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.http('HTTP message');

    expect(consoleMocks.log).toHaveBeenCalledTimes(2); // debug and http use console.log
    expect(consoleMocks.info).toHaveBeenCalledTimes(1);
    expect(consoleMocks.warn).toHaveBeenCalledTimes(1);
    expect(consoleMocks.error).toHaveBeenCalledTimes(1);

    expect(consoleMocks.log.mock.calls[0]?.[0] as string).toContain('[DEBUG]: Debug message');
    expect(consoleMocks.info.mock.calls[0]?.[0] as string).toContain('[INFO]: Info message');
    expect(consoleMocks.warn.mock.calls[0]?.[0] as string).toContain('[WARN]: Warning message');
    expect(consoleMocks.error.mock.calls[0]?.[0] as string).toContain('[ERROR]: Error message');
    expect(consoleMocks.log.mock.calls[1]?.[0] as string).toContain('[HTTP]: HTTP message');
  });

  it('uses structured JSON logging in production', () => {
    // @ts-ignore - NODE_ENV is readonly in TypeScript
    process.env.NODE_ENV = 'production';

    const metadata = { userId: '123' };
    logger.info('Production message', metadata);

    expect(consoleMocks.log).toHaveBeenCalledTimes(1);
    const logOutput = (consoleMocks.log?.mock?.calls?.[0]?.[0] as string) || '{}';
    const parsedLog = JSON.parse(logOutput) as Record<string, unknown>;

    expect(parsedLog).toMatchObject({
      level: 'info',
      message: 'Production message',
      correlation_id: 'test-correlation-id',
      userId: '123',
    });
    expect(parsedLog.timestamp).toBeDefined();
  });

  it('handles undefined metadata gracefully', () => {
    logger.info('Test message');

    expect(consoleMocks.info).toHaveBeenCalledTimes(1);
    const logData = consoleMocks.info?.mock?.calls?.[0]?.[1] as unknown;
    expect(logData).toBeUndefined();
  });

  describe('Enhanced Structured Logging', () => {
    beforeEach(() => {
      // @ts-ignore - NODE_ENV is readonly in TypeScript
      process.env.NODE_ENV = 'production';
      // Clear any existing LOG_LEVEL to test defaults
      // @ts-ignore
      delete process.env.LOG_LEVEL;
    });

    it('includes all mandatory context fields in production logs', () => {
      logger.info('Test message');

      expect(consoleMocks.log).toHaveBeenCalledTimes(1);
      const logOutput = (consoleMocks.log?.mock?.calls?.[0]?.[0] as string) || '{}';
      const parsedLog = JSON.parse(logOutput) as Record<string, unknown>;

      // Verify all mandatory fields from DEVELOPMENT_PHILOSOPHY.md
      expect(parsedLog).toHaveProperty('timestamp');
      expect(parsedLog).toHaveProperty('level', 'info');
      expect(parsedLog).toHaveProperty('message', 'Test message');
      expect(parsedLog).toHaveProperty('service_name');
      expect(parsedLog).toHaveProperty('correlation_id');

      // Timestamp should be ISO 8601 UTC format
      expect(typeof parsedLog.timestamp).toBe('string');
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('includes function_name and module_name when provided', () => {
      const metadata = {
        function_name: 'testFunction',
        module_name: 'testModule',
      };
      logger.info('Test message', metadata);

      const logOutput = (consoleMocks.log?.mock?.calls?.[0]?.[0] as string) || '{}';
      const parsedLog = JSON.parse(logOutput) as Record<string, unknown>;

      expect(parsedLog).toHaveProperty('function_name', 'testFunction');
      expect(parsedLog).toHaveProperty('module_name', 'testModule');
    });

    it('includes structured error_details for ERROR level logs', () => {
      const testError = new Error('Test error message');
      testError.stack = 'Error: Test error message\n    at test:1:1';

      logger.error('Operation failed', {}, testError);

      const logOutput = (consoleMocks.log?.mock?.calls?.[0]?.[0] as string) || '{}';
      const parsedLog = JSON.parse(logOutput) as Record<string, unknown>;

      expect(parsedLog).toHaveProperty('level', 'error');
      expect(parsedLog).toHaveProperty('error_details');

      const errorDetails = parsedLog.error_details as Record<string, unknown>;
      expect(errorDetails).toHaveProperty('type', 'Error');
      expect(errorDetails).toHaveProperty('message', 'Test error message');
      expect(errorDetails).toHaveProperty('stack');
    });

    it('respects LOG_LEVEL environment variable for filtering', () => {
      // @ts-ignore - Allow setting environment variable in tests
      process.env.LOG_LEVEL = 'warn';

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // Should only log warn and error when LOG_LEVEL=warn
      expect(consoleMocks.log).toHaveBeenCalledTimes(2);

      const logs = consoleMocks.log.mock.calls.map(call => JSON.parse(call[0] as string));
      expect(logs[0]).toHaveProperty('level', 'warn');
      expect(logs[1]).toHaveProperty('level', 'error');
    });

    it('defaults to appropriate log levels by environment', () => {
      // Test development default
      // @ts-ignore
      delete process.env.LOG_LEVEL;
      // @ts-ignore
      process.env.NODE_ENV = 'development';

      logger.debug('Debug in dev');
      expect(consoleMocks.log).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      // Test production default
      // @ts-ignore
      process.env.NODE_ENV = 'production';

      logger.debug('Debug in prod');
      logger.info('Info in prod');

      // Debug should be filtered out in production, only info should log
      expect(consoleMocks.log).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(consoleMocks.log.mock.calls[0]?.[0] as string);
      expect(logOutput).toHaveProperty('level', 'info');
    });

    it('preserves additional context fields', () => {
      const metadata = {
        user_id: 'user123',
        request_id: 'req456',
        custom_field: 'custom_value',
      };

      logger.info('User action', metadata);

      const logOutput = (consoleMocks.log?.mock?.calls?.[0]?.[0] as string) || '{}';
      const parsedLog = JSON.parse(logOutput) as Record<string, unknown>;

      expect(parsedLog).toHaveProperty('user_id', 'user123');
      expect(parsedLog).toHaveProperty('request_id', 'req456');
      expect(parsedLog).toHaveProperty('custom_field', 'custom_value');
    });
  });
});
/* eslint-enable no-undef */
