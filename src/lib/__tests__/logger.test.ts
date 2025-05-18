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
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('logs messages with correct format in development', () => {
    logger.info('Test message');

    expect(consoleMocks.info).toHaveBeenCalledTimes(1);
    const logOutput = consoleMocks.info.mock.calls[0][0] as string;
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
    const logOutput = consoleMocks.error.mock.calls[0][0] as string;
    expect(logOutput).toContain('[ERROR]: Test error message');
  });

  it('includes additional metadata in log messages', () => {
    const metadata = { userId: '123', action: 'login' };
    logger.warn('Test warning', metadata);

    expect(consoleMocks.warn).toHaveBeenCalledTimes(1);
    const logOutput = consoleMocks.warn.mock.calls[0][0] as string;
    expect(logOutput).toContain('[WARN]: Test warning');

    const logData = consoleMocks.warn.mock.calls[0][1] as Record<string, unknown>;
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

    expect(consoleMocks.log.mock.calls[0][0] as string).toContain('[DEBUG]: Debug message');
    expect(consoleMocks.info.mock.calls[0][0] as string).toContain('[INFO]: Info message');
    expect(consoleMocks.warn.mock.calls[0][0] as string).toContain('[WARN]: Warning message');
    expect(consoleMocks.error.mock.calls[0][0] as string).toContain('[ERROR]: Error message');
    expect(consoleMocks.log.mock.calls[1][0] as string).toContain('[HTTP]: HTTP message');
  });

  it('uses structured JSON logging in production', () => {
    process.env.NODE_ENV = 'production';

    const metadata = { userId: '123' };
    logger.info('Production message', metadata);

    expect(consoleMocks.log).toHaveBeenCalledTimes(1);
    const logOutput = consoleMocks.log.mock.calls[0][0] as string;
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
    const logData = consoleMocks.info.mock.calls[0][1] as unknown;
    expect(logData).toBeUndefined();
  });
});
/* eslint-enable no-undef */
