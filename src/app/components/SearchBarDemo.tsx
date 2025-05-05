'use client';

/**
 * SearchBarDemo Component
 *
 * A demo component that shows how to use the SearchBar with filters.
 * This is for demonstration and testing purposes.
 */

import { useState } from 'react';
import SearchBar, { FilterConfig } from './SearchBar';

export default function SearchBarDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [results, setResults] = useState<string>('Search results will appear here');

  // Example filters for reading status
  const filters: FilterConfig[] = [
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'read', label: 'Read' },
        { value: 'dropped', label: 'Dropped' },
      ],
      defaultValue: '',
    },
    {
      name: 'sortBy',
      label: 'Sort By',
      options: [
        { value: 'date', label: 'Date' },
        { value: 'title', label: 'Title' },
        { value: 'author', label: 'Author' },
      ],
      defaultValue: 'date',
    },
  ];

  // Handle search
  const handleSearch = (query: string, filters: Record<string, string>) => {
    setSearchQuery(query);
    setActiveFilters(filters);

    // In a real component, you would typically:
    // 1. Make an API request with the search params
    // 2. Update state with the results
    // 3. Render the results in the UI

    // For this demo, just display the search parameters
    setResults(
      `Search Query: "${query}"\nFilters: ${Object.entries(filters)
        .map(([key, value]) => `${key}: ${value || '(none)'}`)
        .join(', ')}`
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">SearchBar Demo</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search readings..."
          filters={filters}
          debounceMs={300}
          searchAsYouType={true}
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-gray-800 dark:text-gray-200">
        <h3 className="text-sm font-medium mb-2">Current Search Parameters:</h3>
        <pre className="whitespace-pre-wrap text-xs">{results}</pre>
      </div>
    </div>
  );
}
