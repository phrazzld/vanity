'use client';

/**
 * Quotes API Hooks
 *
 * This file contains TanStack Query hooks for fetching and mutating quote data.
 * It provides a clean, typed API for components to interact with quote data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { Quote } from '@/types/quote';

// Parameters for filtering and paginating quotes
export interface QuotesParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  source?: string;
  author?: string;
}

// Response shape from the quotes API
export interface QuotesResponse {
  data: Quote[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Fetch quotes from the API
 */
async function fetchQuotes(params: QuotesParams = {}): Promise<QuotesResponse> {
  // Build query parameters
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  // Make API request
  const response = await fetch(`/api/quotes?${queryParams.toString()}`);

  // Handle errors
  if (!response.ok) {
    throw new Error(`Failed to fetch quotes: ${response.statusText}`);
  }

  // Return parsed data
  return response.json();
}

/**
 * Hook for fetching quotes with filters and pagination
 */
export function useQuotes(
  params: QuotesParams = {},
  options?: UseQueryOptions<QuotesResponse, Error, QuotesResponse, (string | QuotesParams)[]>
) {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => fetchQuotes(params),
    ...options,
  });
}

/**
 * Fetch a single quote by ID
 */
async function fetchQuoteById(id: string): Promise<Quote> {
  const response = await fetch(`/api/quotes/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch quote: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for fetching a single quote
 */
export function useQuote(
  id: string,
  options?: UseQueryOptions<Quote, Error, Quote, (string | string)[]>
) {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: () => fetchQuoteById(id),
    // Only run the query if we have an ID
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new quote
 */
async function createQuote(data: Omit<Quote, 'id'>): Promise<Quote> {
  const response = await fetch('/api/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create quote: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for creating a new quote
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      // Invalidate all quote queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

/**
 * Update an existing quote
 */
async function updateQuote(data: Quote): Promise<Quote> {
  const response = await fetch(`/api/quotes/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update quote: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for updating an existing quote
 */
export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuote,
    onSuccess: data => {
      // Update the cache for this specific quote
      queryClient.setQueryData(['quote', data.id], data);

      // Invalidate the list queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

/**
 * Delete a quote
 */
async function deleteQuote(id: string): Promise<void> {
  const response = await fetch(`/api/quotes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete quote: ${response.statusText}`);
  }
}

/**
 * Hook for deleting a quote
 */
export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: (_, deletedId) => {
      // Remove the quote from the cache
      queryClient.removeQueries({ queryKey: ['quote', deletedId] });

      // Invalidate the list queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}
