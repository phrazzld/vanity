'use client';

/**
 * useReadingsList Hook
 * 
 * A specialized hook for managing reading list state,
 * built on top of the generic useListState hook.
 */

import { useListState } from './useListState';
import type { Reading } from '@/types';

// Define the filter type specific to readings
export interface ReadingsFilter {
  status?: 'read' | 'dropped' | 'all';
}

/**
 * Fetches readings with the provided parameters
 */
async function fetchReadings(params: any) {
  // Construct URL with query parameters
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.set('search', params.search);
  if (params.status && params.status !== 'all') queryParams.set('status', params.status);
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());
  
  const url = `/api/readings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  // Import the secure fetch dynamically to avoid server-side issues
  // (Next.js can try to import this on the server side when pre-rendering)
  const { secureFetch } = await import('../utils/csrf-client');
  
  // Fetch data with CSRF token included
  const response = await secureFetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching readings: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * A hook for managing reading list state
 */
export function useReadingsList(options: {
  initialSearch?: string;
  initialFilters?: ReadingsFilter;
  initialSort?: { field: string; order: 'asc' | 'desc' };
  initialPageSize?: number;
  fetchOnMount?: boolean;
  searchDebounce?: number;
} = {}) {
  return useListState<Reading, ReadingsFilter>({
    fetchItems: fetchReadings,
    initialSearch: options.initialSearch,
    initialFilters: options.initialFilters || { status: 'all' },
    initialSort: options.initialSort || { field: 'date', order: 'desc' },
    initialPageSize: options.initialPageSize,
    fetchOnMount: options.fetchOnMount,
    searchDebounce: options.searchDebounce
  });
}