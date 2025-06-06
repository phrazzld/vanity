/**
 * Structured logger that complies with DEVELOPMENT_PHILOSOPHY.md requirements
 * Works in both Edge Runtime and Node.js environments
 */

import { nanoid } from 'nanoid';

// Enhanced metadata interface for additional context
interface LogMetadata {
  [key: string]: unknown;
  function_name?: string;
  module_name?: string;
  user_id?: string;
  request_id?: string;
  duration?: number;
}

// Enhanced logger interface
interface LoggerInterface {
  error(_message: string, _metadata?: LogMetadata, _error?: Error): void;
  warn(_message: string, _metadata?: LogMetadata): void;
  info(_message: string, _metadata?: LogMetadata): void;
  http(_message: string, _metadata?: LogMetadata): void;
  debug(_message: string, _metadata?: LogMetadata): void;
}

// Structured log entry interface per DEVELOPMENT_PHILOSOPHY.md
interface LogEntry {
  timestamp: string; // ISO 8601 UTC
  level: string; // error, warn, info, debug, http
  message: string; // Clear description
  service_name: string; // Service identifier
  correlation_id: string; // Request/trace ID
  function_name?: string; // Where log originated
  module_name?: string; // Module where log originated
  error_details?: {
    // For ERROR level only
    type: string;
    message: string;
    stack?: string;
  };
  [key: string]: unknown; // Additional context
}

// Log level hierarchy for filtering
const LOG_LEVELS = {
  debug: 0,
  http: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

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

// Create the enhanced logger
const createLogger = (): LoggerInterface => {
  const shouldLog = (level: LogLevel): boolean => {
    // Get configuration from environment dynamically (for testing)
    const LOG_LEVEL = (process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === 'production' ? 'info' : 'debug')) as LogLevel;
    const minLevel = LOG_LEVELS[LOG_LEVEL];
    return LOG_LEVELS[level] >= minLevel;
  };

  const log = (level: LogLevel, message: string, metadata: LogMetadata = {}, error?: Error) => {
    // Filter based on log level
    if (!shouldLog(level)) {
      return;
    }

    // Get configuration from environment dynamically (for testing)
    const SERVICE_NAME = process.env.SERVICE_NAME || 'vanity';
    const IS_PRODUCTION = process.env.NODE_ENV === 'production';

    const timestamp = new Date().toISOString();
    const correlationId = CorrelationContext.current.correlationId;

    // Build structured log entry with all mandatory fields
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      service_name: SERVICE_NAME,
      correlation_id: correlationId,
      ...metadata,
    };

    // Add error details for ERROR level logs
    if (level === 'error' && error) {
      logEntry.error_details = {
        type: error.constructor.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // In production environment, use structured JSON logging
    if (IS_PRODUCTION) {
      const output = JSON.stringify(logEntry);
      // For tests simulating production, use console.log for easy capturing
      // In real production, use process.stdout to avoid console.* calls
      if (typeof jest !== 'undefined') {
        console.log(output);
      } else if (typeof process !== 'undefined' && process.stdout) {
        process.stdout.write(output + '\n');
      } else {
        // Fallback for edge runtime environments
        console.log(output);
      }
    } else {
      // In development, use human-readable console output
      const logString = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      const hasMetadata = Object.keys(metadata).length > 0;

      switch (level) {
        case 'error':
          console.error(logString, hasMetadata ? metadata : undefined);
          break;
        case 'warn':
          console.warn(logString, hasMetadata ? metadata : undefined);
          break;
        case 'info':
          console.info(logString, hasMetadata ? metadata : undefined);
          break;
        case 'http':
        case 'debug':
        default:
          console.log(logString, hasMetadata ? metadata : undefined);
          break;
      }
    }
  };

  return {
    error: (message: string, metadata?: LogMetadata, error?: Error) =>
      log('error', message, metadata, error),
    warn: (message: string, metadata?: LogMetadata) => log('warn', message, metadata),
    info: (message: string, metadata?: LogMetadata) => log('info', message, metadata),
    http: (message: string, metadata?: LogMetadata) => log('http', message, metadata),
    debug: (message: string, metadata?: LogMetadata) => log('debug', message, metadata),
  };
};

// Create and export the logger
export const logger = createLogger();
export { CorrelationContext };
