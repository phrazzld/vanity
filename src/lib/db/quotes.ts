/**
 * Quotes database utility functions
 *
 * Contains all database operations related to the Quote entity.
 */

import prisma from '../prisma';
import type { Quote, QuoteInput, QuotesQueryParams, PaginationResult } from '@/types';

/**
 * Fetches all quotes from the database
 *
 * @returns Array of quote objects
 */
export async function getQuotes(): Promise<Quote[]> {
  try {
    console.log('Getting quotes from database...');

    // Use raw query for maximum compatibility
    const quotes = await prisma.$queryRaw`SELECT id, text, author FROM "Quote";`;

    console.log(`Found ${Array.isArray(quotes) ? quotes.length : 0} quotes`);

    if (!quotes || (Array.isArray(quotes) && quotes.length === 0)) {
      console.warn('No quotes found in database');
    }

    // Cast the raw query result to Quote[] to ensure correct type
    return quotes as Quote[];
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
}

/**
 * Fetches quotes with search, filtering, sorting, and pagination
 *
 * @param params - Query parameters for filtering quotes
 * @returns Paginated result with quotes and metadata
 */
export async function getQuotesWithFilters(
  params: QuotesQueryParams
): Promise<PaginationResult<Quote>> {
  try {
    console.log('Getting filtered quotes from database...');

    // Extract parameters with defaults
    const { search = '', sortBy = 'id', sortOrder = 'desc', limit = 10, offset = 0 } = params;

    // Build WHERE conditions
    const whereConditions: string[] = [];
    const queryParams: (string | null | boolean)[] = [];
    let paramIndex = 1;

    // Search in quote text or author
    if (search && search.trim() !== '') {
      whereConditions.push(`(
        text ILIKE $${paramIndex} OR 
        author ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Construct WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Construct ORDER BY clause based on sortBy and sortOrder
    let orderByClause = '';

    if (sortBy === 'author') {
      orderByClause = `
        author ${sortOrder === 'asc' ? 'ASC' : 'DESC'} NULLS LAST,
        id DESC
      `;
    } else {
      // Default is 'id'
      orderByClause = `
        id ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      `;
    }

    // Get total count for pagination
    // Build the count query with parameters
    let countQuery = 'SELECT COUNT(*) as total FROM "Quote"';
    if (whereClause) {
      countQuery += ` ${whereClause}`;
    }

    // Execute count query with parameters
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const countResult = (await prisma.$queryRawUnsafe(countQuery, ...queryParams)) as {
      total: number | bigint;
    }[];

    const totalCount = parseInt(countResult[0]?.total?.toString() || '0', 10);
    console.log(`Total matching quotes: ${totalCount}`);

    // Build the main query with parameters
    let mainQuery = `
      SELECT id, text, author
      FROM "Quote"
    `;

    if (whereClause) {
      mainQuery += ` ${whereClause}`;
    }

    mainQuery += ` ORDER BY ${orderByClause}`;
    mainQuery += ` LIMIT ${limit} OFFSET ${offset}`;

    // Execute main query with parameters
    const quotes = await prisma.$queryRawUnsafe(mainQuery, ...queryParams);

    console.log(`Found ${Array.isArray(quotes) ? quotes.length : 0} quotes for current page`);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      data: quotes as Quote[],
      totalCount,
      currentPage,
      totalPages,
      pageSize: limit,
    };
  } catch (error) {
    console.error('Error fetching filtered quotes:', error);
    return {
      data: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      pageSize: 10,
    };
  }
}

/**
 * Fetches a single quote by ID
 *
 * @param id - The unique ID of the quote
 * @returns The quote object or null if not found
 */
export async function getQuote(id: number): Promise<Quote | null> {
  try {
    console.log(`Fetching quote with ID: ${id}`);

    // Use raw query for maximum compatibility
    const quotes = await prisma.$queryRaw`
      SELECT id, text, author
      FROM "Quote"
      WHERE id = ${id}
      LIMIT 1;
    `;

    // Cast the first result to Quote if it exists
    const quote: Quote | null =
      Array.isArray(quotes) && quotes.length > 0 ? (quotes[0] as Quote) : null;

    console.log(quote ? `Found quote with ID ${id}` : `No quote found with ID ${id}`);
    return quote;
  } catch (error) {
    console.error(`Error fetching quote with ID ${id}:`, error);
    return null;
  }
}

/**
 * Creates a new quote in the database
 *
 * @param data - Quote data to create
 * @returns The created quote or null if operation failed
 */
export async function createQuote(data: QuoteInput): Promise<Quote | null> {
  try {
    console.log(
      `Creating new quote: "${data.text.substring(0, 30)}..." by ${data.author || 'Anonymous'}`
    );

    // Create the quote using Prisma client
    const quote = await prisma.quote.create({
      data: {
        text: data.text,
        author: data.author || null,
      },
    });

    console.log(`Successfully created quote with ID: ${quote.id}`);
    return quote;
  } catch (error) {
    console.error('Error creating quote:', error);
    return null;
  }
}

/**
 * Updates an existing quote in the database
 *
 * @param id - The ID of the quote to update
 * @param data - Quote data to update
 * @returns The updated quote or null if operation failed
 */
export async function updateQuote(id: number, data: Partial<QuoteInput>): Promise<Quote | null> {
  try {
    console.log(`Updating quote with ID: ${id}`);

    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!existingQuote) {
      console.error(`Quote with ID ${id} not found`);
      return null;
    }

    // Update the quote
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        text: data.text === undefined ? existingQuote.text : data.text,
        author: data.author === undefined ? existingQuote.author : data.author,
      },
    });

    console.log(`Successfully updated quote with ID: ${updatedQuote.id}`);
    return updatedQuote;
  } catch (error) {
    console.error(`Error updating quote with ID ${id}:`, error);
    return null;
  }
}

/**
 * Deletes a quote from the database
 *
 * @param id - The ID of the quote to delete
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteQuote(id: number): Promise<boolean> {
  try {
    console.log(`Deleting quote with ID: ${id}`);

    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!existingQuote) {
      console.error(`Quote with ID ${id} not found`);
      return false;
    }

    // Delete the quote
    await prisma.quote.delete({
      where: { id },
    });

    console.log(`Successfully deleted quote with ID: ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting quote with ID ${id}:`, error);
    return false;
  }
}
