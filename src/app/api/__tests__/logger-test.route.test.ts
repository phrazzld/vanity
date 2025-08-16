import { GET } from '../logger-test/route';
import { logger, CorrelationContext } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

jest.mock('@/lib/logger', () => ({
  logger: {
    http: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  createLogContext: jest.fn(() => ({})),
  CorrelationContext: {
    set: jest.fn(),
    clear: jest.fn(),
  },
}));
jest.mock('nanoid');
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, init })),
  },
  NextRequest: jest.fn(),
}));

describe('/api/logger-test', () => {
  const mockRequest = {
    url: 'http://localhost:3000/api/logger-test',
    headers: {
      get: jest.fn((key: string) => {
        if (key === 'x-correlation-id') return null;
        if (key === 'user-agent') return 'test-agent';
        return null;
      }),
    },
    nextUrl: {
      searchParams: {
        get: jest.fn((_key: string) => null),
      },
    },
  } as unknown as NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    (nanoid as jest.Mock).mockReturnValue('test-id-123');
  });

  describe('GET', () => {
    it('should handle successful request', async () => {
      await GET(mockRequest);

      expect(nanoid).toHaveBeenCalled();
      expect(CorrelationContext.set).toHaveBeenCalledWith('test-id-123');
      expect(logger.http).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logger test successful',
        correlationId: 'test-id-123',
        timestamp: expect.any(String),
      });
      expect(CorrelationContext.clear).toHaveBeenCalled();
    });

    it('should use provided correlation ID from headers', async () => {
      const requestWithCorrelationId = {
        ...mockRequest,
        headers: {
          get: jest.fn((key: string) => {
            if (key === 'x-correlation-id') return 'existing-id';
            if (key === 'user-agent') return 'test-agent';
            return null;
          }),
        },
      } as unknown as NextRequest;

      await GET(requestWithCorrelationId);

      expect(CorrelationContext.set).toHaveBeenCalledWith('existing-id');
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'existing-id',
        })
      );
    });

    it('should handle warn level parameter', async () => {
      const requestWithWarn = {
        ...mockRequest,
        nextUrl: {
          searchParams: {
            get: jest.fn((key: string) => (key === 'level' ? 'warn' : null)),
          },
        },
      } as unknown as NextRequest;

      await GET(requestWithWarn);

      expect(logger.warn).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should handle error level parameter', async () => {
      const requestWithError = {
        ...mockRequest,
        nextUrl: {
          searchParams: {
            get: jest.fn((key: string) => (key === 'level' ? 'error' : null)),
          },
        },
      } as unknown as NextRequest;

      await GET(requestWithError);

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Test error occurred' },
        { status: 400 }
      );
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      (logger.info as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      await GET(mockRequest);

      expect(logger.error).toHaveBeenCalledWith('Unexpected API error', {}, error);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error', correlationId: 'test-id-123' },
        { status: 500 }
      );
      expect(CorrelationContext.clear).toHaveBeenCalled();
    });
  });
});
