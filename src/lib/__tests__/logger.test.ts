import { logger, CorrelationContext } from '../logger';

// Mock winston
jest.mock('winston', () => {
  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  };

  return {
    createLogger: jest.fn(() => mockLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      colorize: jest.fn(),
      printf: jest.fn(),
      json: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
    addColors: jest.fn(),
  };
});

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id'),
}));

// Import the real winston module to get the mock
import winston from 'winston';

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the correlation context between tests
    CorrelationContext.clear();
  });

  it('adds correlation ID to log messages', () => {
    // Set up mocks
    const mockWinston = winston.createLogger() as jest.Mocked<typeof winston.createLogger>;

    // Call logger
    logger.info('Test message');

    // Check if winston logger was called with correlation ID
    expect(mockWinston.info).toHaveBeenCalled();
    const lastCall = (mockWinston.info as jest.Mock).mock.calls[0];
    expect(lastCall[1].metadata.correlation_id).toBe('test-correlation-id');
  });

  it('allows setting a custom correlation ID', () => {
    // Set custom correlation ID
    const customId = 'custom-correlation-id';
    CorrelationContext.set(customId);

    // Set up mocks
    const mockWinston = winston.createLogger() as jest.Mocked<typeof winston.createLogger>;

    // Call logger
    logger.error('Test error message');

    // Check if winston logger was called with custom correlation ID
    expect(mockWinston.error).toHaveBeenCalled();
    const lastCall = (mockWinston.error as jest.Mock).mock.calls[0];
    expect(lastCall[1].metadata.correlation_id).toBe(customId);
  });

  it('includes additional metadata in log messages', () => {
    // Set up mocks
    const mockWinston = winston.createLogger() as jest.Mocked<typeof winston.createLogger>;

    // Call logger with additional metadata
    const metadata = { userId: '123', action: 'login' };
    logger.warn('Test warning', metadata);

    // Check if winston logger was called with correlation ID and metadata
    expect(mockWinston.warn).toHaveBeenCalled();
    const lastCall = (mockWinston.warn as jest.Mock).mock.calls[0];
    expect(lastCall[1].metadata.userId).toBe('123');
    expect(lastCall[1].metadata.action).toBe('login');
    expect(lastCall[1].metadata.correlation_id).toBeTruthy();
  });
});
