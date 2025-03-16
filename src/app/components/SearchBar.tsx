'use client';

/**
 * SearchBar Component
 * 
 * A reusable search input component with optional filters.
 * Features:
 * - Text input for search
 * - Clear button to reset search
 * - Optional filter dropdowns
 * - Responsive design
 * - Dark mode support
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
  /** Whether search is triggered as you type */
  searchAsYouType?: boolean;
}

export default function SearchBar({
  onSearch,
  initialQuery = '',
  placeholder = 'Search...',
  className = '',
  filters = [],
  debounceMs = 300,
  searchAsYouType = true,
}: SearchBarProps) {
  // Access theme context
  const { isDarkMode } = useTheme();
  
  // Search input state
  const [query, setQuery] = useState(initialQuery);
  
  // Filters state
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
    // Initialize with default values from filter configs
    return filters.reduce((acc, filter) => {
      acc[filter.name] = filter.defaultValue || '';
      return acc;
    }, {} as Record<string, string>);
  });
  
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
  
  // Handle input change with optional debounce
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
          onSearch(newQuery, activeFilters);
        }, debounceMs);
      } else {
        onSearch(newQuery, activeFilters);
      }
    }
  };
  
  // Handle filter change
  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...activeFilters, [filterName]: value };
    setActiveFilters(newFilters);
    
    // Trigger search when filter changes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (debounceMs > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(query, newFilters);
      }, debounceMs);
    } else {
      onSearch(query, newFilters);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, activeFilters);
  };
  
  // Handle clearing the search
  const handleClear = () => {
    setQuery('');
    onSearch('', activeFilters);
  };
  
  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
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
        
        {/* Search button - only show if not searchAsYouType */}
        {!searchAsYouType && (
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
              shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
            aria-label="Submit search"
          >
            Search
          </button>
        )}
      </form>
    </div>
  );
}