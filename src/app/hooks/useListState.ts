'use client';

/**
 * useListState Hook
 *
 * A custom hook for managing state in admin list views with search, filtering,
 * sorting, and pagination capabilities.
 */

import { useState, useEffect, useCallback, useReducer } from 'react';

// Types for list state
export interface ListSortOption {
  field: string;
  order: 'asc' | 'desc';
}

export interface ListPaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ListState<TItem, TFilter extends Record<string, any> = Record<string, any>> {
  items: TItem[];
  search: string;
  filters: TFilter;
  sort: ListSortOption;
  pagination: ListPaginationState;
  isLoading: boolean;
  error: string | null;
}

// Action types for reducer
type ListAction<TItem, TFilter extends Record<string, any> = Record<string, any>> =
  | { type: 'SET_ITEMS'; payload: TItem[] }
  | { type: 'SET_TOTAL_ITEMS'; payload: number }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTERS'; payload: TFilter }
  | { type: 'UPDATE_FILTER'; payload: { key: string; value: any } }
  | { type: 'SET_SORT'; payload: ListSortOption }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Options for the hook
export interface ListStateOptions<
  TItem,
  TFilter extends Record<string, any> = Record<string, any>,
> {
  /** Function to fetch data */
  fetchItems: (params: any) => Promise<{
    data: TItem[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
  }>;
  /** Initial search query */
  initialSearch?: string;
  /** Initial filter values */
  initialFilters?: TFilter;
  /** Initial sort option */
  initialSort?: ListSortOption;
  /** Initial page size */
  initialPageSize?: number;
  /** Whether to fetch data on mount */
  fetchOnMount?: boolean;
  /** Debounce time in ms for search */
  searchDebounce?: number;
}

/**
 * Creates a reducer for the list state
 */
function createListReducer<TItem, TFilter extends Record<string, any> = Record<string, any>>() {
  return (
    state: ListState<TItem, TFilter>,
    action: ListAction<TItem, TFilter>
  ): ListState<TItem, TFilter> => {
    switch (action.type) {
      case 'SET_ITEMS':
        return { ...state, items: action.payload };
      case 'SET_TOTAL_ITEMS':
        return {
          ...state,
          pagination: {
            ...state.pagination,
            totalItems: action.payload,
            totalPages: Math.ceil(action.payload / state.pagination.pageSize),
          },
        };
      case 'SET_SEARCH':
        return {
          ...state,
          search: action.payload,
          // Reset to first page when search changes
          pagination: {
            ...state.pagination,
            currentPage: 1,
          },
        };
      case 'SET_FILTERS':
        return {
          ...state,
          filters: action.payload,
          // Reset to first page when filters change
          pagination: {
            ...state.pagination,
            currentPage: 1,
          },
        };
      case 'UPDATE_FILTER':
        return {
          ...state,
          filters: {
            ...state.filters,
            [action.payload.key]: action.payload.value,
          },
          // Reset to first page when filter changes
          pagination: {
            ...state.pagination,
            currentPage: 1,
          },
        };
      case 'SET_SORT':
        return { ...state, sort: action.payload };
      case 'SET_PAGE':
        return {
          ...state,
          pagination: {
            ...state.pagination,
            currentPage: action.payload,
          },
        };
      case 'SET_PAGE_SIZE':
        return {
          ...state,
          pagination: {
            ...state.pagination,
            pageSize: action.payload,
            totalPages: Math.ceil(state.pagination.totalItems / action.payload),
            // Reset to first page when page size changes
            currentPage: 1,
          },
        };
      case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      default:
        return state;
    }
  };
}

/**
 * A custom hook for managing admin list views with search, filter, sort and pagination
 */
export function useListState<TItem, TFilter extends Record<string, any> = Record<string, any>>(
  options: ListStateOptions<TItem, TFilter>
) {
  const {
    fetchItems,
    initialSearch = '',
    initialFilters = {} as TFilter,
    initialSort = { field: 'id', order: 'desc' },
    initialPageSize = 10,
    fetchOnMount = true,
    searchDebounce = 300,
  } = options;

  // Create the reducer
  const listReducer = createListReducer<TItem, TFilter>();

  // Initial state
  const initialState: ListState<TItem, TFilter> = {
    items: [],
    search: initialSearch,
    filters: initialFilters,
    sort: initialSort,
    pagination: {
      currentPage: 1,
      pageSize: initialPageSize,
      totalItems: 0,
      totalPages: 0,
    },
    isLoading: false,
    error: null,
  };

  // Setup reducer
  const [state, dispatch] = useReducer(listReducer, initialState);

  // For debouncing search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch data based on current state
  const fetchData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Calculate offset for pagination
      const offset = (state.pagination.currentPage - 1) * state.pagination.pageSize;

      // Prepare query parameters
      const params = {
        search: state.search,
        ...state.filters,
        sortBy: state.sort.field,
        sortOrder: state.sort.order,
        limit: state.pagination.pageSize,
        offset,
      };

      console.log(`Fetching data for page ${state.pagination.currentPage} with params:`, params);

      // Fetch data using the provided function
      const result = await fetchItems(params);

      // Update state with fetched data
      dispatch({ type: 'SET_ITEMS', payload: result.data });
      dispatch({ type: 'SET_TOTAL_ITEMS', payload: result.totalCount });

      // Only update page size if provided by API - don't override current page
      // This prevents the pagination from resetting to page 1 when fetching next pages
      if (result.pageSize && result.pageSize !== state.pagination.pageSize) {
        dispatch({
          type: 'SET_PAGE_SIZE',
          payload: result.pageSize,
        });
      }
    } catch (error) {
      console.error('Error fetching list data:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An error occurred while fetching data',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    fetchItems,
    state.search,
    state.filters,
    state.sort.field,
    state.sort.order,
    state.pagination.currentPage,
    state.pagination.pageSize,
  ]);

  // Fetch data on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchData, fetchOnMount]);

  // Handler for updating search with debounce
  const setSearch = useCallback(
    (search: string) => {
      // Clear any existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set a new timeout for debounce
      const timeout = setTimeout(() => {
        dispatch({ type: 'SET_SEARCH', payload: search });
      }, searchDebounce);

      setSearchTimeout(timeout);
    },
    [searchDebounce, searchTimeout]
  );

  // Handler for updating a single filter
  const updateFilter = useCallback((key: string, value: any) => {
    dispatch({ type: 'UPDATE_FILTER', payload: { key, value } });
  }, []);

  // Handler for updating all filters at once
  const setFilters = useCallback((filters: TFilter) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Handler for updating sort
  const setSort = useCallback((field: string, order: 'asc' | 'desc' = 'asc') => {
    dispatch({ type: 'SET_SORT', payload: { field, order } });
  }, []);

  // Handler for toggling sort on a field
  const toggleSort = useCallback(
    (field: string) => {
      if (state.sort.field === field) {
        // Toggle order if already sorting by this field
        dispatch({
          type: 'SET_SORT',
          payload: {
            field,
            order: state.sort.order === 'asc' ? 'desc' : 'asc',
          },
        });
      } else {
        // Default to ascending order when changing fields
        dispatch({
          type: 'SET_SORT',
          payload: { field, order: 'asc' },
        });
      }
    },
    [state.sort.field, state.sort.order]
  );

  // Handler for changing page
  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  // Handler for changing page size
  const setPageSize = useCallback((size: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: size });
  }, []);

  // Return the state and handlers
  return {
    // State
    items: state.items,
    search: state.search,
    filters: state.filters,
    sort: state.sort,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    setSearch,
    updateFilter,
    setFilters,
    setSort,
    toggleSort,
    setPage,
    setPageSize,

    // Data fetching
    refreshData: fetchData,
  };
}
