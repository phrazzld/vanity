/**
 * Runtime-safe logger that works in both Edge Runtime and Node.js environments
 */

import { nanoid } from 'nanoid';

// Simple logger interface
interface LoggerInterface {
  error(_message: string, _metadata?: Record<string, unknown>): void;
  warn(_message: string, _metadata?: Record<string, unknown>): void;
  info(_message: string, _metadata?: Record<string, unknown>): void;
  http(_message: string, _metadata?: Record<string, unknown>): void;
  debug(_message: string, _metadata?: Record<string, unknown>): void;
}

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

// Create the logger
const createLogger = (): LoggerInterface => {
  const log = (level: string, message: string, metadata: Record<string, unknown> = {}) => {
    const timestamp = new Date().toISOString();
    const correlationId = CorrelationContext.current.correlationId;

    const logEntry = {
      timestamp,
      level,
      message,
      correlation_id: correlationId,
      ...metadata,
    };

    // Simple console logging that works in all environments
    if (process.env.NODE_ENV !== 'production') {
      const logString = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      const logData = Object.keys(metadata).length > 0 ? metadata : undefined;

      switch (level) {
        case 'error':
          console.error(logString, logData);
          break;
        case 'warn':
          console.warn(logString, logData);
          break;
        case 'info':
          console.info(logString, logData);
          break;
        case 'http':
        case 'debug':
          console.log(logString, logData);
          break;
        default:
          console.log(logString, logData);
      }
    } else {
      // In production, use structured JSON logging
      console.log(JSON.stringify(logEntry));
    }
  };

  return {
    error: (message: string, metadata?: Record<string, unknown>) => log('error', message, metadata),
    warn: (message: string, metadata?: Record<string, unknown>) => log('warn', message, metadata),
    info: (message: string, metadata?: Record<string, unknown>) => log('info', message, metadata),
    http: (message: string, metadata?: Record<string, unknown>) => log('http', message, metadata),
    debug: (message: string, metadata?: Record<string, unknown>) => log('debug', message, metadata),
  };
};

// Create and export the logger
export const logger = createLogger();
export { CorrelationContext };
