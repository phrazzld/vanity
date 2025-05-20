'use client';

/**
 * Readings API Hooks
 *
 * This file contains TanStack Query hooks for fetching and mutating reading data.
 * It provides a clean, typed API for components to interact with reading data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { Reading } from '@/types/reading';

// Parameters for filtering and paginating readings
export interface ReadingsParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  year?: number;
  category?: string;
}

// Response shape from the readings API
export interface ReadingsResponse {
  data: Reading[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Fetch readings from the API
 */
async function fetchReadings(params: ReadingsParams = {}): Promise<ReadingsResponse> {
  // Build query parameters
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  // Make API request
  const response = await fetch(`/api/readings?${queryParams.toString()}`);

  // Handle errors
  if (!response.ok) {
    throw new Error(`Failed to fetch readings: ${response.statusText}`);
  }

  // Return parsed data
  return response.json();
}

/**
 * Hook for fetching readings with filters and pagination
 */
export function useReadings(
  params: ReadingsParams = {},
  options?: UseQueryOptions<ReadingsResponse, Error, ReadingsResponse, (string | ReadingsParams)[]>
) {
  return useQuery({
    queryKey: ['readings', params],
    queryFn: () => fetchReadings(params),
    ...options,
  });
}

/**
 * Fetch a single reading by ID
 */
async function fetchReadingById(id: string): Promise<Reading> {
  const response = await fetch(`/api/readings/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch reading: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for fetching a single reading
 */
export function useReading(
  id: string,
  options?: UseQueryOptions<Reading, Error, Reading, (string | string)[]>
) {
  return useQuery({
    queryKey: ['reading', id],
    queryFn: () => fetchReadingById(id),
    // Only run the query if we have an ID
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new reading
 */
async function createReading(data: Omit<Reading, 'id'>): Promise<Reading> {
  const response = await fetch('/api/readings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create reading: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for creating a new reading
 */
export function useCreateReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReading,
    onSuccess: () => {
      // Invalidate all reading queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}

/**
 * Update an existing reading
 */
async function updateReading(data: Reading): Promise<Reading> {
  const response = await fetch(`/api/readings/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update reading: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for updating an existing reading
 */
export function useUpdateReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReading,
    onSuccess: data => {
      // Update the cache for this specific reading
      queryClient.setQueryData(['reading', data.id], data);

      // Invalidate the list queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}

/**
 * Delete a reading
 */
async function deleteReading(id: string): Promise<void> {
  const response = await fetch(`/api/readings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete reading: ${response.statusText}`);
  }
}

/**
 * Hook for deleting a reading
 */
export function useDeleteReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReading,
    onSuccess: (_, deletedId) => {
      // Remove the reading from the cache
      queryClient.removeQueries({ queryKey: ['reading', deletedId] });

      // Invalidate the list queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}
