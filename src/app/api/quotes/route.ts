import {
  getQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  getQuotesWithFilters,
} from '@/lib/db';
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import type { QuoteInput, QuotesQueryParams } from '@/types';

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
  data: any,
  requireAllFields = true
): { valid: boolean; message?: string } => {
  if (!data) {
    return { valid: false, message: 'Request body is required' };
  }

  // Validate required fields
  if (requireAllFields) {
    if (!data.text) return { valid: false, message: 'Quote text is required' };
  }

  // Validate text if provided
  if (data.text !== undefined) {
    if (typeof data.text !== 'string' || data.text.trim().length === 0) {
      return { valid: false, message: 'Quote text must be a non-empty string' };
    }
  }

  // Validate author if provided (can be null or a string)
  if (data.author !== undefined && data.author !== null && typeof data.author !== 'string') {
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
        return setCacheHeaders(NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 }));
      }

      console.log(`API Route: Fetching quote with ID: ${quoteId}`);
      const data = await getQuote(quoteId);

      if (!data) {
        return setCacheHeaders(NextResponse.json({ error: 'Quote not found' }, { status: 404 }));
      }

      console.log(`API Route: Successfully fetched quote with ID: ${quoteId}`);
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

      console.log('API Route: Using advanced query with filters:', queryParams);

      // Fetch filtered, sorted, and paginated quotes
      const paginatedResult = await getQuotesWithFilters(queryParams);

      console.log(
        `API Route: Successfully fetched ${paginatedResult.data.length} quotes (page ${paginatedResult.currentPage} of ${paginatedResult.totalPages})`
      );

      return setCacheHeaders(NextResponse.json(paginatedResult));
    } else {
      // Legacy mode: fetch all quotes without filtering
      console.log('API Route: Fetching all quotes (legacy mode)');
      const quotes = await getQuotes();

      console.log(`API Route: Successfully fetched ${quotes.length} quotes`);
      return setCacheHeaders(NextResponse.json(quotes));
    }
  } catch (error) {
    console.error('API Route: Error fetching quotes:', error);
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to fetch quotes', details: String(error) },
        { status: 500 }
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
      data = await request.json();
    } catch (error) {
      console.error('API Route: Error parsing JSON:', error);
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

    console.log(`API Route: Successfully created quote with ID: ${quote.id}`);
    return setCacheHeaders(NextResponse.json(quote, { status: 201 }));
  } catch (error) {
    console.error('API Route: Error creating quote:', error);
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to create quote', details: String(error) },
        { status: 500 }
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
      data = await request.json();
    } catch (error) {
      console.error('API Route: Error parsing JSON:', error);
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

    console.log(`API Route: Successfully updated quote with ID: ${quote.id}`);
    return setCacheHeaders(NextResponse.json(quote));
  } catch (error) {
    console.error('API Route: Error updating quote:', error);
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
    console.log('API Route: Deleting quote');

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

    console.log(`API Route: Successfully deleted quote with ID: ${quoteId}`);
    return setCacheHeaders(
      NextResponse.json({ success: true, message: `Quote with ID ${quoteId} deleted successfully` })
    );
  } catch (error) {
    console.error('API Route: Error deleting quote:', error);
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to delete quote', details: String(error) },
        { status: 500 }
      )
    );
  }
}
