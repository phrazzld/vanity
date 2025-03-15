import { getReadings, getReading, createReading, updateReading, deleteReading } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import type { ReadingInput } from '@/types';

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

// Helper for validating reading input data
const validateReadingInput = (data: any, requireAllFields = true): { valid: boolean; message?: string } => {
  if (!data) {
    return { valid: false, message: 'Request body is required' };
  }
  
  // Validate required fields
  if (requireAllFields) {
    if (!data.slug) return { valid: false, message: 'Slug is required' };
    if (!data.title) return { valid: false, message: 'Title is required' };
    if (!data.author) return { valid: false, message: 'Author is required' };
  }
  
  // Validate slug format if provided
  if (data.slug !== undefined) {
    if (typeof data.slug !== 'string') {
      return { valid: false, message: 'Slug must be a string' };
    }
    // Slugs should be URL-friendly
    if (!/^[a-z0-9-]+$/.test(data.slug)) {
      return { valid: false, message: 'Slug must contain only lowercase letters, numbers, and hyphens' };
    }
  }
  
  // Validate title length if provided
  if (data.title !== undefined && (typeof data.title !== 'string' || data.title.length < 1)) {
    return { valid: false, message: 'Title must be a non-empty string' };
  }
  
  // Validate author if provided
  if (data.author !== undefined && (typeof data.author !== 'string' || data.author.length < 1)) {
    return { valid: false, message: 'Author must be a non-empty string' };
  }
  
  // Validate finishedDate if provided
  if (data.finishedDate !== undefined && data.finishedDate !== null) {
    try {
      new Date(data.finishedDate);
    } catch (error) {
      return { valid: false, message: 'Invalid date format for finishedDate' };
    }
  }
  
  // All validations passed
  return { valid: true };
};

/**
 * GET - Fetch all readings or a specific reading by slug
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: Fetching readings from database...');
    
    // Check if there's a slug parameter
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    
    let data;
    if (slug) {
      console.log(`API Route: Fetching reading with slug: ${slug}`);
      data = await getReading(slug);
      
      if (!data) {
        return setCacheHeaders(NextResponse.json(
          { error: 'Reading not found' },
          { status: 404 }
        ));
      }
    } else {
      data = await getReadings();
    }
    
    console.log(`API Route: Successfully fetched ${slug ? 'single reading' : `${Array.isArray(data) ? data.length : 0} readings`}`);
    
    return setCacheHeaders(NextResponse.json(data));
  } catch (error) {
    console.error('API Route: Error fetching readings:', error);
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to fetch readings', details: String(error) },
      { status: 500 }
    ));
  }
}

/**
 * POST - Create a new reading
 */
export async function POST(request: NextRequest) {
  try {
    console.log('API Route: Creating new reading');
    
    // Check if user is authenticated (in a real implementation, you'd check session here)
    // For now, we'll check an auth token in the header
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ));
    }
    
    // Parse request body
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
    
    // Validate data
    const validation = validateReadingInput(data, true);
    if (!validation.valid) {
      return setCacheHeaders(NextResponse.json(
        { error: validation.message },
        { status: 400 }
      ));
    }
    
    // Create reading
    const reading = await createReading(data);
    if (!reading) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Failed to create reading, slug may already exist' },
        { status: 409 }
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
 * PUT - Update an existing reading
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('API Route: Updating reading');
    
    // Check if user is authenticated
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ));
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
        { error: validation.message },
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
 * DELETE - Delete a reading
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('API Route: Deleting reading');
    
    // Check if user is authenticated
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ));
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