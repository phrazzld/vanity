'use client';

/**
 * ReadingsListStateDemo Component
 *
 * A demonstration component showing how to use the useReadingsList hook
 * This is for demonstration purposes only.
 */

import { useReadingsList } from '../hooks/useReadingsList';
import SearchBar from './SearchBar';
import { FilterConfig } from './SearchBar';

export default function ReadingsListStateDemo() {
  // Initialize the readings list state with default options
  const {
    items: readings,
    search,
    filters,
    sort,
    pagination,
    isLoading,
    error,
    setSearch,
    updateFilter,
    setSort,
    toggleSort,
    setPage,
    setPageSize,
    refreshData,
  } = useReadingsList({
    initialFilters: { status: 'all' },
    initialSort: { field: 'date', order: 'desc' },
    initialPageSize: 10,
    fetchOnMount: true,
  });

  // Filter configuration for the search bar
  const filterConfig: FilterConfig[] = [
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All' },
        { value: 'read', label: 'Read' },
        { value: 'dropped', label: 'Dropped' },
      ],
      defaultValue: filters.status || 'all',
    },
  ];

  // Handle search and filter changes
  const handleSearch = (query: string, searchFilters: Record<string, string>) => {
    setSearch(query);
    updateFilter('status', searchFilters.status);
  };

  // Handle column header click for sorting
  const handleColumnHeaderClick = (field: string) => {
    toggleSort(field);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Readings List Demo</h2>

      {/* Search and filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <SearchBar
          onSearch={handleSearch}
          initialQuery={search}
          placeholder="Search readings..."
          filters={filterConfig}
        />
      </div>

      {/* Status and loading indicators */}
      {isLoading && (
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-md">
          Loading readings...
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md">
          Error: {error}
        </div>
      )}

      {/* Readings list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleColumnHeaderClick('title')}
              >
                Title
                {sort.field === 'title' && (
                  <span className="ml-1">{sort.order === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleColumnHeaderClick('author')}
              >
                Author
                {sort.field === 'author' && (
                  <span className="ml-1">{sort.order === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleColumnHeaderClick('date')}
              >
                Date
                {sort.field === 'date' && (
                  <span className="ml-1">{sort.order === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {readings.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                  No readings found. Try adjusting your search or filters.
                </td>
              </tr>
            ) : (
              readings.map(reading => (
                <tr key={reading.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {reading.title}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {reading.author}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {reading.finishedDate
                      ? new Date(reading.finishedDate).toLocaleDateString()
                      : 'Not finished'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {readings.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                {/* Simple page numbers - in a real app, you'd want to generate these dynamically */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium
                      ${
                        pagination.currentPage === i + 1
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
