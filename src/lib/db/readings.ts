/**
 * Readings database utility functions
 *
 * Contains all database operations related to the Reading entity.
 */

import prisma from '../prisma';
import type { Reading, ReadingInput, ReadingsQueryParams, PaginationResult } from '@/types';
import { logger, createLogContext } from '@/lib/logger';

/**
 * Fetches a single reading by slug
 *
 * @param slug - The unique slug identifier of the reading
 * @returns The reading object or null if not found
 */
export async function getReading(slug: string): Promise<Reading | null> {
  try {
    logger.info(
      'Fetching reading by slug',
      createLogContext('db/readings', 'getReading', { reading_slug: slug })
    );

    // Use raw query for maximum compatibility
    const readings = await prisma.$queryRaw`
      SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
      FROM "Reading"
      WHERE slug = ${slug}
      LIMIT 1;
    `;

    // Cast the first result to Reading if it exists
    const reading: Reading | null =
      Array.isArray(readings) && readings.length > 0 ? (readings[0] as Reading) : null;

    if (reading) {
      logger.info(
        'Successfully found reading by slug',
        createLogContext('db/readings', 'getReading', {
          reading_slug: slug,
          reading_title: reading.title,
          reading_author: reading.author,
          found: true,
        })
      );
    } else {
      logger.warn(
        'Reading not found by slug',
        createLogContext('db/readings', 'getReading', {
          reading_slug: slug,
          found: false,
        })
      );
    }

    return reading;
  } catch (error) {
    logger.error(
      'Error fetching reading by slug',
      createLogContext('db/readings', 'getReading', {
        reading_slug: slug,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Fetches all readings from the database
 *
 * @returns Array of reading objects ordered by finished date (desc)
 */
export async function getReadings(): Promise<Reading[]> {
  try {
    logger.info(
      'Fetching all readings from database',
      createLogContext('db/readings', 'getReadings')
    );

    // Use raw query for maximum compatibility
    const readings = await prisma.$queryRaw`
      SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
      FROM "Reading"
      ORDER BY 
        -- Group 1: Unfinished and not dropped (priority 1)
        -- Group 2: Finished books (priority 2)
        -- Group 3: Dropped books (priority 3)
        CASE 
          WHEN "finishedDate" IS NULL AND dropped = false THEN 1
          WHEN "finishedDate" IS NOT NULL THEN 2
          ELSE 3
        END,
        -- Sort finished books by recency
        "finishedDate" DESC,
        id DESC;
    `;

    logger.info(
      'Successfully fetched readings',
      createLogContext('db/readings', 'getReadings', {
        readings_count: Array.isArray(readings) ? readings.length : 0,
        query_type: 'all_readings',
      })
    );

    if (!readings || (Array.isArray(readings) && readings.length === 0)) {
      logger.warn(
        'No readings found in database',
        createLogContext('db/readings', 'getReadings', { query_type: 'all_readings' })
      );
    }

    // Cast the raw query result to Reading[] to ensure correct type
    return readings as Reading[];
  } catch (error) {
    logger.error(
      'Error fetching readings from database',
      createLogContext('db/readings', 'getReadings', {
        query_type: 'all_readings',
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

/**
 * Fetches readings with search, filtering, sorting, and pagination
 *
 * @param params - Query parameters for filtering readings
 * @returns Paginated result with readings and metadata
 */
export async function getReadingsWithFilters(
  params: ReadingsQueryParams
): Promise<PaginationResult<Reading>> {
  try {
    // Extract parameters with defaults
    const {
      search = '',
      status,
      sortBy = 'date',
      sortOrder = 'desc',
      limit = 10,
      offset = 0,
    } = params;

    logger.info(
      'Fetching filtered readings from database',
      createLogContext('db/readings', 'getReadingsWithFilters', {
        search_query: search,
        status_filter: status,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset,
      })
    );

    // Build WHERE conditions
    const whereConditions: string[] = [];
    const queryParams: (string | null | boolean)[] = [];
    let paramIndex = 1;

    // Search in title, author, or thoughts
    if (search && search.trim() !== '') {
      whereConditions.push(`(
        title ILIKE $${paramIndex} OR 
        author ILIKE $${paramIndex} OR 
        thoughts ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Filter by status (read/dropped)
    if (status) {
      if (status === 'read') {
        whereConditions.push(`(dropped = false AND "finishedDate" IS NOT NULL)`);
      } else if (status === 'dropped') {
        whereConditions.push(`dropped = true`);
      }
      // 'all' doesn't need a filter
    }

    // Construct WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Construct ORDER BY clause based on sortBy and sortOrder
    let orderByClause = '';

    if (sortBy === 'date') {
      orderByClause = `
        -- Group 1: Unfinished and not dropped (priority 1)
        -- Group 2: Finished books (priority 2)
        -- Group 3: Dropped books (priority 3)
        CASE 
          WHEN "finishedDate" IS NULL AND dropped = false THEN 1
          WHEN "finishedDate" IS NOT NULL THEN 2
          ELSE 3
        END,
        -- Sort finished books by recency
        "finishedDate" ${sortOrder === 'asc' ? 'ASC' : 'DESC'},
        id DESC
      `;
    } else if (sortBy === 'title') {
      orderByClause = `
        title ${sortOrder === 'asc' ? 'ASC' : 'DESC'},
        id DESC
      `;
    } else if (sortBy === 'author') {
      orderByClause = `
        author ${sortOrder === 'asc' ? 'ASC' : 'DESC'},
        id DESC
      `;
    }

    // Get total count for pagination
    // Build the count query with parameters
    let countQuery = 'SELECT COUNT(*) as total FROM "Reading"';
    if (whereClause) {
      countQuery += ` ${whereClause}`;
    }

    // Execute count query with parameters
    // Using unknown is safer than any for raw SQL results
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...queryParams);

    // Type guard to ensure we're working with an array-like object
    const totalCount =
      Array.isArray(countResult) &&
      countResult[0] &&
      typeof countResult[0] === 'object' &&
      countResult[0] !== null &&
      'total' in countResult[0]
        ? parseInt(String(countResult[0].total), 10)
        : 0;

    logger.debug(
      'Total readings count calculated',
      createLogContext('db/readings', 'getReadingsWithFilters', {
        total_count: totalCount,
        search_query: search,
        status_filter: status,
        has_filters: whereConditions.length > 0,
      })
    );

    // Build the main query with parameters
    let mainQuery = `
      SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
      FROM "Reading"
    `;

    if (whereClause) {
      mainQuery += ` ${whereClause}`;
    }

    mainQuery += ` ORDER BY ${orderByClause}`;
    mainQuery += ` LIMIT ${limit} OFFSET ${offset}`;

    // Execute main query with parameters
    const readings = await prisma.$queryRawUnsafe(mainQuery, ...queryParams);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    // Calculate current page correctly based on the provided offset
    const currentPage = Math.floor(offset / limit) + 1;

    logger.info(
      'Successfully fetched filtered readings',
      createLogContext('db/readings', 'getReadingsWithFilters', {
        readings_count: Array.isArray(readings) ? readings.length : 0,
        total_count: totalCount,
        current_page: currentPage,
        total_pages: totalPages,
        search_query: search,
        status_filter: status,
      })
    );

    return {
      data: readings as Reading[],
      totalCount,
      currentPage,
      totalPages,
      pageSize: limit,
    };
  } catch (error) {
    logger.error(
      'Error fetching filtered readings from database',
      createLogContext('db/readings', 'getReadingsWithFilters', {
        search_query: params.search || '',
        status_filter: params.status,
        sort_by: params.sortBy || 'date',
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
 * Creates a new reading in the database
 *
 * @param data - Reading data to create
 * @returns The created reading or null if operation failed
 */
export async function createReading(data: ReadingInput): Promise<Reading | null> {
  try {
    logger.info(
      'Creating new reading',
      createLogContext('db/readings', 'createReading', {
        reading_title: data.title,
        reading_author: data.author,
        reading_slug: data.slug,
        has_finished_date: !!data.finishedDate,
        is_dropped: data.dropped || false,
      })
    );

    // Check if slug already exists
    const existingReading = await prisma.reading.findUnique({
      where: { slug: data.slug },
    });

    if (existingReading) {
      logger.warn(
        'Reading with slug already exists',
        createLogContext('db/readings', 'createReading', {
          reading_slug: data.slug,
          reading_title: data.title,
          conflict: true,
        })
      );
      return null;
    }

    // Create the reading using Prisma client
    const reading = await prisma.reading.create({
      data: {
        slug: data.slug,
        title: data.title,
        author: data.author,
        finishedDate: data.finishedDate || null,
        coverImageSrc: data.coverImageSrc || null,
        thoughts: data.thoughts || '',
        dropped: data.dropped || false,
      },
    });

    logger.info(
      'Successfully created reading',
      createLogContext('db/readings', 'createReading', {
        reading_id: reading.id,
        reading_title: reading.title,
        reading_author: reading.author,
        reading_slug: reading.slug,
      })
    );
    return reading;
  } catch (error) {
    logger.error(
      'Error creating reading',
      createLogContext('db/readings', 'createReading', {
        reading_title: data.title,
        reading_author: data.author,
        reading_slug: data.slug,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Updates an existing reading in the database
 *
 * @param slug - The slug of the reading to update
 * @param data - Reading data to update
 * @returns The updated reading or null if operation failed
 */
export async function updateReading(
  slug: string,
  data: Partial<ReadingInput>
): Promise<Reading | null> {
  try {
    logger.info(
      'Updating reading',
      createLogContext('db/readings', 'updateReading', {
        reading_slug: slug,
        has_title_update: data.title !== undefined,
        has_author_update: data.author !== undefined,
        has_slug_update: data.slug !== undefined,
      })
    );

    // Check if reading exists
    const existingReading = await prisma.reading.findUnique({
      where: { slug },
    });

    if (!existingReading) {
      logger.warn(
        'Reading not found for update',
        createLogContext('db/readings', 'updateReading', {
          reading_slug: slug,
          found: false,
        })
      );
      return null;
    }

    // If slug is being changed, verify new slug is not taken
    if (data.slug && data.slug !== slug) {
      const slugExists = await prisma.reading.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        logger.warn(
          'Cannot update reading - new slug already exists',
          createLogContext('db/readings', 'updateReading', {
            original_slug: slug,
            new_slug: data.slug,
            conflict: true,
          })
        );
        return null;
      }
    }

    // Update the reading
    const updatedReading = await prisma.reading.update({
      where: { slug },
      data: {
        ...data,
        // Ensure we don't accidentally set fields to undefined
        finishedDate:
          data.finishedDate === undefined ? existingReading.finishedDate : data.finishedDate,
        coverImageSrc:
          data.coverImageSrc === undefined ? existingReading.coverImageSrc : data.coverImageSrc,
        thoughts: data.thoughts === undefined ? existingReading.thoughts : data.thoughts,
        dropped: data.dropped === undefined ? existingReading.dropped : data.dropped,
      },
    });

    logger.info(
      'Successfully updated reading',
      createLogContext('db/readings', 'updateReading', {
        reading_id: updatedReading.id,
        reading_title: updatedReading.title,
        reading_author: updatedReading.author,
        reading_slug: updatedReading.slug,
      })
    );
    return updatedReading;
  } catch (error) {
    logger.error(
      'Error updating reading',
      createLogContext('db/readings', 'updateReading', {
        reading_slug: slug,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Deletes a reading from the database
 *
 * @param slug - The slug of the reading to delete
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteReading(slug: string): Promise<boolean> {
  try {
    logger.info(
      'Deleting reading',
      createLogContext('db/readings', 'deleteReading', { reading_slug: slug })
    );

    // Check if reading exists
    const existingReading = await prisma.reading.findUnique({
      where: { slug },
    });

    if (!existingReading) {
      logger.warn(
        'Reading not found for deletion',
        createLogContext('db/readings', 'deleteReading', {
          reading_slug: slug,
          found: false,
        })
      );
      return false;
    }

    // Delete the reading
    await prisma.reading.delete({
      where: { slug },
    });

    logger.info(
      'Successfully deleted reading',
      createLogContext('db/readings', 'deleteReading', {
        reading_slug: slug,
        reading_title: existingReading.title,
        reading_author: existingReading.author,
      })
    );
    return true;
  } catch (error) {
    logger.error(
      'Error deleting reading',
      createLogContext('db/readings', 'deleteReading', {
        reading_slug: slug,
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
      }),
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}
