/**
 * Quotes database utility functions
 *
 * Contains all database operations related to the Quote entity.
 */

import prisma from '../prisma';
import type { Quote, QuoteInput, QuotesQueryParams, PaginationResult } from '@/types';
import { logger, createLogContext } from '@/lib/logger';

/**
 * Fetches all quotes from the database
 *
 * @returns Array of quote objects
 */
export async function getQuotes(): Promise<Quote[]> {
  try {
    logger.info('Fetching all quotes from database', createLogContext('db/quotes', 'getQuotes'));

    // Use raw query for maximum compatibility
    const quotes = await prisma.$queryRaw`SELECT id, text, author FROM "Quote";`;

    logger.info(
      'Successfully fetched quotes',
      createLogContext('db/quotes', 'getQuotes', {
        quotes_count: Array.isArray(quotes) ? quotes.length : 0,
        query_type: 'all_quotes',
      })
    );

    if (!quotes || (Array.isArray(quotes) && quotes.length === 0)) {
      logger.warn(
        'No quotes found in database',
        createLogContext('db/quotes', 'getQuotes', { query_type: 'all_quotes' })
      );
    }

    // Cast the raw query result to Quote[] to ensure correct type
    return quotes as Quote[];
  } catch (error) {
    logger.error(
      'Error fetching quotes from database',
      createLogContext('db/quotes', 'getQuotes', {
        query_type: 'all_quotes',
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.info(
      'Fetching filtered quotes from database',
      createLogContext('db/quotes', 'getQuotesWithFilters', {
        search_query: params.search || '',
        sort_by: params.sortBy || 'id',
        sort_order: params.sortOrder || 'desc',
        limit: params.limit || 10,
        offset: params.offset || 0,
      })
    );

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

    logger.debug(
      'Total quotes count calculated',
      createLogContext('db/quotes', 'getQuotesWithFilters', {
        total_count: totalCount,
        search_query: search,
        has_filters: whereConditions.length > 0,
      })
    );

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

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    logger.info(
      'Successfully fetched filtered quotes',
      createLogContext('db/quotes', 'getQuotesWithFilters', {
        quotes_count: Array.isArray(quotes) ? quotes.length : 0,
        total_count: totalCount,
        current_page: currentPage,
        total_pages: totalPages,
        search_query: search,
      })
    );

    return {
      data: quotes as Quote[],
      totalCount,
      currentPage,
      totalPages,
      pageSize: limit,
    };
  } catch (error) {
    logger.error(
      'Error fetching filtered quotes from database',
      createLogContext('db/quotes', 'getQuotesWithFilters', {
        search_query: params.search || '',
        sort_by: params.sortBy || 'id',
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.info(
      'Fetching quote by ID',
      createLogContext('db/quotes', 'getQuote', { quote_id: id })
    );

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

    if (quote) {
      logger.info(
        'Successfully found quote by ID',
        createLogContext('db/quotes', 'getQuote', {
          quote_id: id,
          found: true,
          author: quote.author,
        })
      );
    } else {
      logger.warn(
        'Quote not found by ID',
        createLogContext('db/quotes', 'getQuote', {
          quote_id: id,
          found: false,
        })
      );
    }

    return quote;
  } catch (error) {
    logger.error(
      'Error fetching quote by ID',
      createLogContext('db/quotes', 'getQuote', {
        quote_id: id,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.info(
      'Creating new quote',
      createLogContext('db/quotes', 'createQuote', {
        text_preview: data.text.substring(0, 30) + '...',
        author: data.author || 'Anonymous',
        text_length: data.text.length,
      })
    );

    // Create the quote using Prisma client
    const quote = await prisma.quote.create({
      data: {
        text: data.text,
        author: data.author || null,
      },
    });

    logger.info(
      'Successfully created quote',
      createLogContext('db/quotes', 'createQuote', {
        quote_id: quote.id,
        author: quote.author,
        text_length: quote.text.length,
      })
    );
    return quote;
  } catch (error) {
    logger.error(
      'Error creating quote',
      createLogContext('db/quotes', 'createQuote', {
        author: data.author || 'Anonymous',
        text_length: data.text.length,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.info(
      'Updating quote',
      createLogContext('db/quotes', 'updateQuote', {
        quote_id: id,
        has_text_update: data.text !== undefined,
        has_author_update: data.author !== undefined,
      })
    );

    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!existingQuote) {
      logger.warn(
        'Quote not found for update',
        createLogContext('db/quotes', 'updateQuote', {
          quote_id: id,
          found: false,
        })
      );
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

    logger.info(
      'Successfully updated quote',
      createLogContext('db/quotes', 'updateQuote', {
        quote_id: updatedQuote.id,
        author: updatedQuote.author,
        text_length: updatedQuote.text.length,
      })
    );
    return updatedQuote;
  } catch (error) {
    logger.error(
      'Error updating quote',
      createLogContext('db/quotes', 'updateQuote', {
        quote_id: id,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.info('Deleting quote', createLogContext('db/quotes', 'deleteQuote', { quote_id: id }));

    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!existingQuote) {
      logger.warn(
        'Quote not found for deletion',
        createLogContext('db/quotes', 'deleteQuote', {
          quote_id: id,
          found: false,
        })
      );
      return false;
    }

    // Delete the quote
    await prisma.quote.delete({
      where: { id },
    });

    logger.info(
      'Successfully deleted quote',
      createLogContext('db/quotes', 'deleteQuote', {
        quote_id: id,
        author: existingQuote.author,
      })
    );
    return true;
  } catch (error) {
    logger.error(
      'Error deleting quote',
      createLogContext('db/quotes', 'deleteQuote', {
        quote_id: id,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}
