/**
 * Database utilities index file
 * 
 * This file exports all database utility functions for easy import throughout the application.
 * Database operations are organized by entity (readings, quotes, etc.) for improved maintainability.
 */

// Import entity-specific database utilities
import * as readingsDb from './readings';
import * as quotesDb from './quotes';

// Re-export all database utilities
export { readingsDb, quotesDb };

// Export individual reading functions for backward compatibility
export const { 
  getReading, 
  getReadings, 
  createReading, 
  updateReading, 
  deleteReading 
} = readingsDb;

// Export individual quote functions for backward compatibility
export const { 
  getQuote, 
  getQuotes,
  getQuotesWithFilters,
  createQuote, 
  updateQuote, 
  deleteQuote 
} = quotesDb;

// Export the Prisma client
export { default as prisma } from '../prisma';