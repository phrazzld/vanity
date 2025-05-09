'use client';

/**
 * ReadingsList Component (TanStack Query Version)
 *
 * This component displays a list of readings using the enhanced useReadingsList
 * hook with TanStack Query for data fetching.
 */

// Component manages state through useReadingsListV2 hook
import { useReadingsListV2 } from '@/app/hooks/useReadingsList.v2';
import ReadingCard from './ReadingCard';
import Pagination from '../Pagination';
import SearchBar from '../SearchBar';
import ReadingListSkeleton from '../ReadingListSkeleton';
import YearSection from './YearSection';
import type { Reading } from '@/types';

// Group readings by year
function groupReadingsByYear(readings: Reading[]): Map<number, Reading[]> {
  const grouped = new Map<number, Reading[]>();

  readings.forEach(reading => {
    // Use finishedDate instead of date
    const year = new Date(reading.finishedDate || new Date()).getFullYear();
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)?.push(reading);
  });

  // Sort by year descending
  return new Map([...grouped.entries()].sort((a, b) => b[0] - a[0]));
}

export function ReadingsListV2() {
  // We'll use the status directly from the hook

  // Use the enhanced readings list hook with TanStack Query
  const {
    items: readings,
    totalItems,
    totalPages,
    isLoading,
    error,
    search,
    setSearch,
    page,
    setPage,
    status,
    setStatus,
  } = useReadingsListV2({
    // Initial parameters
    sortBy: 'date',
    sortOrder: 'desc',
    limit: 20,
  });

  // Handle search changes
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  // Handle status filter changes
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as 'all' | 'read' | 'dropped');
  };

  // Group readings by year if not searching
  const groupedReadings = search ? null : groupReadingsByYear(readings);

  // Handle loading and error states
  if (isLoading) return <ReadingListSkeleton />;
  if (error) return <div className="text-red-500">Error loading readings: {error.message}</div>;

  // Render the component
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <SearchBar
          onSearch={query => handleSearchChange(query)}
          initialQuery={search}
          placeholder="Search readings..."
          searchAsYouType={true}
        />

        <div className="flex items-center">
          <label htmlFor="status-filter" className="mr-2 text-sm font-medium">
            Status:
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={handleStatusChange}
            className="rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
          >
            <option value="all">All</option>
            <option value="read">Read</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
      </div>

      {readings.length === 0 ? (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          {search ? `No readings found matching "${search}"` : 'No readings available'}
        </div>
      ) : (
        <>
          {/* Show as year sections when not searching */}
          {!search && groupedReadings ? (
            Array.from(groupedReadings.entries()).map(([year, yearReadings]) => (
              <YearSection key={year} year={year.toString()} readings={yearReadings} />
            ))
          ) : (
            /* Show as a flat list when searching */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {readings.map(reading => (
                <ReadingCard key={reading.id} {...reading} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              pageSize={20}
            />
          )}
        </>
      )}
    </div>
  );
}
