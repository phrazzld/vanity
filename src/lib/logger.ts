import winston from 'winston';
import { nanoid } from 'nanoid';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define log format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info =>
      `${info.timestamp} ${info.level}: ${info.message}${info.metadata ? ` ${JSON.stringify(info.metadata)}` : ''}`
  )
);

// Define log format for production (JSON)
const productionFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

// Determine which format to use based on environment
const format = process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat;

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  defaultMeta: { service: 'vanity' },
  transports: [
    // Write logs to console
    new winston.transports.Console(),

    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),

    // Write all logs to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// Create a correlation ID context for tracking requests through the system
class CorrelationContext {
  private static _current: { correlationId: string } | null = null;

  static get current(): { correlationId: string } {
    if (!this._current) {
      this._current = { correlationId: nanoid() };
    }
    return this._current;
  }

  static set(correlationId: string): void {
    this._current = { correlationId };
  }

  static clear(): void {
    this._current = null;
  }
}

// Enhanced logging interface
interface LoggerInterface {
  error(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  http(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
}

// Proxy to enhance logger with correlation ID
const loggerProxy: LoggerInterface = {
  error(message: string, metadata: Record<string, unknown> = {}) {
    logger.error(message, {
      metadata: {
        ...metadata,
        correlation_id: CorrelationContext.current.correlationId,
      },
    });
  },
  warn(message: string, metadata: Record<string, unknown> = {}) {
    logger.warn(message, {
      metadata: {
        ...metadata,
        correlation_id: CorrelationContext.current.correlationId,
      },
    });
  },
  info(message: string, metadata: Record<string, unknown> = {}) {
    logger.info(message, {
      metadata: {
        ...metadata,
        correlation_id: CorrelationContext.current.correlationId,
      },
    });
  },
  http(message: string, metadata: Record<string, unknown> = {}) {
    logger.http(message, {
      metadata: {
        ...metadata,
        correlation_id: CorrelationContext.current.correlationId,
      },
    });
  },
  debug(message: string, metadata: Record<string, unknown> = {}) {
    logger.debug(message, {
      metadata: {
        ...metadata,
        correlation_id: CorrelationContext.current.correlationId,
      },
    });
  },
};

export { loggerProxy as logger, CorrelationContext };
