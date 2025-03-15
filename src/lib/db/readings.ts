/**
 * Readings database utility functions
 * 
 * Contains all database operations related to the Reading entity.
 */

import prisma from '../prisma';
import type { Reading, ReadingInput } from '@/types';

/**
 * Fetches a single reading by slug
 * 
 * @param slug - The unique slug identifier of the reading
 * @returns The reading object or null if not found
 */
export async function getReading(slug: string): Promise<Reading | null> {
  try {
    console.log(`Fetching reading with slug: ${slug}`)
    
    // Use raw query for maximum compatibility
    const readings = await prisma.$queryRaw`
      SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
      FROM "Reading"
      WHERE slug = ${slug}
      LIMIT 1;
    `
    
    const reading = Array.isArray(readings) && readings.length > 0 ? readings[0] as Reading : null
    
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
export async function getReadings(): Promise<Reading[]> {
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
    
    return readings as Reading[]
  } catch (error) {
    console.error('Error fetching readings:', error)
    return []
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