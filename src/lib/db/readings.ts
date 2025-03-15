/**
 * Readings database utility functions
 * 
 * Contains all database operations related to the Reading entity.
 */

import prisma from '../prisma';

/**
 * Fetches a single reading by slug
 * 
 * @param slug - The unique slug identifier of the reading
 * @returns The reading object or null if not found
 */
export async function getReading(slug: string) {
  try {
    console.log(`Fetching reading with slug: ${slug}`)
    
    // Use raw query for maximum compatibility
    const readings = await prisma.$queryRaw`
      SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
      FROM "Reading"
      WHERE slug = ${slug}
      LIMIT 1;
    `
    
    const reading = Array.isArray(readings) && readings.length > 0 ? readings[0] : null
    
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
 * @returns Array of reading objects ordered by finished date (desc)
 */
export async function getReadings() {
  try {
    console.log('Getting readings from database...')
    
    // Use raw query for maximum compatibility
    const readings = await prisma.$queryRaw`
      SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
      FROM "Reading"
      ORDER BY 
        CASE WHEN "finishedDate" IS NULL THEN 1 ELSE 0 END,
        "finishedDate" DESC,
        id DESC;
    `
    
    console.log(`Found ${Array.isArray(readings) ? readings.length : 0} readings`)
    
    if (!readings || (Array.isArray(readings) && readings.length === 0)) {
      console.warn('No readings found in database')
    }
    
    return readings
  } catch (error) {
    console.error('Error fetching readings:', error)
    return []
  }
}