/**
 * Quotes database utility functions
 * 
 * Contains all database operations related to the Quote entity.
 */

import prisma from '../prisma';

/**
 * Fetches all quotes from the database
 * 
 * @returns Array of quote objects
 */
export async function getQuotes() {
  try {
    console.log('Getting quotes from database...')
    
    // Use raw query for maximum compatibility
    const quotes = await prisma.$queryRaw`SELECT id, text, author FROM "Quote";`
    
    console.log(`Found ${Array.isArray(quotes) ? quotes.length : 0} quotes`)
    
    if (!quotes || (Array.isArray(quotes) && quotes.length === 0)) {
      console.warn('No quotes found in database')
    }
    
    return quotes
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return []
  }
}

/**
 * Fetches a single quote by ID
 * 
 * @param id - The unique ID of the quote
 * @returns The quote object or null if not found
 */
export async function getQuote(id: number) {
  try {
    console.log(`Fetching quote with ID: ${id}`)
    
    // Use raw query for maximum compatibility
    const quotes = await prisma.$queryRaw`
      SELECT id, text, author
      FROM "Quote"
      WHERE id = ${id}
      LIMIT 1;
    `
    
    const quote = Array.isArray(quotes) && quotes.length > 0 ? quotes[0] : null
    
    console.log(quote ? `Found quote with ID ${id}` : `No quote found with ID ${id}`)
    return quote
  } catch (error) {
    console.error(`Error fetching quote with ID ${id}:`, error)
    return null
  }
}