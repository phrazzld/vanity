/**
 * Type definitions index file
 * 
 * This file serves as a central export point for all shared type definitions
 * used throughout the application. Types are organized by entity (Reading, Quote, etc.)
 * for improved maintainability and code organization.
 * 
 * Usage example:
 * import type { Reading, Quote } from '@/types';
 */

// Import entity-specific type definitions
import type { Reading, ReadingInput, ReadingListItem } from './reading';
import type { Quote, QuoteInput } from './quote';
import type { ReadingsQueryParams, QuotesQueryParams, PaginationResult } from './api';

// Re-export all type definitions
export type {
  // Reading types
  Reading,
  ReadingInput,
  ReadingListItem,
  
  // Quote types
  Quote,
  QuoteInput,
  
  // API types
  ReadingsQueryParams,
  QuotesQueryParams,
  PaginationResult
};