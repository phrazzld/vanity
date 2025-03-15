/**
 * Database utilities index file
 * 
 * This file exports all database utility functions for easy import throughout the application.
 * Database operations are organized by entity (readings, quotes, etc.) for improved maintainability.
 */

// Import entity-specific database utilities when they're created
// import * as readingsDb from './readings';
// import * as quotesDb from './quotes';

// Re-export all database utilities
// export { readingsDb, quotesDb };

// Export the Prisma client
export { default as prisma } from '../prisma';