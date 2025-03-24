/**
 * Centralized error handling utility
 * 
 * This module provides functions for consistent error handling across the application,
 * with environment-specific behavior for enhanced security in production.
 */

import { NextResponse } from 'next/server';

// Error types for standardized categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  DATABASE = 'DATABASE_ERROR',
  SERVER = 'SERVER_ERROR',
  EXTERNAL = 'EXTERNAL_SERVICE_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// Status code mapping for error types
const errorStatusCodes: Record<ErrorType, number> = {
  [ErrorType.VALIDATION]: 400,
  [ErrorType.AUTHENTICATION]: 401,
  [ErrorType.AUTHORIZATION]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.DATABASE]: 500,
  [ErrorType.SERVER]: 500,
  [ErrorType.EXTERNAL]: 503,
  [ErrorType.UNKNOWN]: 500
};

// Interface for standardized error responses
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  type?: string;
  stack?: string;
}

/**
 * Determines if the application is running in production mode
 * 
 * @returns boolean indicating if the environment is production
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Logs an error with appropriate detail level based on environment
 * 
 * @param error - The error to log
 * @param context - Additional context about where the error occurred
 */
export function logError(error: Error | unknown, context?: string): void {
  // Always log the context and basic error information
  const contextPrefix = context ? `[${context}] ` : '';
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  console.error(`${contextPrefix}Error: ${errorMessage}`);
  
  // In development, log the full stack trace
  if (!isProduction() && error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}

/**
 * Formats an error for API responses, masking details in production
 * 
 * @param error - The error to format
 * @param type - The type of error for categorization
 * @param publicMessage - Optional user-friendly message to show in production
 * @returns Formatted error response object
 */
export function formatError(
  error: Error | unknown,
  type: ErrorType = ErrorType.UNKNOWN,
  publicMessage?: string
): ErrorResponse {
  const isProd = isProduction();
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Base error response
  const errorResponse: ErrorResponse = {
    error: type,
    // In production, use the public message if provided, otherwise a generic message
    message: isProd 
      ? (publicMessage || 'An error occurred while processing your request') 
      : errorMessage
  };
  
  // Add details in development only
  if (!isProd) {
    // Include the original error message if a public message was provided
    if (publicMessage) {
      errorResponse.details = errorMessage;
    }
    
    // Include stack trace in development
    if (error instanceof Error && error.stack) {
      errorResponse.stack = error.stack;
    }
  }
  
  return errorResponse;
}

/**
 * Creates a NextResponse with proper status code and formatted error
 * 
 * @param error - The error to format
 * @param type - The type of error for categorization
 * @param publicMessage - Optional user-friendly message to show in production
 * @param headers - Optional headers to include in the response
 * @returns NextResponse with formatted error
 */
export function createErrorResponse(
  error: Error | unknown,
  type: ErrorType = ErrorType.UNKNOWN,
  publicMessage?: string,
  headers?: HeadersInit
): NextResponse {
  // Log the error
  logError(error, type);
  
  // Format the error
  const formattedError = formatError(error, type, publicMessage);
  
  // Get the appropriate status code
  const statusCode = errorStatusCodes[type];
  
  // Create and return the response
  const response = NextResponse.json(formattedError, { status: statusCode });
  
  // Add any custom headers
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

/**
 * Creates a validation error response with field-specific errors
 * 
 * @param message - The main error message
 * @param validationErrors - Field-specific validation errors
 * @returns NextResponse with formatted validation error
 */
export function createValidationErrorResponse(
  message: string, 
  validationErrors: Record<string, string>
): NextResponse {
  const errorResponse = {
    error: ErrorType.VALIDATION,
    message,
    validationErrors
  };
  
  return NextResponse.json(errorResponse, { status: 400 });
}