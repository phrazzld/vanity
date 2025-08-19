'use client';

/**
 * SearchBar Component
 *
 * A reusable search input component with optional filters.
 * Features:
 * - Text input for search
 * - Search button for explicit search triggering
 * - Clear button to reset search
 * - Optional filter dropdowns
 * - Responsive design
 * - Dark mode support
 * - Support for both button-triggered and automatic searching
 */

import { useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFormState } from '@/hooks/useFormState';
import { useSearchFilters, type FilterConfig as HookFilterConfig } from '@/hooks/useSearchFilters';
import { useDebouncedCallback } from '@/hooks/useDebounce';

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterConfig = {
  name: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
};

export interface SearchBarProps {
  /** Callback when search is triggered */
  onSearch: (_query: string, _filters: Record<string, string>) => void;
  /** Initial search value */
  initialQuery?: string;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Additional class names for the component */
  className?: string;
  /** Optional array of filter configurations */
  filters?: FilterConfig[];
  /** Debounce delay in milliseconds (0 to disable) */
  debounceMs?: number;
  /** Whether to search automatically as user types (false means search only on button click) */
  searchAsYouType?: boolean;
  /** Text to display on the search button (if showButton is true) */
  searchButtonText?: string;
  /** Whether to update filters automatically or only on search button click */
  filtersUpdateOnChange?: boolean;
  /** Button variant: 'primary', 'secondary', or 'minimal' */
  buttonVariant?: 'primary' | 'secondary' | 'minimal';
  /** Whether to show the search button */
  showButton?: boolean;
}

export default function SearchBar({
  onSearch,
  initialQuery = '',
  placeholder = 'Search...',
  className = '',
  filters = [],
  debounceMs = 300,
  searchAsYouType = false,
  searchButtonText = 'Search',
  filtersUpdateOnChange = false,
  buttonVariant = 'primary',
}: SearchBarProps) {
  // Access theme context - required for context
  useTheme();

  // Use useFormState for query management (dual state tracking)
  const queryState = useFormState({ query: initialQuery });

  // Use useSearchFilters for filter management (dual state tracking)
  const filterState = useSearchFilters(filters as HookFilterConfig[]);

  // Create debounced search function
  const debouncedSearch = useDebouncedCallback(
    (searchQuery: string, searchFilters: Record<string, string>) => {
      // Submit both states
      queryState.submitWithCallback(() => {
        filterState.submitWithCallback(() => {
          onSearch(searchQuery, searchFilters);
        });
      });
    },
    debounceMs
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      queryState.setValue('query', newQuery);

      // If searchAsYouType is enabled, trigger search with debounce
      if (searchAsYouType) {
        if (debounceMs > 0) {
          debouncedSearch(newQuery, filterState.activeFilters);
        } else {
          queryState.submitWithCallback(() => {
            filterState.submitWithCallback(() => {
              onSearch(newQuery, filterState.activeFilters);
            });
          });
        }
      }
    },
    [searchAsYouType, debounceMs, debouncedSearch, queryState, filterState, onSearch]
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (filterName: string, value: string) => {
      filterState.setFilter(filterName, value);

      // If filtersUpdateOnChange is true, trigger search
      if (filtersUpdateOnChange) {
        if (debounceMs > 0) {
          debouncedSearch(queryState.values.query, {
            ...filterState.activeFilters,
            [filterName]: value,
          });
        } else {
          queryState.submitWithCallback(() => {
            filterState.submitWithCallback(() => {
              onSearch(queryState.values.query, {
                ...filterState.activeFilters,
                [filterName]: value,
              });
            });
          });
        }
      }
    },
    [filtersUpdateOnChange, debounceMs, debouncedSearch, queryState, filterState, onSearch]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Only trigger search on form submission if searchAsYouType is false
      if (!searchAsYouType) {
        queryState.submitWithCallback(() => {
          filterState.submitWithCallback(() => {
            onSearch(queryState.values.query, filterState.activeFilters);
          });
        });
      }
    },
    [searchAsYouType, queryState, filterState, onSearch]
  );

  // Handle clearing the search
  const handleClear = useCallback(() => {
    queryState.setValue('query', '');

    // Always trigger the search with empty query when clearing
    queryState.submitWithCallback(() => {
      filterState.submitWithCallback(() => {
        onSearch('', filterState.activeFilters);
      });
    });
  }, [queryState, filterState, onSearch]);

  // Determine if current input differs from last submitted search
  const hasUnsearchedChanges = queryState.hasChanges || filterState.hasChanges;

  // Generate button class based on variant
  const getButtonClasses = () => {
    const baseClasses =
      'inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (buttonVariant) {
      case 'secondary':
        return `${baseClasses} border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-500 dark:focus:ring-offset-gray-900`;
      case 'minimal':
        return `${baseClasses} border-transparent bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-blue-500 dark:focus:ring-offset-gray-900`;
      case 'primary':
      default:
        return `${baseClasses} border-transparent bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white focus:ring-blue-500 dark:focus:ring-offset-gray-900`;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col sm:flex-row gap-2"
          role="search"
        >
          {/* Search input with icon and clear button */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="text"
              value={queryState.values.query}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 
              rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
              text-gray-900 dark:text-white bg-white dark:bg-gray-700
              focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              aria-label="Search"
              // When searchAsYouType is true, we suppress the Enter key to prevent accidental form submissions
              onKeyDown={searchAsYouType ? e => e.key === 'Enter' && e.preventDefault() : undefined}
            />

            {/* Clear button - only show when there's text */}
            {queryState.values.query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          {filters.map(filter => (
            <div key={filter.name} className="sm:w-auto">
              <select
                value={filterState.activeFilters[filter.name] || ''}
                onChange={e => handleFilterChange(filter.name, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700
                focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label={filter.label}
              >
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Search button - only show when searchAsYouType is false */}
          {!searchAsYouType && (
            <button
              type="submit"
              className={`${getButtonClasses()} ${hasUnsearchedChanges ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900' : ''}`}
              aria-label="Submit search"
            >
              {searchButtonText}
              {hasUnsearchedChanges && (
                <span className="flex h-2 w-2 ml-1.5">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                  </span>
                </span>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
