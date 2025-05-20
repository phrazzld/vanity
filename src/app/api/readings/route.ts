/**
 * @file API route handlers for readings resource
 * @module api/readings
 *
 * This file defines the API endpoints for managing readings:
 * - GET: Fetch all readings or a specific reading by slug
 * - POST: Create a new reading
 * - PUT: Update an existing reading
 * - DELETE: Remove a reading
 *
 * All endpoints perform validation and return appropriate status codes
 * and error messages when necessary.
 */

import {
  getReadings,
  getReading,
  createReading,
  updateReading,
  deleteReading,
  getReadingsWithFilters,
} from '@/lib/db';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { ReadingInput, ReadingsQueryParams } from '@/types';

/**
 * Next.js configuration options to disable caching for this API route
 * Ensures that data is always fresh and not stale from edge or browser caches
 */
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * Sets cache control headers on the response to prevent caching
 *
 * @param {NextResponse} response - The response object to modify
 * @returns {NextResponse} The response with cache-prevention headers
 */
const setCacheHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
};

/**
 * Validates reading input data for API operations
 *
 * Performs validation checks on reading data to ensure it meets requirements:
 * - Verifies presence of required fields when creating a new reading
 * - Validates data types and formats (e.g., URL-friendly slugs)
 * - Checks that strings are non-empty and dates are valid
 *
 * @param {any} data - The data to validate, typically from request body
 * @param {boolean} requireAllFields - Whether to require all mandatory fields (for POST vs PUT)
 * @returns {{ valid: boolean; message?: string }} Validation result with error message if invalid
 */
const validateReadingInput = (
  data: unknown,
  requireAllFields = true
): { valid: boolean; message?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'Request body is required' };
  }

  const inputData = data as Record<string, unknown>;

  // Validate required fields for new readings (POST requests)
  if (requireAllFields) {
    if (!inputData.slug) return { valid: false, message: 'Slug is required' };
    if (!inputData.title) return { valid: false, message: 'Title is required' };
    if (!inputData.author) return { valid: false, message: 'Author is required' };
  }

  // Validate slug format if provided
  if (inputData.slug !== undefined) {
    if (typeof inputData.slug !== 'string') {
      return { valid: false, message: 'Slug must be a string' };
    }
    // Ensure slugs are URL-friendly (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(inputData.slug)) {
      return {
        valid: false,
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      };
    }
  }

  // Validate title is a non-empty string if provided
  if (
    inputData.title !== undefined &&
    (typeof inputData.title !== 'string' || inputData.title.length < 1)
  ) {
    return { valid: false, message: 'Title must be a non-empty string' };
  }

  // Validate author is a non-empty string if provided
  if (
    inputData.author !== undefined &&
    (typeof inputData.author !== 'string' || inputData.author.length < 1)
  ) {
    return { valid: false, message: 'Author must be a non-empty string' };
  }

  // Validate finishedDate can be parsed as a date if provided
  if (inputData.finishedDate !== undefined && inputData.finishedDate !== null) {
    try {
      new Date(inputData.finishedDate as string | Date);
    } catch {
      return { valid: false, message: 'Invalid date format for finishedDate' };
    }
  }

  // All validations passed
  return { valid: true };
};

/**
 * GET handler for readings API
 *
 * Handles these request patterns:
 * 1. GET /api/readings?slug={slug} - Returns a specific reading by slug
 * 2. GET /api/readings - Returns all readings (default ordering, no filtering)
 * 3. GET /api/readings?search={search}&status={status}&sortBy={field}&sortOrder={asc|desc}&limit={n}&offset={n}
 *    - Returns filtered, sorted, and paginated readings
 *
 * @param {NextRequest} request - The incoming HTTP request
 * @returns {Promise<NextResponse>} JSON response with reading data or error details
 *
 * @example
 * // Fetch all readings (legacy/simple mode)
 * fetch('/api/readings')
 *
 * @example
 * // Fetch a specific reading
 * fetch('/api/readings?slug=some-book-title')
 *
 * @example
 * // Fetch filtered and paginated readings
 * fetch('/api/readings?search=tolkien&status=read&sortBy=title&sortOrder=asc&limit=10&offset=0')
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: Fetching readings from database...');

    // Parse the URL to check for query parameters
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    // Single reading request with slug parameter
    if (slug) {
      console.log(`API Route: Fetching reading with slug: ${slug}`);
      const data = await getReading(slug);

      // Return 404 if reading not found
      if (!data) {
        return setCacheHeaders(NextResponse.json({ error: 'Reading not found' }, { status: 404 }));
      }

      console.log(`API Route: Successfully fetched reading: ${data.title}`);
      return setCacheHeaders(NextResponse.json(data));
    }

    // Check if any search/filter/sort/pagination params are present
    const hasAdvancedParams =
      url.searchParams.has('search') ||
      url.searchParams.has('status') ||
      url.searchParams.has('sortBy') ||
      url.searchParams.has('sortOrder') ||
      url.searchParams.has('limit') ||
      url.searchParams.has('offset');

    if (hasAdvancedParams) {
      // Extract query parameters
      const queryParams: ReadingsQueryParams = {
        search: url.searchParams.get('search') || '',
        status: (url.searchParams.get('status') as 'read' | 'dropped' | 'all') || undefined,
        sortBy: (url.searchParams.get('sortBy') as 'date' | 'title' | 'author') || 'date',
        sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
        limit: url.searchParams.has('limit')
          ? Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '10', 10)))
          : 10,
        offset: url.searchParams.has('offset')
          ? Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10))
          : 0,
      };

      console.log('API Route: Using advanced query with filters:', queryParams);

      // Fetch filtered, sorted, and paginated readings
      const paginatedResult = await getReadingsWithFilters(queryParams);

      console.log(
        `API Route: Successfully fetched ${paginatedResult.data.length} readings (page ${paginatedResult.currentPage} of ${paginatedResult.totalPages})`
      );

      return setCacheHeaders(NextResponse.json(paginatedResult));
    } else {
      // Legacy mode: fetch all readings with default ordering
      console.log('API Route: Fetching all readings (legacy mode)');
      const readings = await getReadings();

      console.log(`API Route: Successfully fetched ${readings.length} readings`);
      return setCacheHeaders(NextResponse.json(readings));
    }
  } catch (error) {
    // Handle and log any errors that occur
    console.error('API Route: Error fetching readings:', error);
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to fetch readings', details: String(error) },
        { status: 500 }
      )
    );
  }
}

/**
 * POST handler for readings API - Create a new reading
 *
 * Creates a new reading record in the database with the provided data.
 * Requires authentication via Bearer token and validates input data.
 *
 * @param {NextRequest} request - The incoming HTTP request with reading data in body
 * @returns {Promise<NextResponse>} JSON response with created reading or error details
 *
 * @example
 * // Create a new reading
 * fetch('/api/readings', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': 'Bearer your-token'
 *   },
 *   body: JSON.stringify({
 *     slug: 'book-title',
 *     title: 'Book Title',
 *     author: 'Author Name',
 *     // other optional fields
 *   })
 * })
 */
export async function POST(request: NextRequest) {
  try {
    console.log('API Route: Creating new reading');

    // Verify authentication via Authorization header
    // In a production app, this would use NextAuth or similar for session validation
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      );
    }

    // Parse and validate the request body
    let data: ReadingInput;
    try {
      data = (await request.json()) as ReadingInput;
    } catch (error) {
      console.error('API Route: Error parsing JSON:', error);
      return setCacheHeaders(
        NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
      );
    }

    // Validate the reading data (requiring all mandatory fields)
    const validation = validateReadingInput(data, true);
    if (!validation.valid) {
      return setCacheHeaders(NextResponse.json({ error: validation.message }, { status: 400 }));
    }

    // Attempt to create the reading in the database
    const reading = await createReading(data);
    if (!reading) {
      return setCacheHeaders(
        NextResponse.json(
          { error: 'Failed to create reading, slug may already exist' },
          { status: 409 } // Conflict status code for duplicate resource
        )
      );
    }

    console.log(`API Route: Successfully created reading: ${reading.title}`);
    return setCacheHeaders(NextResponse.json(reading, { status: 201 }));
  } catch (error) {
    console.error('API Route: Error creating reading:', error);
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to create reading', details: String(error) },
        { status: 500 }
      )
    );
  }
}

/**
 * PUT handler for readings API - Update an existing reading
 *
 * Updates a reading record in the database identified by its slug.
 * Requires authentication and validates input data.
 *
 * @param {NextRequest} request - The incoming HTTP request with updated reading data
 * @returns {Promise<NextResponse>} JSON response with updated reading or error details
 *
 * @example
 * // Update an existing reading
 * fetch('/api/readings?slug=existing-slug', {
 *   method: 'PUT',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': 'Bearer your-token'
 *   },
 *   body: JSON.stringify({
 *     title: 'Updated Title',
 *     // other fields to update
 *   })
 * })
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('API Route: Updating reading');

    // Check if user is authenticated
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      );
    }

    // Get slug from query parameters
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
      );
    }

    // Parse request body
    let data: Partial<ReadingInput>;
    try {
      data = (await request.json()) as Partial<ReadingInput>;
    } catch (error) {
      console.error('API Route: Error parsing JSON:', error);
      return setCacheHeaders(
        NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
      );
    }

    // Validate data
    const validation = validateReadingInput(data, false);
    if (!validation.valid) {
      return setCacheHeaders(NextResponse.json({ error: validation.message }, { status: 400 }));
    }

    // Update reading
    const reading = await updateReading(slug, data);
    if (!reading) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Reading not found or slug conflict' }, { status: 404 })
      );
    }

    console.log(`API Route: Successfully updated reading: ${reading.title}`);
    return setCacheHeaders(NextResponse.json(reading));
  } catch (error) {
    console.error('API Route: Error updating reading:', error);
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to update reading', details: String(error) },
        { status: 500 }
      )
    );
  }
}

/**
 * DELETE handler for readings API - Remove a reading
 *
 * Deletes a reading record from the database identified by its slug.
 * Requires authentication.
 *
 * @param {NextRequest} request - The incoming HTTP request with slug query parameter
 * @returns {Promise<NextResponse>} JSON response confirming deletion or error details
 *
 * @example
 * // Delete a reading
 * fetch('/api/readings?slug=book-to-delete', {
 *   method: 'DELETE',
 *   headers: {
 *     'Authorization': 'Bearer your-token'
 *   }
 * })
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('API Route: Deleting reading');

    // Check if user is authenticated
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      );
    }

    // Get slug from query parameters
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return setCacheHeaders(
        NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
      );
    }

    // Delete reading
    const success = await deleteReading(slug);
    if (!success) {
      return setCacheHeaders(NextResponse.json({ error: 'Reading not found' }, { status: 404 }));
    }

    console.log(`API Route: Successfully deleted reading with slug: ${slug}`);
    return setCacheHeaders(
      NextResponse.json({
        success: true,
        message: `Reading with slug '${slug}' deleted successfully`,
      })
    );
  } catch (error) {
    console.error('API Route: Error deleting reading:', error);
    return setCacheHeaders(
      NextResponse.json(
        { error: 'Failed to delete reading', details: String(error) },
        { status: 500 }
      )
    );
  }
}
