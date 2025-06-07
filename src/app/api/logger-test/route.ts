import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger, createLogContext, CorrelationContext } from '@/lib/logger';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // Set correlation ID for request tracking
  const correlationId = req.headers.get('x-correlation-id') || nanoid();
  CorrelationContext.set(correlationId);

  logger.http(
    'API request received',
    createLogContext('api/logger-test', 'GET', {
      url: req.url,
      method: 'GET',
      user_agent: req.headers.get('user-agent'),
      correlation_id: correlationId,
    })
  );

  try {
    // Log various levels
    logger.debug(
      'Debug message from API route',
      createLogContext('api/logger-test', 'GET', { request_stage: 'processing' })
    );

    logger.info(
      'Processing GET request',
      createLogContext('api/logger-test', 'GET', { request_stage: 'validation' })
    );

    // Simulate different log levels
    const logLevel = req.nextUrl.searchParams.get('level');

    if (logLevel === 'warn') {
      logger.warn(
        'Warning test message',
        createLogContext('api/logger-test', 'GET', {
          source: 'query_parameter',
          test_level: logLevel,
        })
      );
    }

    if (logLevel === 'error') {
      logger.error(
        'Error test message',
        createLogContext('api/logger-test', 'GET', {
          source: 'query_parameter',
          test_level: logLevel,
        })
      );
      return NextResponse.json({ error: 'Test error occurred' }, { status: 400 });
    }

    // Return success response
    logger.http(
      'API request completed successfully',
      createLogContext('api/logger-test', 'GET', {
        response_status: 200,
        duration: Date.now() - startTime,
      })
    );
    return NextResponse.json({
      success: true,
      message: 'Logger test successful',
      correlationId: correlationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      'Unexpected API error',
      createLogContext('api/logger-test', 'GET', {
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      { error: 'Internal server error', correlationId: correlationId },
      { status: 500 }
    );
  } finally {
    // Clear correlation context after request
    CorrelationContext.clear();
  }
}
