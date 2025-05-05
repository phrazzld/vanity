/**
 * Hooks Index
 *
 * This file exports all custom hooks for easy importing
 */

// Generic list state hook
export { useListState } from './useListState';
export type {
  ListSortOption,
  ListPaginationState,
  ListState,
  ListStateOptions,
} from './useListState';

// Specialized hooks
export { useReadingsList } from './useReadingsList';
export type { ReadingsFilter } from './useReadingsList';

export { useQuotesList } from './useQuotesList';
export type { QuotesFilter } from './useQuotesList';
