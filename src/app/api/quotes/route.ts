import {
  getQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  getQuotesWithFilters,
} from '@/lib/db';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { QuoteInput, QuotesQueryParams } from '@/types';
import { logger, createLogContext, CorrelationContext } from '@/lib/logger';
import { nanoid } from 'nanoid';

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

// Helper for validating quote input data
const validateQuoteInput = (
  data: unknown,
  requireAllFields = true
): { valid: boolean; message?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'Request body is required' };
  }

  const inputData = data as Record<string, unknown>;

  // Validate required fields
  if (requireAllFields) {
    if (!inputData.text) return { valid: false, message: 'Quote text is required' };
  }

  // Validate text if provided
  if (inputData.text !== undefined) {
    if (typeof inputData.text !== 'string' || inputData.text.trim().length === 0) {
      return { valid: false, message: 'Quote text must be a non-empty string' };
    }
  }

  // Validate author if provided (can be null or a string)
  if (
    inputData.author !== undefined &&
    inputData.author !== null &&
    typeof inputData.author !== 'string'
  ) {
    return { valid: false, message: 'Author must be a string or null' };
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
  const startTime = Date.now();

  // Set correlation ID for request tracking
  const correlationId = request.headers.get('x-correlation-id') || nanoid();
  CorrelationContext.set(correlationId);

  logger.http(
    'API request received',
    createLogContext('api/quotes', 'GET', {
      url: request.url,
      method: 'GET',
      user_agent: request.headers.get('user-agent'),
      correlation_id: correlationId,
    })
  );

  try {
    // Parse the URL to check for query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    // Single quote request with ID parameter
    if (id) {
      // Convert ID to number
      const quoteId = parseInt(id, 10);
      if (isNaN(quoteId)) {
        return setCacheHeaders(NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 }));
      }

      logger.info(
        'Fetching single quote by ID',
        createLogContext('api/quotes', 'GET', { quote_id: quoteId, request_type: 'single' })
      );
      const data = await getQuote(quoteId);

      if (!data) {
        return setCacheHeaders(NextResponse.json({ error: 'Quote not found' }, { status: 404 }));
      }

      logger.http(
        'Successfully fetched single quote',
        createLogContext('api/quotes', 'GET', {
          quote_id: quoteId,
          quote_author: data.author,
          response_status: 200,
          duration: Date.now() - startTime,
        })
      );
      return setCacheHeaders(NextResponse.json(data));
    }

    // Check if any search/filter/sort/pagination params are present
    const hasAdvancedParams =
      url.searchParams.has('search') ||
      url.searchParams.has('sortBy') ||
      url.searchParams.has('sortOrder') ||
      url.searchParams.has('limit') ||
      url.searchParams.has('offset');

    if (hasAdvancedParams) {
      // Extract query parameters
      const queryParams: QuotesQueryParams = {
        search: url.searchParams.get('search') || '',
        sortBy: (url.searchParams.get('sortBy') as 'author' | 'id') || 'id',
        sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
        limit: url.searchParams.has('limit')
          ? Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '10', 10)))
          : 10,
        offset: url.searchParams.has('offset')
          ? Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10))
          : 0,
      };

      logger.info(
        'Using advanced query with filters',
        createLogContext('api/quotes', 'GET', {
          search_query: queryParams.search,
          sort_by: queryParams.sortBy,
          sort_order: queryParams.sortOrder,
          limit: queryParams.limit,
          offset: queryParams.offset,
          request_type: 'filtered',
        })
      );

      // Fetch filtered, sorted, and paginated quotes
      const paginatedResult = await getQuotesWithFilters(queryParams);

      logger.http(
        'Successfully fetched filtered quotes',
        createLogContext('api/quotes', 'GET', {
          quotes_count: paginatedResult.data.length,
          current_page: paginatedResult.currentPage,
          total_pages: paginatedResult.totalPages,
          total_count: paginatedResult.totalCount,
          response_status: 200,
          duration: Date.now() - startTime,
        })
      );

      return setCacheHeaders(NextResponse.json(paginatedResult));
    } else {
      // Legacy mode: fetch all quotes without filtering
      logger.info(
        'Fetching all quotes in legacy mode',
        createLogContext('api/quotes', 'GET', { request_type: 'legacy_all' })
      );
      const quotes = await getQuotes();

      logger.http(
        'Successfully fetched all quotes',
        createLogContext('api/quotes', 'GET', {
          quotes_count: quotes.length,
          request_type: 'legacy_all',
          response_status: 200,
          duration: Date.now() - startTime,
        })
      );
      return setCacheHeaders(NextResponse.json(quotes));
    }
  } catch (error) {
    logger.error(
      'API error occurred',
      createLogContext('api/quotes', 'GET', {
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        request_url: request.url,
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to fetch quotes', details: String(error) },
        { status: 500 }
      )
    );
  } finally {
    // Clear correlation context after request
    CorrelationContext.clear();
  }
}

/**
 * POST - Create a new quote
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const correlationId = request.headers.get('x-correlation-id') || nanoid();
  CorrelationContext.set(correlationId);

  logger.http(
    'API request received',
    createLogContext('api/quotes', 'POST', {
      url: request.url,
      method: 'POST',
      correlation_id: correlationId,
    })
  );

  try {
    // Check if user is authenticated
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      );
    }

    // Parse request body
    let data: QuoteInput;
    try {
      data = (await request.json()) as QuoteInput;
    } catch (error) {
      logger.error(
        'JSON parsing error',
        createLogContext('api/quotes', 'POST', {
          error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        }),
        error instanceof Error ? error : new Error(String(error))
      );
      return setCacheHeaders(
        NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
      );
    }

    // Validate data
    const validation = validateQuoteInput(data, true);
    if (!validation.valid) {
      return setCacheHeaders(NextResponse.json({ error: validation.message }, { status: 400 }));
    }

    // Create quote
    const quote = await createQuote(data);
    if (!quote) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
      );
    }

    logger.http(
      'Successfully created quote',
      createLogContext('api/quotes', 'POST', {
        quote_id: quote.id,
        quote_author: quote.author,
        response_status: 201,
        duration: Date.now() - startTime,
      })
    );
    return setCacheHeaders(NextResponse.json(quote, { status: 201 }));
  } catch (error) {
    logger.error(
      'API error occurred',
      createLogContext('api/quotes', 'POST', {
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to create quote', details: String(error) },
        { status: 500 }
      )
    );
  } finally {
    CorrelationContext.clear();
  }
}

/**
 * PUT - Update an existing quote
 */
export async function PUT(request: NextRequest) {
  try {
    // Updating quote logged in function setup

    // Check if user is authenticated
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      );
    }

    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return setCacheHeaders(
        NextResponse.json({ error: 'ID parameter is required' }, { status: 400 })
      );
    }

    // Convert ID to number
    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return setCacheHeaders(NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 }));
    }

    // Parse request body
    let data: Partial<QuoteInput>;
    try {
      data = (await request.json()) as Partial<QuoteInput>;
    } catch {
      // JSON parsing error logged elsewhere
      return setCacheHeaders(
        NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
      );
    }

    // Validate data
    const validation = validateQuoteInput(data, false);
    if (!validation.valid) {
      return setCacheHeaders(NextResponse.json({ error: validation.message }, { status: 400 }));
    }

    // Update quote
    const quote = await updateQuote(quoteId, data);
    if (!quote) {
      return setCacheHeaders(NextResponse.json({ error: 'Quote not found' }, { status: 404 }));
    }

    // Successfully updated quote logged elsewhere
    return setCacheHeaders(NextResponse.json(quote));
  } catch (error) {
    // Error updating quote logged elsewhere
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to update quote', details: String(error) },
        { status: 500 }
      )
    );
  }
}

/**
 * DELETE - Delete a quote
 */
export async function DELETE(request: NextRequest) {
  try {
    // Deleting quote logged elsewhere

    // Check if user is authenticated
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      );
    }

    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return setCacheHeaders(
        NextResponse.json({ error: 'ID parameter is required' }, { status: 400 })
      );
    }

    // Convert ID to number
    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return setCacheHeaders(NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 }));
    }

    // Delete quote
    const success = await deleteQuote(quoteId);
    if (!success) {
      return setCacheHeaders(NextResponse.json({ error: 'Quote not found' }, { status: 404 }));
    }

    // Successfully deleted quote logged elsewhere
    return setCacheHeaders(
      NextResponse.json({ success: true, message: `Quote with ID ${quoteId} deleted successfully` })
    );
  } catch (error) {
    // Error deleting quote logged elsewhere
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to delete quote', details: String(error) },
        { status: 500 }
      )
    );
  }
}
