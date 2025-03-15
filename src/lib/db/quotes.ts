/**
 * Quotes database utility functions
 * 
 * Contains all database operations related to the Quote entity.
 */

import prisma from '../prisma';
import type { Quote, QuoteInput } from '@/types';

/**
 * Fetches all quotes from the database
 * 
 * @returns Array of quote objects
 */
export async function getQuotes(): Promise<Quote[]> {
  try {
    console.log('Getting quotes from database...')
    
    // Use raw query for maximum compatibility
    const quotes = await prisma.$queryRaw`SELECT id, text, author FROM "Quote";`
    
    console.log(`Found ${Array.isArray(quotes) ? quotes.length : 0} quotes`)
    
    if (!quotes || (Array.isArray(quotes) && quotes.length === 0)) {
      console.warn('No quotes found in database')
    }
    
    return quotes as Quote[]
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
export async function getQuote(id: number): Promise<Quote | null> {
  try {
    console.log(`Fetching quote with ID: ${id}`)
    
    // Use raw query for maximum compatibility
    const quotes = await prisma.$queryRaw`
      SELECT id, text, author
      FROM "Quote"
      WHERE id = ${id}
      LIMIT 1;
    `
    
    const quote = Array.isArray(quotes) && quotes.length > 0 ? quotes[0] as Quote : null
    
    console.log(quote ? `Found quote with ID ${id}` : `No quote found with ID ${id}`)
    return quote
  } catch (error) {
    console.error(`Error fetching quote with ID ${id}:`, error)
    return null
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
    console.log(`Creating new quote: "${data.text.substring(0, 30)}..." by ${data.author || 'Anonymous'}`)
    
    // Create the quote using Prisma client
    const quote = await prisma.quote.create({
      data: {
        text: data.text,
        author: data.author || null,
      }
    })
    
    console.log(`Successfully created quote with ID: ${quote.id}`)
    return quote
  } catch (error) {
    console.error('Error creating quote:', error)
    return null
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
    console.log(`Updating quote with ID: ${id}`)
    
    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id }
    })
    
    if (!existingQuote) {
      console.error(`Quote with ID ${id} not found`)
      return null
    }
    
    // Update the quote
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        text: data.text === undefined ? existingQuote.text : data.text,
        author: data.author === undefined ? existingQuote.author : data.author,
      }
    })
    
    console.log(`Successfully updated quote with ID: ${updatedQuote.id}`)
    return updatedQuote
  } catch (error) {
    console.error(`Error updating quote with ID ${id}:`, error)
    return null
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
    console.log(`Deleting quote with ID: ${id}`)
    
    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id }
    })
    
    if (!existingQuote) {
      console.error(`Quote with ID ${id} not found`)
      return false
    }
    
    // Delete the quote
    await prisma.quote.delete({
      where: { id }
    })
    
    console.log(`Successfully deleted quote with ID: ${id}`)
    return true
  } catch (error) {
    console.error(`Error deleting quote with ID ${id}:`, error)
    return false
  }
}