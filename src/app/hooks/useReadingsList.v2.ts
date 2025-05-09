'use client';

/**
 * Enhanced ReadingsList Hook (v2)
 *
 * This hook combines local UI state (filters, sorting, pagination)
 * with TanStack Query for data fetching.
 *
 * It provides a clean interface for components to interact with readings data
 * without needing to manage the complexities of state and data fetching.
 */

import { useState, useCallback } from 'react';
import { useReadings } from '@/lib/api/readings';
import type { ReadingsParams } from '@/lib/api/readings';
import type { Reading } from '@/types';

export interface UseReadingsListResult {
  // Data
  items: Reading[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;

  // State
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
  year: number | undefined;
  status: 'read' | 'dropped' | 'all';

  // Actions
  setSearch: (_value: string) => void;
  toggleSort: (_fieldName: string) => void;
  setPage: (_pageNum: number) => void;
  setPageSize: (_size: number) => void;
  setYear: (_selectedYear: number | undefined) => void;
  setStatus: (_newStatus: 'read' | 'dropped' | 'all') => void;
  refreshData: () => void;
}

export function useReadingsListV2(
  initialParams: Partial<ReadingsParams> = {}
): UseReadingsListResult {
  // Local UI state
  const [search, setSearch] = useState(initialParams.search || '');
  const [sortBy, setSortBy] = useState(initialParams.sortBy || 'date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialParams.sortOrder || 'desc');
  const [page, setPage] = useState(
    initialParams.offset ? Math.floor(initialParams.offset / (initialParams.limit || 10)) + 1 : 1
  );
  const [pageSize, setPageSize] = useState(initialParams.limit || 10);
  const [year, setYear] = useState<number | undefined>(initialParams.year);
  const [status, setStatus] = useState<'read' | 'dropped' | 'all'>('all');

  // Generate query params based on local state
  const queryParams: ReadingsParams = {
    search: search || undefined,
    sortBy,
    sortOrder,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    year,
  };

  // Add status to query params if not 'all'
  if (status !== 'all') {
    // Using type assertion to a specific object type instead of any
    (queryParams as ReadingsParams & { status: string }).status = status;
  }

  // Use TanStack Query for data fetching
  const { data, isLoading, error, refetch } = useReadings(queryParams);

  // Handle sort toggling
  const toggleSort = useCallback(
    (_fieldName: string) => {
      if (sortBy === _fieldName) {
        // Toggle order if already sorting by this field
        setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'));
      } else {
        // Set new field and default to ascending
        setSortBy(_fieldName);
        setSortOrder('asc');
      }
      // Reset to first page when sort changes
      setPage(1);
    },
    [sortBy, setSortOrder, setPage]
  );

  // Return a clean interface for components
  return {
    // Data from query
    items: data?.data || [],
    totalItems: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error: error || null,

    // State
    search,
    sortBy,
    sortOrder,
    page,
    pageSize,
    year,
    status,

    // Actions
    setSearch: (_value: string) => {
      setSearch(_value);
      setPage(1); // Reset to first page on search
    },
    toggleSort,
    setPage,
    setPageSize: (_size: number) => {
      setPageSize(_size);
      setPage(1); // Reset to first page on page size change
    },
    setYear: (_selectedYear: number | undefined) => {
      setYear(_selectedYear);
      setPage(1); // Reset to first page on year filter change
    },
    setStatus: (_newStatus: 'read' | 'dropped' | 'all') => {
      setStatus(_newStatus);
      setPage(1); // Reset to first page on status change
    },
    refreshData: refetch,
  };
}
