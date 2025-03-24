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

import { getReadings, getReading, createReading, updateReading, deleteReading, getReadingsWithFilters } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import type { ReadingInput, ReadingsQueryParams } from '@/types';
import { csrfProtection } from '../middleware/csrf';
import { tokenProtection } from '../middleware/token';

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
 * Enhanced validation that performs extensive checks on reading data:
 * - Verifies presence of required fields when creating a new reading
 * - Validates data types for all fields
 * - Enforces format requirements (e.g., URL-friendly slugs)
 * - Sets maximum lengths for string fields
 * - Validates dates and boolean values
 * - Verifies that coverImageSrc is a valid URL structure if provided
 * - Returns detailed validation errors with specific field information
 *
 * @param {any} data - The data to validate, typically from request body
 * @param {boolean} requireAllFields - Whether to require all mandatory fields (for POST vs PUT)
 * @returns {{ valid: boolean; message?: string; errors?: Record<string, string> }} Validation result with detailed errors
 */
const validateReadingInput = (data: any, requireAllFields = true): { 
  valid: boolean; 
  message?: string;
  errors?: Record<string, string>;
} => {
  if (!data) {
    return { valid: false, message: 'Request body is required' };
  }
  
  const errors: Record<string, string> = {};
  
  // Validate required fields for new readings (POST requests)
  if (requireAllFields) {
    if (!data.slug) errors.slug = 'Slug is required';
    if (!data.title) errors.title = 'Title is required';
    if (!data.author) errors.author = 'Author is required';
  }
  
  // Validate slug format if provided
  if (data.slug !== undefined) {
    if (typeof data.slug !== 'string') {
      errors.slug = 'Slug must be a string';
    } else {
      if (data.slug.length === 0) {
        errors.slug = 'Slug cannot be empty';
      } else if (data.slug.length > 100) {
        errors.slug = 'Slug must be less than 100 characters';
      } else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(data.slug)) {
        errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens, must start and end with a letter or number, and cannot have consecutive hyphens';
      }
    }
  }
  
  // Validate title if provided
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.title = 'Title must be a string';
    } else if (data.title.length === 0) {
      errors.title = 'Title cannot be empty';
    } else if (data.title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }
  }
  
  // Validate author if provided
  if (data.author !== undefined) {
    if (typeof data.author !== 'string') {
      errors.author = 'Author must be a string';
    } else if (data.author.length === 0) {
      errors.author = 'Author cannot be empty';
    } else if (data.author.length > 100) {
      errors.author = 'Author must be less than 100 characters';
    }
  }
  
  // Validate finishedDate if provided
  if (data.finishedDate !== undefined) {
    if (data.finishedDate !== null) {
      try {
        const date = new Date(data.finishedDate);
        
        // Check if date is valid and not in the future
        if (isNaN(date.getTime())) {
          errors.finishedDate = 'Invalid date format for finishedDate';
        } else if (date > new Date()) {
          errors.finishedDate = 'finishedDate cannot be in the future';
        }
      } catch (error) {
        errors.finishedDate = 'Invalid date format for finishedDate';
      }
    }
  }
  
  // Validate coverImageSrc if provided
  if (data.coverImageSrc !== undefined && data.coverImageSrc !== null) {
    if (typeof data.coverImageSrc !== 'string') {
      errors.coverImageSrc = 'coverImageSrc must be a string';
    } else if (data.coverImageSrc.length > 0) {  // Only validate non-empty strings
      // Basic URL path validation
      if (!/^(\/[a-zA-Z0-9_-]+)+(\.[a-zA-Z0-9]+)?$/.test(data.coverImageSrc)) {
        errors.coverImageSrc = 'coverImageSrc must be a valid path (e.g., /covers/image.jpg)';
      }
    }
  }
  
  // Validate thoughts if provided
  if (data.thoughts !== undefined) {
    if (typeof data.thoughts !== 'string') {
      errors.thoughts = 'Thoughts must be a string';
    } else if (data.thoughts.length > 10000) {
      errors.thoughts = 'Thoughts must be less than 10,000 characters';
    }
  }
  
  // Validate dropped if provided
  if (data.dropped !== undefined) {
    if (typeof data.dropped !== 'boolean') {
      errors.dropped = 'Dropped must be a boolean value';
    }
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
        return setCacheHeaders(NextResponse.json(
          { error: 'Reading not found' },
          { status: 404 }
        ));
      }
      
      console.log(`API Route: Successfully fetched reading: ${data.title}`);
      return setCacheHeaders(NextResponse.json(data));
    } 
    
    // Check if any search/filter/sort/pagination params are present
    const hasAdvancedParams = url.searchParams.has('search') || 
                             url.searchParams.has('status') || 
                             url.searchParams.has('sortBy') || 
                             url.searchParams.has('sortOrder') ||
                             url.searchParams.has('limit') ||
                             url.searchParams.has('offset');
    
    if (hasAdvancedParams) {
      // Extract query parameters
      const queryParams: ReadingsQueryParams = {
        search: url.searchParams.get('search') || '',
        status: url.searchParams.get('status') as 'read' | 'dropped' | 'all' || undefined,
        sortBy: url.searchParams.get('sortBy') as 'date' | 'title' | 'author' || 'date',
        sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
        limit: url.searchParams.has('limit') 
          ? Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '10', 10))) 
          : 10,
        offset: url.searchParams.has('offset')
          ? Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10))
          : 0
      };
      
      console.log('API Route: Using advanced query with filters:', queryParams);
      
      // Fetch filtered, sorted, and paginated readings
      const paginatedResult = await getReadingsWithFilters(queryParams);
      
      console.log(`API Route: Successfully fetched ${paginatedResult.data.length} readings (page ${paginatedResult.currentPage} of ${paginatedResult.totalPages})`);
      
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
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to fetch readings', details: String(error) },
      { status: 500 }
    ));
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
    
    // Parse and validate the request body
    let data: ReadingInput;
    try {
      data = await request.json();
    } catch (error) {
      console.error('API Route: Error parsing JSON:', error);
      return setCacheHeaders(NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      ));
    }
    
    // Validate the reading data (requiring all mandatory fields)
    const validation = validateReadingInput(data, true);
    if (!validation.valid) {
      return setCacheHeaders(NextResponse.json(
        { 
          error: validation.message,
          validationErrors: validation.errors 
        },
        { status: 400 }
      ));
    }
    
    // Attempt to create the reading in the database
    const reading = await createReading(data);
    if (!reading) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Failed to create reading, slug may already exist' },
        { status: 409 } // Conflict status code for duplicate resource
      ));
    }
    
    console.log(`API Route: Successfully created reading: ${reading.title}`);
    return setCacheHeaders(NextResponse.json(reading, { status: 201 }));
  } catch (error) {
    console.error('API Route: Error creating reading:', error);
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to create reading', details: String(error) },
      { status: 500 }
    ));
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
    
    // Get slug from query parameters
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      ));
    }
    
    // Parse request body
    let data: Partial<ReadingInput>;
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
    const validation = validateReadingInput(data, false);
    if (!validation.valid) {
      return setCacheHeaders(NextResponse.json(
        { 
          error: validation.message,
          validationErrors: validation.errors 
        },
        { status: 400 }
      ));
    }
    
    // Update reading
    const reading = await updateReading(slug, data);
    if (!reading) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Reading not found or slug conflict' },
        { status: 404 }
      ));
    }
    
    console.log(`API Route: Successfully updated reading: ${reading.title}`);
    return setCacheHeaders(NextResponse.json(reading));
  } catch (error) {
    console.error('API Route: Error updating reading:', error);
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to update reading', details: String(error) },
      { status: 500 }
    ));
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
    
    // Get slug from query parameters
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      ));
    }
    
    // Delete reading
    const success = await deleteReading(slug);
    if (!success) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Reading not found' },
        { status: 404 }
      ));
    }
    
    console.log(`API Route: Successfully deleted reading with slug: ${slug}`);
    return setCacheHeaders(NextResponse.json(
      { success: true, message: `Reading with slug '${slug}' deleted successfully` }
    ));
  } catch (error) {
    console.error('API Route: Error deleting reading:', error);
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to delete reading', details: String(error) },
      { status: 500 }
    ));
  }
}