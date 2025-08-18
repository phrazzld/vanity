/**
 * Simplified logger for static site
 * Logs to console in development, silent in production (except errors)
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  info: isProduction ? () => {} : console.log,
  error: console.error, // Keep errors in production for debugging
  warn: isProduction ? () => {} : console.warn,
  debug: isProduction ? () => {} : console.log,
  http: isProduction ? () => {} : console.log,
  child: () => logger, // No-op for compatibility
};

// Deprecated - kept for compatibility during migration
export const createLogContext = () => ({});
export class CorrelationContext {
  static current = { correlationId: 'static-site' };
  static set() {}
  static clear() {}
}

export default logger;
