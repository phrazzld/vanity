'use client';

/**
 * Enhanced QuotesList Hook (v2)
 *
 * This hook combines local UI state (filters, sorting, pagination)
 * with TanStack Query for data fetching.
 *
 * It provides a clean interface for components to interact with quotes data
 * without needing to manage the complexities of state and data fetching.
 */

import { useState, useCallback } from 'react';
import { useQuotes } from '@/lib/api/quotes';
import type { QuotesParams } from '@/lib/api/quotes';
import type { Quote } from '@/types';

export interface UseQuotesListResult {
  // Data
  items: Quote[];
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
  author: string | undefined;
  source: string | undefined;

  // Actions
  setSearch: (_value: string) => void;
  toggleSort: (_fieldName: string) => void;
  setPage: (_pageNum: number) => void;
  setPageSize: (_size: number) => void;
  setAuthor: (_newAuthor: string | undefined) => void;
  setSource: (_newSource: string | undefined) => void;
  refreshData: () => void;
}

export function useQuotesListV2(initialParams: Partial<QuotesParams> = {}): UseQuotesListResult {
  // Local UI state
  const [search, setSearch] = useState(initialParams.search || '');
  const [sortBy, setSortBy] = useState(initialParams.sortBy || 'id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialParams.sortOrder || 'desc');
  const [page, setPage] = useState(
    initialParams.offset ? Math.floor(initialParams.offset / (initialParams.limit || 10)) + 1 : 1
  );
  const [pageSize, setPageSize] = useState(initialParams.limit || 10);
  const [author, setAuthor] = useState<string | undefined>(initialParams.author);
  const [source, setSource] = useState<string | undefined>(initialParams.source);

  // Generate query params based on local state
  const queryParams: QuotesParams = {
    search: search || undefined,
    sortBy,
    sortOrder,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    author,
    source,
  };

  // Use TanStack Query for data fetching
  const { data, isLoading, error, refetch } = useQuotes(queryParams);

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
    author,
    source,

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
    setAuthor: (_newAuthor: string | undefined) => {
      setAuthor(_newAuthor);
      setPage(1); // Reset to first page on author filter change
    },
    setSource: (_newSource: string | undefined) => {
      setSource(_newSource);
      setPage(1); // Reset to first page on source filter change
    },
    refreshData: refetch,
  };
}
