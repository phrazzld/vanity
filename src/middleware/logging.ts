import { NextRequest, NextResponse } from 'next/server';
import { logger, CorrelationContext } from '@/lib/logger';

// Generate a unique ID for the request
const generateRequestId = (req: NextRequest): string => {
  // Try to use an existing correlation ID from the headers, or generate a new one
  return (
    req.headers.get('x-correlation-id') || req.headers.get('x-request-id') || crypto.randomUUID()
  );
};

// Request logging middleware
export function requestLoggingMiddleware(req: NextRequest): NextResponse | void {
  const startTime = Date.now();
  const url = req.nextUrl.pathname;
  const method = req.method;

  // Generate or use an existing correlation ID
  const correlationId = generateRequestId(req);
  CorrelationContext.set(correlationId);

  // Log the incoming request
  logger.http(`${method} ${url}`, {
    method,
    url,
    query: Object.fromEntries(req.nextUrl.searchParams.entries()),
    userAgent: req.headers.get('user-agent') || 'unknown',
    referrer: req.headers.get('referer') || 'unknown',
  });

  // Get the response
  const response = NextResponse.next();

  // Add correlation ID header to the response
  response.headers.set('x-correlation-id', correlationId);

  // Log request completion
  const duration = Date.now() - startTime;
  logger.http(`${method} ${url} completed`, {
    method,
    url,
    durationMs: duration,
  });

  return response;
}

// Error logging middleware
export function errorLoggingMiddleware(error: Error): void {
  logger.error(`Unhandled error: ${error.message}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
}

// Utility to create a logger with component context
export function createComponentLogger(componentName: string) {
  return {
    error: (message: string, metadata = {}) =>
      logger.error(message, { ...metadata, component: componentName }),
    warn: (message: string, metadata = {}) =>
      logger.warn(message, { ...metadata, component: componentName }),
    info: (message: string, metadata = {}) =>
      logger.info(message, { ...metadata, component: componentName }),
    http: (message: string, metadata = {}) =>
      logger.http(message, { ...metadata, component: componentName }),
    debug: (message: string, metadata = {}) =>
      logger.debug(message, { ...metadata, component: componentName }),
  };
}
