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

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

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
  onSearch: (query: string, filters: Record<string, string>) => void;
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
  searchAsYouType = false, // Changed default to false
  searchButtonText = 'Search',
  filtersUpdateOnChange = false,
  buttonVariant = 'primary',
}: SearchBarProps) {
  // Access theme context
  const { isDarkMode } = useTheme();
  
  // Search input state (current value in input)
  const [query, setQuery] = useState(initialQuery);
  
  // The last search query that was actually submitted/triggered
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  
  // Filters state in UI
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
    // Initialize with default values from filter configs
    return filters.reduce((acc, filter) => {
      acc[filter.name] = filter.defaultValue || '';
      return acc;
    }, {} as Record<string, string>);
  });
  
  // The last set of filters that were actually submitted/triggered
  const [submittedFilters, setSubmittedFilters] = useState<Record<string, string>>(
    filters.reduce((acc, filter) => {
      acc[filter.name] = filter.defaultValue || '';
      return acc;
    }, {} as Record<string, string>)
  );
  
  // For debouncing search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any existing timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // If searchAsYouType is enabled, trigger search with debounce
    if (searchAsYouType) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      if (debounceMs > 0) {
        searchTimeoutRef.current = setTimeout(() => {
          triggerSearch(newQuery, activeFilters);
        }, debounceMs);
      } else {
        triggerSearch(newQuery, activeFilters);
      }
    }
  };
  
  // Handle filter change
  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...activeFilters, [filterName]: value };
    setActiveFilters(newFilters);
    
    // If filtersUpdateOnChange is true, trigger search
    if (filtersUpdateOnChange) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      if (debounceMs > 0) {
        searchTimeoutRef.current = setTimeout(() => {
          triggerSearch(query, newFilters);
        }, debounceMs);
      } else {
        triggerSearch(query, newFilters);
      }
    }
  };
  
  // Centralized function to trigger search and update submitted state
  const triggerSearch = (searchQuery: string, searchFilters: Record<string, string>) => {
    setSubmittedQuery(searchQuery);
    setSubmittedFilters(searchFilters);
    onSearch(searchQuery, searchFilters);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only trigger search on form submission if searchAsYouType is false
    // When searchAsYouType is true, search is already triggered on input change
    if (!searchAsYouType) {
      triggerSearch(query, activeFilters);
    }
  };
  
  // Handle clearing the search
  const handleClear = () => {
    setQuery('');
    
    // If searchAsYouType is enabled, also trigger the search with empty query
    if (searchAsYouType) {
      triggerSearch('', activeFilters);
    }
  };
  
  // Determine if current input differs from last submitted search
  const hasUnsearchedChanges = query !== submittedQuery || 
    Object.entries(activeFilters).some(
      ([key, value]) => value !== submittedFilters[key]
    );
  
  // Generate button class based on variant
  const getButtonClasses = () => {
    const baseClasses = "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
    
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
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row gap-2"
        // When searchAsYouType is true, we suppress the Enter key to prevent accidental form submissions
        onKeyDown={searchAsYouType ? (e) => e.key === 'Enter' && e.preventDefault() : undefined}
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
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 
              rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
              text-gray-900 dark:text-white bg-white dark:bg-gray-700
              focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            aria-label="Search"
          />
          
          {/* Clear button - only show when there's text */}
          {query && (
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
        {filters.map((filter) => (
          <div key={filter.name} className="sm:w-auto">
            <select
              value={activeFilters[filter.name] || ''}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700
                focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              aria-label={filter.label}
            >
              {filter.options.map((option) => (
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
  );
}