import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createComponentLogger } from '@/middleware/logging';

// Create a component-specific logger
const apiLogger = createComponentLogger('api/logger-test');

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-correlation-id') || 'unknown';

  try {
    // Log various levels
    apiLogger.debug('Debug message from API route', { requestId });
    apiLogger.info('Processing GET request', { requestId });

    // Simulate different log levels
    const logLevel = req.nextUrl.searchParams.get('level');

    if (logLevel === 'warn') {
      apiLogger.warn('Warning test message', { source: 'query parameter', requestId });
    }

    if (logLevel === 'error') {
      apiLogger.error('Error test message', { source: 'query parameter', requestId });
      return NextResponse.json({ error: 'Test error occurred' }, { status: 400 });
    }

    // Return success response
    apiLogger.info('Request completed successfully', { requestId });
    return NextResponse.json({
      success: true,
      message: 'Logger test successful',
      correlationId: requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log any unexpected errors
    if (error instanceof Error) {
      apiLogger.error(`Unexpected error: ${error.message}`, {
        requestId,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
    } else {
      apiLogger.error('Unknown error occurred', { requestId });
    }

    return NextResponse.json(
      { error: 'Internal server error', correlationId: requestId },
      { status: 500 }
    );
  }
}
