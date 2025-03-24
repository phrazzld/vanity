/**
 * Readings database utility functions
 * 
 * Contains all database operations related to the Reading entity.
 */

import prisma from '../prisma';
import type { Reading, ReadingInput, ReadingsQueryParams, PaginationResult } from '@/types';

/**
 * Fetches a single reading by slug
 * 
 * @param slug - The unique slug identifier of the reading
 * @returns The reading object or null if not found
 */
export async function getReading(slug: string): Promise<Reading | null> {
  try {
    console.log(`Fetching reading with slug: ${slug}`)
    
    // Use Prisma's type-safe query builder (instead of raw SQL) to prevent SQL injection
    const reading = await prisma.reading.findUnique({
      where: {
        slug: slug
      },
      select: {
        id: true,
        slug: true,
        title: true,
        author: true,
        finishedDate: true,
        coverImageSrc: true,
        thoughts: true,
        dropped: true
      }
    })
    
    console.log(reading ? `Found reading: ${reading.title}` : `No reading found for slug: ${slug}`)
    return reading
  } catch (error) {
    console.error(`Error fetching reading with slug ${slug}:`, error)
    return null
  }
}

/**
 * Fetches all readings from the database
 * 
 * @returns Array of reading objects ordered by reading status and finished date
 */
export async function getReadings(): Promise<Reading[]> {
  try {
    console.log('Getting readings from database...')
    
    // Use Prisma's findMany with orderBy
    // For the complex ordering requirements, use a hybrid approach
    
    // First, try to accomplish this with standard Prisma operations
    try {
      // Attempt to use prisma.findMany with sorting logic implemented in code
      const allReadings = await prisma.reading.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          author: true,
          finishedDate: true,
          coverImageSrc: true,
          thoughts: true,
          dropped: true
        }
      });
      
      // Sort the readings in memory according to our priority logic
      const sortedReadings = [...allReadings].sort((a, b) => {
        // Determine priority groups
        let groupA = 3; // Default: finished books (group 3)
        let groupB = 3;
        
        // Group 1: Unfinished and not dropped
        if (a.finishedDate === null && !a.dropped) groupA = 1;
        if (b.finishedDate === null && !b.dropped) groupB = 1;
        
        // Group 2: Unfinished and dropped
        if (a.finishedDate === null && a.dropped) groupA = 2;
        if (b.finishedDate === null && b.dropped) groupB = 2;
        
        // First, sort by priority group
        if (groupA !== groupB) {
          return groupA - groupB;
        }
        
        // For books in the same group:
        // If they're finished books (group 3), sort by finishedDate DESC
        if (groupA === 3 && a.finishedDate && b.finishedDate) {
          return b.finishedDate.getTime() - a.finishedDate.getTime();
        }
        
        // If we get here, sort by ID DESC
        return b.id - a.id;
      });
      
      console.log(`Found ${sortedReadings.length} readings`);
      return sortedReadings;
    } catch (prismaError) {
      // If the Prisma findMany approach fails, fall back to a parameterized raw query
      console.warn('Falling back to parameterized raw query due to error:', prismaError);
      
      // Use parameterized query to prevent SQL injection
      const query = `
        SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
        FROM "Reading"
        ORDER BY 
          CASE 
            WHEN "finishedDate" IS NULL AND dropped = false THEN 1
            WHEN "finishedDate" IS NULL AND dropped = true THEN 2
            ELSE 3
          END,
          "finishedDate" DESC NULLS LAST,
          id DESC
      `;
      
      const readings = await prisma.$queryRawUnsafe(query);
      
      console.log(`Found ${Array.isArray(readings) ? readings.length : 0} readings (fallback method)`);
      
      if (!readings || (Array.isArray(readings) && readings.length === 0)) {
        console.warn('No readings found in database');
      }
      
      return readings as Reading[];
    }
  } catch (error) {
    console.error('Error fetching readings:', error);
    return [];
  }
}

/**
 * Fetches readings with search, filtering, sorting, and pagination
 * 
 * @param params - Query parameters for filtering readings
 * @returns Paginated result with readings and metadata
 */
export async function getReadingsWithFilters(params: ReadingsQueryParams): Promise<PaginationResult<Reading>> {
  try {
    console.log('Getting filtered readings from database...')
    
    // Extract parameters with defaults
    const {
      search = '',
      status,
      sortBy = 'date',
      sortOrder = 'desc',
      limit = 10,
      offset = 0
    } = params;
    
    // Validate input parameters to prevent SQL injection
    const validatedLimit = Math.min(Math.max(1, Number(limit) || 10), 100); // Between 1 and 100
    const validatedOffset = Math.max(0, Number(offset) || 0); // 0 or greater
    const validatedSortBy = ['date', 'title', 'author'].includes(sortBy) ? sortBy : 'date';
    const validatedSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';
    
    // We'll use Prisma's query builder for the main part of the query
    // Build the where condition
    const whereCondition: any = {};
    
    // Add search filter
    if (search && search.trim() !== '') {
      whereCondition.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { author: { contains: search.trim(), mode: 'insensitive' } },
        { thoughts: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }
    
    // Add status filter
    if (status === 'read') {
      whereCondition.AND = [
        { dropped: false },
        { finishedDate: { not: null } }
      ];
    } else if (status === 'dropped') {
      whereCondition.dropped = true;
    }
    
    // Get total count for pagination
    const totalCount = await prisma.reading.count({
      where: whereCondition
    });
    
    console.log(`Total matching readings: ${totalCount}`);
    
    // For complex ordering logic, we may need to use a hybrid approach
    // with in-memory sorting for the most complex cases
    let readings: Reading[] = [];
    
    try {
      // Try to use Prisma's query builder for standard ordering cases
      if (validatedSortBy === 'title' || validatedSortBy === 'author') {
        // These are simpler orders that Prisma can handle directly
        readings = await prisma.reading.findMany({
          where: whereCondition,
          select: {
            id: true,
            slug: true,
            title: true,
            author: true,
            finishedDate: true,
            coverImageSrc: true,
            thoughts: true,
            dropped: true
          },
          orderBy: [
            { 
              [validatedSortBy]: validatedSortOrder
            },
            { id: 'desc' }
          ],
          skip: validatedOffset,
          take: validatedLimit
        });
      } else {
        // For date-based complex ordering, we need special handling
        // First get all readings that match our filter
        const allFilteredReadings = await prisma.reading.findMany({
          where: whereCondition,
          select: {
            id: true,
            slug: true,
            title: true,
            author: true,
            finishedDate: true,
            coverImageSrc: true,
            thoughts: true,
            dropped: true
          }
        });
        
        // Then sort them in memory based on our complex ordering logic
        const sortedReadings = [...allFilteredReadings].sort((a, b) => {
          // Determine priority groups
          let groupA = 3; // Default: finished books (group 3)
          let groupB = 3;
          
          // Group 1: Unfinished and not dropped
          if (a.finishedDate === null && !a.dropped) groupA = 1;
          if (b.finishedDate === null && !b.dropped) groupB = 1;
          
          // Group 2: Unfinished and dropped
          if (a.finishedDate === null && a.dropped) groupA = 2;
          if (b.finishedDate === null && b.dropped) groupB = 2;
          
          // First, sort by priority group
          if (groupA !== groupB) {
            return groupA - groupB;
          }
          
          // For books in the same group:
          // If they're finished books (group 3), sort by finishedDate
          if (groupA === 3 && a.finishedDate && b.finishedDate) {
            const dateCompare = validatedSortOrder === 'asc' 
              ? a.finishedDate.getTime() - b.finishedDate.getTime()
              : b.finishedDate.getTime() - a.finishedDate.getTime();
            
            if (dateCompare !== 0) return dateCompare;
          }
          
          // If we get here, sort by ID DESC
          return b.id - a.id;
        });
        
        // Apply pagination in memory
        readings = sortedReadings.slice(validatedOffset, validatedOffset + validatedLimit);
      }
    } catch (prismaError) {
      console.warn('Error using Prisma query builder:', prismaError);
      // Fallback to a more generic approach with safer raw queries if needed
      
      // Build WHERE conditions for raw query
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
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
      }
      
      // Construct safe WHERE clause
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      // Prepare a safe ORDER BY clause based on validated inputs
      let orderByClause: string;
      
      if (validatedSortBy === 'date') {
        orderByClause = `
          CASE 
            WHEN "finishedDate" IS NULL AND dropped = false THEN 1
            WHEN "finishedDate" IS NULL AND dropped = true THEN 2
            ELSE 3
          END,
          "finishedDate" ${validatedSortOrder.toUpperCase()},
          id DESC
        `;
      } else if (validatedSortBy === 'title') {
        orderByClause = `
          title ${validatedSortOrder.toUpperCase()},
          id DESC
        `;
      } else { // author
        orderByClause = `
          author ${validatedSortOrder.toUpperCase()},
          id DESC
        `;
      }
      
      // Build the main query with parameters for LIMIT and OFFSET too
      let mainQuery = `
        SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
        FROM "Reading"
      `;
      
      if (whereClause) {
        mainQuery += ` ${whereClause}`;
      }
      
      mainQuery += ` ORDER BY ${orderByClause}`;
      mainQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      
      // Add the limit and offset as parameters to prevent SQL injection
      queryParams.push(validatedLimit, validatedOffset);
      
      // Execute main query with parameters
      readings = await prisma.$queryRawUnsafe(
        mainQuery,
        ...queryParams
      ) as Reading[];
    }
    
    console.log(`Found ${readings.length} readings for current page`);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validatedLimit);
    const currentPage = Math.floor(validatedOffset / validatedLimit) + 1;
    
    console.log(`Returning data for page ${currentPage} (offset: ${validatedOffset}, limit: ${validatedLimit})`);
    
    return {
      data: readings,
      totalCount,
      currentPage,
      totalPages,
      pageSize: validatedLimit
    };
  } catch (error) {
    console.error('Error fetching filtered readings:', error);
    return {
      data: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      pageSize: 10
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
    console.log(`Creating new reading: ${data.title} by ${data.author}`)
    
    // Check if slug already exists
    const existingReading = await prisma.reading.findUnique({
      where: { slug: data.slug }
    })
    
    if (existingReading) {
      console.error(`Reading with slug ${data.slug} already exists`)
      return null
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
      }
    })
    
    console.log(`Successfully created reading with ID: ${reading.id}`)
    return reading
  } catch (error) {
    console.error('Error creating reading:', error)
    return null
  }
}

/**
 * Updates an existing reading in the database
 * 
 * @param slug - The slug of the reading to update
 * @param data - Reading data to update
 * @returns The updated reading or null if operation failed
 */
export async function updateReading(slug: string, data: Partial<ReadingInput>): Promise<Reading | null> {
  try {
    console.log(`Updating reading with slug: ${slug}`)
    
    // Check if reading exists
    const existingReading = await prisma.reading.findUnique({
      where: { slug }
    })
    
    if (!existingReading) {
      console.error(`Reading with slug ${slug} not found`)
      return null
    }
    
    // If slug is being changed, verify new slug is not taken
    if (data.slug && data.slug !== slug) {
      const slugExists = await prisma.reading.findUnique({
        where: { slug: data.slug }
      })
      
      if (slugExists) {
        console.error(`Cannot update: reading with slug ${data.slug} already exists`)
        return null
      }
    }
    
    // Update the reading
    const updatedReading = await prisma.reading.update({
      where: { slug },
      data: {
        ...data,
        // Ensure we don't accidentally set fields to undefined
        finishedDate: data.finishedDate === undefined 
          ? existingReading.finishedDate 
          : data.finishedDate,
        coverImageSrc: data.coverImageSrc === undefined 
          ? existingReading.coverImageSrc 
          : data.coverImageSrc,
        thoughts: data.thoughts === undefined ? existingReading.thoughts : data.thoughts,
        dropped: data.dropped === undefined ? existingReading.dropped : data.dropped,
      }
    })
    
    console.log(`Successfully updated reading: ${updatedReading.title}`)
    return updatedReading
  } catch (error) {
    console.error(`Error updating reading with slug ${slug}:`, error)
    return null
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
    console.log(`Deleting reading with slug: ${slug}`)
    
    // Check if reading exists
    const existingReading = await prisma.reading.findUnique({
      where: { slug }
    })
    
    if (!existingReading) {
      console.error(`Reading with slug ${slug} not found`)
      return false
    }
    
    // Delete the reading
    await prisma.reading.delete({
      where: { slug }
    })
    
    console.log(`Successfully deleted reading with slug: ${slug}`)
    return true
  } catch (error) {
    console.error(`Error deleting reading with slug ${slug}:`, error)
    return false
  }
}