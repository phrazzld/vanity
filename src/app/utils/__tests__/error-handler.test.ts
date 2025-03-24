/**
 * Tests for the centralized error handling utility
 */

import { 
  ErrorType, 
  formatError, 
  logError, 
  createErrorResponse,
  createValidationErrorResponse
} from '../error-handler';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => {
      return {
        status: options?.status || 200,
        headers: {
          set: jest.fn(),
          get: jest.fn(),
          has: jest.fn(),
          delete: jest.fn(),
          forEach: jest.fn()
        },
        data
      };
    })
  }
}));

// Store original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;

// Mock console.error
const originalConsoleError = console.error;

describe('Error handling utility', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console.error and NODE_ENV
    console.error = originalConsoleError;
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('formatError', () => {
    it('should format errors with different detail levels in development', () => {
      // Set to development mode
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error message');
      error.stack = 'Error: Test error message\n    at Test.function';
      
      const formattedError = formatError(error, ErrorType.SERVER);
      
      // In development, should include full details
      expect(formattedError.error).toBe(ErrorType.SERVER);
      expect(formattedError.message).toBe('Test error message');
      expect(formattedError.stack).toContain('Error: Test error message');
    });
    
    it('should mask sensitive details in production', () => {
      // Set to production mode
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Database credentials invalid: password123');
      error.stack = 'Error stack with sensitive information';
      
      const formattedError = formatError(error, ErrorType.DATABASE);
      
      // In production, should mask details
      expect(formattedError.error).toBe(ErrorType.DATABASE);
      expect(formattedError.message).toBe('An error occurred while processing your request');
      expect(formattedError.stack).toBeUndefined();
      expect(formattedError.details).toBeUndefined();
    });
    
    it('should use the provided public message in production', () => {
      // Set to production mode
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Detailed database error');
      const publicMessage = 'Could not retrieve data at this time';
      
      const formattedError = formatError(error, ErrorType.DATABASE, publicMessage);
      
      // Should use the public message in production
      expect(formattedError.message).toBe(publicMessage);
      expect(formattedError.details).toBeUndefined();
    });
    
    it('should handle non-Error objects', () => {
      const errorString = 'String error message';
      
      const formattedError = formatError(errorString);
      
      expect(formattedError.error).toBe(ErrorType.UNKNOWN);
      expect(formattedError.message).toBe('String error message');
    });
  });
  
  describe('logError', () => {
    it('should log errors with context', () => {
      const error = new Error('Test error');
      
      logError(error, 'API Route');
      
      expect(console.error).toHaveBeenCalledWith('[API Route] Error: Test error');
    });
    
    it('should log stack trace in development', () => {
      // Set to development mode
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      error.stack = 'Error stack';
      
      logError(error);
      
      expect(console.error).toHaveBeenCalledWith('Error: Test error');
      expect(console.error).toHaveBeenCalledWith('Error stack');
    });
    
    it('should not log stack trace in production', () => {
      // Set to production mode
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Test error');
      error.stack = 'Error stack';
      
      logError(error);
      
      expect(console.error).toHaveBeenCalledWith('Error: Test error');
      expect(console.error).not.toHaveBeenCalledWith('Error stack');
    });
  });
  
  describe('createErrorResponse', () => {
    it('should create responses with appropriate status codes', () => {
      const validationError = new Error('Validation failed');
      const response = createErrorResponse(validationError, ErrorType.VALIDATION);
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe(ErrorType.VALIDATION);
    });
    
    it('should add custom headers when provided', () => {
      const error = new Error('Test error');
      const headers = {
        'Cache-Control': 'no-store',
        'X-Error-ID': '123456'
      };
      
      const response = createErrorResponse(error, ErrorType.SERVER, undefined, headers);
      
      // Since we're mocking NextResponse.json, let's make sure it was called with the right arguments
      expect(NextResponse.json).toHaveBeenCalled();
      
      // Check that the headers were set
      Object.entries(headers).forEach(([key, value]) => {
        expect(response.headers.set).toHaveBeenCalledWith(key, value);
      });
    });
    
    it('should log the error', () => {
      // Mock logError
      const spy = jest.spyOn(console, 'error');
      
      const error = new Error('Test error');
      createErrorResponse(error, ErrorType.SERVER);
      
      expect(spy).toHaveBeenCalled();
    });
  });
  
  describe('createValidationErrorResponse', () => {
    it('should create a response with validation errors', () => {
      const validationErrors = {
        name: 'Name is required',
        email: 'Email format is invalid'
      };
      
      const response = createValidationErrorResponse('Validation failed', validationErrors);
      
      expect(response.status).toBe(400);
      expect(response.data.error).toBe(ErrorType.VALIDATION);
      expect(response.data.message).toBe('Validation failed');
      expect(response.data.validationErrors).toEqual(validationErrors);
    });
  });
});