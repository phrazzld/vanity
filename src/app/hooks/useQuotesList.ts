'use client';

/**
 * useQuotesList Hook
 *
 * A specialized hook for managing quotes list state,
 * built on top of the generic useListState hook.
 */

import { useListState } from './useListState';
import type { Quote } from '@/types';

// Define the filter type specific to quotes
export interface QuotesFilter {
  // Currently no specific filters for quotes, but we can add them later
}

/**
 * Fetches quotes with the provided parameters
 */
async function fetchQuotes(params: any) {
  // Construct URL with query parameters
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.set('search', params.search);
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const url = `/api/quotes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  // Fetch data
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching quotes: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * A hook for managing quotes list state
 */
export function useQuotesList(
  options: {
    initialSearch?: string;
    initialFilters?: QuotesFilter;
    initialSort?: { field: string; order: 'asc' | 'desc' };
    initialPageSize?: number;
    fetchOnMount?: boolean;
    searchDebounce?: number;
  } = {}
) {
  return useListState<Quote, QuotesFilter>({
    fetchItems: fetchQuotes,
    initialSearch: options.initialSearch,
    initialFilters: options.initialFilters || {},
    initialSort: options.initialSort || { field: 'id', order: 'desc' },
    initialPageSize: options.initialPageSize,
    fetchOnMount: options.fetchOnMount,
    searchDebounce: options.searchDebounce,
  });
}
