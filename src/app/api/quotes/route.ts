import { getQuotes, getQuote, createQuote, updateQuote, deleteQuote } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import type { QuoteInput } from '@/types';

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
const validateQuoteInput = (data: any, requireAllFields = true): { valid: boolean; message?: string } => {
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
 * GET - Fetch all quotes or a specific quote by ID
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: Fetching quotes from database...');
    
    // Check if there's an ID parameter
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    let data;
    if (id) {
      // Convert ID to number
      const quoteId = parseInt(id, 10);
      if (isNaN(quoteId)) {
        return setCacheHeaders(NextResponse.json(
          { error: 'Invalid quote ID' },
          { status: 400 }
        ));
      }
      
      console.log(`API Route: Fetching quote with ID: ${quoteId}`);
      data = await getQuote(quoteId);
      
      if (!data) {
        return setCacheHeaders(NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        ));
      }
    } else {
      data = await getQuotes();
    }
    
    console.log(`API Route: Successfully fetched ${id ? 'single quote' : `${Array.isArray(data) ? data.length : 0} quotes`}`);
    
    return setCacheHeaders(NextResponse.json(data));
  } catch (error) {
    console.error('API Route: Error fetching quotes:', error);
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to fetch quotes', details: String(error) },
      { status: 500 }
    ));
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
      return setCacheHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ));
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
      return setCacheHeaders(NextResponse.json(
        { error: validation.message },
        { status: 400 }
      ));
    }
    
    // Create quote
    const quote = await createQuote(data);
    if (!quote) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Failed to create quote' },
        { status: 500 }
      ));
    }
    
    console.log(`API Route: Successfully created quote with ID: ${quote.id}`);
    return setCacheHeaders(NextResponse.json(quote, { status: 201 }));
  } catch (error) {
    console.error('API Route: Error creating quote:', error);
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to create quote', details: String(error) },
      { status: 500 }
    ));
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
      return setCacheHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ));
    }
    
    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return setCacheHeaders(NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      ));
    }
    
    // Convert ID to number
    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Invalid quote ID' },
        { status: 400 }
      ));
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
      return setCacheHeaders(NextResponse.json(
        { error: validation.message },
        { status: 400 }
      ));
    }
    
    // Update quote
    const quote = await updateQuote(quoteId, data);
    if (!quote) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      ));
    }
    
    console.log(`API Route: Successfully updated quote with ID: ${quote.id}`);
    return setCacheHeaders(NextResponse.json(quote));
  } catch (error) {
    console.error('API Route: Error updating quote:', error);
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to update quote', details: String(error) },
      { status: 500 }
    ));
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
      return setCacheHeaders(NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ));
    }
    
    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return setCacheHeaders(NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      ));
    }
    
    // Convert ID to number
    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Invalid quote ID' },
        { status: 400 }
      ));
    }
    
    // Delete quote
    const success = await deleteQuote(quoteId);
    if (!success) {
      return setCacheHeaders(NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      ));
    }
    
    console.log(`API Route: Successfully deleted quote with ID: ${quoteId}`);
    return setCacheHeaders(NextResponse.json(
      { success: true, message: `Quote with ID ${quoteId} deleted successfully` }
    ));
  } catch (error) {
    console.error('API Route: Error deleting quote:', error);
    return setCacheHeaders(NextResponse.json(
      { error: 'Failed to delete quote', details: String(error) },
      { status: 500 }
    ));
  }
}