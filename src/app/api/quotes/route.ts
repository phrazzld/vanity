import { getQuotes, getQuote, createQuote, updateQuote, deleteQuote, getQuotesWithFilters } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import type { QuoteInput, QuotesQueryParams } from '@/types';
import { csrfProtection } from '../middleware/csrf';
import { tokenProtection } from '../middleware/token';
import { 
  createErrorResponse, 
  createValidationErrorResponse,
  ErrorType 
} from '@/app/utils/error-handler';

// Disable caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Helper function to set cache headers
const setCacheHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
};

/**
 * Validates quote input data for API operations
 * 
 * Enhanced validation that performs comprehensive checks on quote data:
 * - Verifies presence of required fields (text) when creating a new quote
 * - Validates data types for all fields
 * - Enforces format and length requirements
 * - Prevents XSS by disallowing HTML/script tags in text
 * - Validates against empty or whitespace-only strings
 * - Provides detailed field-specific error messages
 * - Returns structured validation errors for API response
 *
 * @param {any} data - The data to validate, typically from request body
 * @param {boolean} requireAllFields - Whether to require all mandatory fields (for POST vs PUT)
 * @returns {{ valid: boolean; message?: string; errors?: Record<string, string> }} Validation result with detailed errors
 */
const validateQuoteInput = (data: any, requireAllFields = true): { 
  valid: boolean; 
  message?: string;
  errors?: Record<string, string>;
} => {
  if (!data) {
    return { valid: false, message: 'Request body is required' };
  }
  
  const errors: Record<string, string> = {};
  
  // Validate required fields for new quotes (POST requests)
  if (requireAllFields) {
    if (!data.text) errors.text = 'Quote text is required';
  }
  
  // Validate text if provided
  if (data.text !== undefined) {
    // Type validation
    if (typeof data.text !== 'string') {
      errors.text = 'Quote text must be a string';
    } else {
      // Content validation
      if (data.text.trim().length === 0) {
        errors.text = 'Quote text cannot be empty';
      } else if (data.text.length > 1000) {
        errors.text = 'Quote text must be less than 1000 characters';
      }
      
      // Security validation - simple check for script tags or suspicious HTML
      if (/<script|javascript:|on\w+\s*=|<iframe|<img|<svg|alert\s*\(|eval\s*\(/.test(data.text)) {
        errors.text = 'Quote text contains potentially unsafe content';
      }
    }
  }
  
  // Validate author if provided (can be null or a string)
  if (data.author !== undefined) {
    if (data.author === '') {
      // Empty strings should be converted to null for consistency
      data.author = null;
    } else if (data.author !== null) {
      // Type validation
      if (typeof data.author !== 'string') {
        errors.author = 'Author must be a string or null';
      } else {
        // Content validation
        if (data.author.trim().length === 0) {
          errors.author = 'Author cannot be empty or only whitespace';
        } else if (data.author.length > 100) {
          errors.author = 'Author must be less than 100 characters';
        }
        
        // Security validation - simple check for script tags or suspicious HTML
        if (/<script|javascript:|on\w+\s*=|<iframe|<img|<svg|alert\s*\(|eval\s*\(/.test(data.author)) {
          errors.author = 'Author contains potentially unsafe content';
        }
      }
    }
  }
  
  // Check for any additional unexpected fields (optional security measure)
  const allowedFields = ['text', 'author'];
  const unexpectedFields = Object.keys(data).filter(key => !allowedFields.includes(key));
  if (unexpectedFields.length > 0) {
    errors._unexpected = `Unexpected fields found: ${unexpectedFields.join(', ')}`;
  }
  
  // Check if there are any validation errors
  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      message: 'Validation failed',
      errors
    };
  }
  
  // All validations passed
  return { valid: true };
};

/**
 * GET - Fetch quotes with various query patterns:
 * 
 * 1. GET /api/quotes?id={id} - Returns a specific quote by ID
 * 2. GET /api/quotes - Returns all quotes (default behavior, no filtering)
 * 3. GET /api/quotes?search={term}&sortBy={field}&sortOrder={asc|desc}&limit={n}&offset={n}
 *    - Returns filtered, sorted, and paginated quotes
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: Fetching quotes from database...');
    
    // Parse the URL to check for query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    // Single quote request with ID parameter
    if (id) {
      // Convert ID to number
      const quoteId = parseInt(id, 10);
      if (isNaN(quoteId)) {
        return setCacheHeaders(
          createErrorResponse(
            new Error(`Invalid quote ID: ${id}`),
            ErrorType.VALIDATION,
            'Invalid quote ID'
          )
        );
      }
      
      console.log(`API Route: Fetching quote with ID: ${quoteId}`);
      const data = await getQuote(quoteId);
      
      if (!data) {
        return setCacheHeaders(
          createErrorResponse(
            new Error(`Quote with ID ${quoteId} not found`),
            ErrorType.NOT_FOUND,
            'Quote not found'
          )
        );
      }

      console.log(`API Route: Successfully fetched quote with ID: ${quoteId}`);
      return setCacheHeaders(NextResponse.json(data));
    }
    
    // Check if any search/filter/sort/pagination params are present
    const hasAdvancedParams = url.searchParams.has('search') || 
                             url.searchParams.has('sortBy') || 
                             url.searchParams.has('sortOrder') ||
                             url.searchParams.has('limit') ||
                             url.searchParams.has('offset');
    
    if (hasAdvancedParams) {
      // Extract query parameters
      const queryParams: QuotesQueryParams = {
        search: url.searchParams.get('search') || '',
        sortBy: url.searchParams.get('sortBy') as 'author' | 'id' || 'id',
        sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
        limit: url.searchParams.has('limit') 
          ? Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '10', 10))) 
          : 10,
        offset: url.searchParams.has('offset')
          ? Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10))
          : 0
      };
      
      console.log('API Route: Using advanced query with filters:', queryParams);
      
      // Fetch filtered, sorted, and paginated quotes
      const paginatedResult = await getQuotesWithFilters(queryParams);
      
      console.log(`API Route: Successfully fetched ${paginatedResult.data.length} quotes (page ${paginatedResult.currentPage} of ${paginatedResult.totalPages})`);
      
      return setCacheHeaders(NextResponse.json(paginatedResult));
    } else {
      // Legacy mode: fetch all quotes without filtering
      console.log('API Route: Fetching all quotes (legacy mode)');
      const quotes = await getQuotes();
      
      console.log(`API Route: Successfully fetched ${quotes.length} quotes`);
      return setCacheHeaders(NextResponse.json(quotes));
    }
  } catch (error) {
    return setCacheHeaders(
      createErrorResponse(
        error,
        ErrorType.SERVER,
        'Failed to fetch quotes'
      )
    );
  }
}

/**
 * POST - Create a new quote
 */
export async function POST(request: NextRequest) {
  try {
    console.log('API Route: Creating new quote');
    
    // Validate CSRF token
    const csrfError = await csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }
    
    // Validate API token
    const tokenError = await tokenProtection(request);
    if (tokenError) {
      return setCacheHeaders(tokenError);
    }
    
    // Parse request body
    let data: QuoteInput;
    try {
      data = await request.json();
    } catch (error) {
      console.error('API Route: Error parsing JSON:', error);
      return setCacheHeaders(NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      ));
    }
    
    // Validate data
    const validation = validateQuoteInput(data, true);
    if (!validation.valid) {
      return setCacheHeaders(
        createValidationErrorResponse(validation.message || 'Validation failed', validation.errors || {})
      );
    }
    
    // Create quote
    const quote = await createQuote(data);
    if (!quote) {
      return setCacheHeaders(
        createErrorResponse(
          new Error('Database operation failed to return a quote'), 
          ErrorType.DATABASE,
          'Failed to create quote'
        )
      );
    }
    
    console.log(`API Route: Successfully created quote with ID: ${quote.id}`);
    return setCacheHeaders(NextResponse.json(quote, { status: 201 }));
  } catch (error) {
    return setCacheHeaders(
      createErrorResponse(
        error, 
        ErrorType.SERVER, 
        'Failed to create quote'
      )
    );
  }
}

/**
 * PUT - Update an existing quote
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('API Route: Updating quote');
    
    // Validate CSRF token
    const csrfError = await csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }
    
    // Validate API token
    const tokenError = await tokenProtection(request);
    if (tokenError) {
      return setCacheHeaders(tokenError);
    }
    
    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return setCacheHeaders(
        createErrorResponse(
          new Error('Missing required ID parameter'),
          ErrorType.VALIDATION,
          'ID parameter is required'
        )
      );
    }
    
    // Convert ID to number
    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return setCacheHeaders(
        createErrorResponse(
          new Error(`Invalid quote ID: ${id}`),
          ErrorType.VALIDATION,
          'Invalid quote ID'
        )
      );
    }
    
    // Parse request body
    let data: Partial<QuoteInput>;
    try {
      data = await request.json();
    } catch (error) {
      console.error('API Route: Error parsing JSON:', error);
      return setCacheHeaders(NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      ));
    }
    
    // Validate data
    const validation = validateQuoteInput(data, false);
    if (!validation.valid) {
      return setCacheHeaders(
        createValidationErrorResponse(validation.message || 'Validation failed', validation.errors || {})
      );
    }
    
    // Update quote
    const quote = await updateQuote(quoteId, data);
    if (!quote) {
      return setCacheHeaders(
        createErrorResponse(
          new Error(`Quote with ID ${quoteId} not found`),
          ErrorType.NOT_FOUND,
          'Quote not found'
        )
      );
    }
    
    console.log(`API Route: Successfully updated quote with ID: ${quote.id}`);
    return setCacheHeaders(NextResponse.json(quote));
  } catch (error) {
    return setCacheHeaders(
      createErrorResponse(
        error,
        ErrorType.SERVER,
        'Failed to update quote'
      )
    );
  }
}

/**
 * DELETE - Delete a quote
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('API Route: Deleting quote');
    
    // Validate CSRF token
    const csrfError = await csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }
    
    // Validate API token
    const tokenError = await tokenProtection(request);
    if (tokenError) {
      return setCacheHeaders(tokenError);
    }
    
    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return setCacheHeaders(
        createErrorResponse(
          new Error('Missing required ID parameter'),
          ErrorType.VALIDATION,
          'ID parameter is required'
        )
      );
    }
    
    // Convert ID to number
    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return setCacheHeaders(
        createErrorResponse(
          new Error(`Invalid quote ID: ${id}`),
          ErrorType.VALIDATION,
          'Invalid quote ID'
        )
      );
    }
    
    // Delete quote
    const success = await deleteQuote(quoteId);
    if (!success) {
      return setCacheHeaders(
        createErrorResponse(
          new Error(`Quote with ID ${quoteId} not found`),
          ErrorType.NOT_FOUND,
          'Quote not found'
        )
      );
    }
    
    console.log(`API Route: Successfully deleted quote with ID: ${quoteId}`);
    return setCacheHeaders(NextResponse.json(
      { success: true, message: `Quote with ID ${quoteId} deleted successfully` }
    ));
  } catch (error) {
    return setCacheHeaders(
      createErrorResponse(
        error,
        ErrorType.SERVER,
        'Failed to delete quote'
      )
    );
  }
}