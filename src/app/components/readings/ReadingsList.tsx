'use client';

/**
 * ReadingsList Component
 *
 * A reusable component for displaying a list of readings with support for:
 * - Sorting columns with visual indicators
 * - Search term highlighting
 * - Empty state handling
 * - Selection for bulk operations
 * - Responsive design
 */

import { useCallback } from 'react';
import Image from 'next/image';
import type { Reading } from '@/types';
import type { ListSortOption } from '@/app/hooks';

/**
 * Format a date without timezone issues
 * This solves the problem where dates appear off by one day due to timezone conversion
 */
function formatDateWithoutTimezoneIssue(dateInput: string | Date): string {
  if (!dateInput) return '';

  try {
    // For string inputs, handle ISO format directly to avoid timezone conversion issues
    if (typeof dateInput === 'string') {
      // Extract date parts directly from the ISO string (YYYY-MM-DD)
      // This approach prevents any timezone adjustments
      const datePart = dateInput.split('T')[0];
      if (datePart) {
        const parts = datePart.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0] || '0', 10);
          const month = parseInt(parts[1] || '1', 10);
          const day = parseInt(parts[2] || '1', 10);
          return `${month}/${day}/${year}`;
        }
      }
    }

    // For Date objects or if string parsing fails, use UTC methods to avoid timezone issues
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Use UTC methods to prevent timezone offset issues
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // Months are 0-indexed
    const day = date.getUTCDate();

    // Format the date as MM/DD/YYYY
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    // Fallback to showing the raw date as a string
    return String(dateInput);
  }
}

// Icons for sort indicators
const SortAscIcon = () => (
  <svg
    className="w-4 h-4 ml-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const SortDescIcon = () => (
  <svg
    className="w-4 h-4 ml-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Interface for the ReadingsList props
export interface ReadingsListProps {
  /** Array of reading items to display */
  readings: Reading[];

  /** Currently active sort configuration */
  sort: ListSortOption;

  /** Function to call when a column header is clicked for sorting */
  // eslint-disable-next-line no-unused-vars
  onSortChange: (field: string) => void;

  /** Current search query for highlighting */
  searchQuery?: string;

  /** Function to call when a reading item is selected */
  // eslint-disable-next-line no-unused-vars
  onSelectReading: (reading: Reading) => void;

  /** Currently selected reading (if any) */
  selectedReading?: Reading | null;

  /** Custom CSS class to apply to the component */
  className?: string;
}

/**
 * Utility function to highlight search terms in text
 */
const highlightSearchTerm = (text: string, searchTerm: string) => {
  if (!searchTerm || !text) return text;

  try {
    // Escape special regex characters to prevent errors
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi'); // Use 'gi' for global and case-insensitive

    const parts = text.split(regex);

    return parts.map((part, i) => {
      // Check against the original (case-preserved) search term for highlighting
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <mark
            key={i}
            className="bg-yellow-100 dark:bg-yellow-900 text-gray-900 dark:text-yellow-200 px-0.5 rounded"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  } catch (error) {
    // If there's any error with the regex, just return the original text
    console.error('Error highlighting search term:', error);
    return text;
  }
};

export default function ReadingsList({
  readings,
  sort,
  onSortChange, // Used in handleSortClick to pass field name to parent
  searchQuery = '',
  onSelectReading, // Called when a reading list item is clicked
  selectedReading,
  className = '',
}: ReadingsListProps) {
  // Theme context is not currently used in this component but may be used in future updates
  // const { isDarkMode } = useTheme();

  // Function to handle sort column click
  const handleSortClick = useCallback(
    (field: string) => {
      onSortChange(field);
    },
    [onSortChange]
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Column Headers with Enhanced Sort Indicators */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div
          className="grid grid-cols-12 py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750"
          role="row"
        >
          <div
            className="col-span-7 flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
            onClick={() => handleSortClick('title')}
            role="columnheader"
            aria-sort={
              sort.field === 'title' ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'
            }
            tabIndex={0}
          >
            <span>TITLE</span>
            {sort.field === 'title' ? (
              sort.order === 'asc' ? (
                <SortAscIcon />
              ) : (
                <SortDescIcon />
              )
            ) : (
              <span className="ml-1 text-gray-300 dark:text-gray-600">↕</span>
            )}
          </div>

          <div
            className="col-span-3 flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
            onClick={() => handleSortClick('author')}
            role="columnheader"
            aria-sort={
              sort.field === 'author' ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'
            }
            tabIndex={0}
          >
            <span>AUTHOR</span>
            {sort.field === 'author' ? (
              sort.order === 'asc' ? (
                <SortAscIcon />
              ) : (
                <SortDescIcon />
              )
            ) : (
              <span className="ml-1 text-gray-300 dark:text-gray-600">↕</span>
            )}
          </div>

          <div
            className="col-span-2 flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150"
            onClick={() => handleSortClick('date')}
            role="columnheader"
            aria-sort={
              sort.field === 'date' ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'
            }
            tabIndex={0}
          >
            <span>DATE</span>
            {sort.field === 'date' ? (
              sort.order === 'asc' ? (
                <SortAscIcon />
              ) : (
                <SortDescIcon />
              )
            ) : (
              <span className="ml-1 text-gray-300 dark:text-gray-600">↕</span>
            )}
          </div>
        </div>
      </div>

      {/* Readings List Items */}
      {readings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">No readings found</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'Try adjusting your search criteria or filters'
              : 'Start building your literary collection'}
          </p>
        </div>
      ) : (
        <ul className="item-list-body" role="list" aria-label="Readings list">
          {readings.map(reading => (
            <li
              key={reading.slug}
              className={`item-list-item group ${selectedReading?.slug === reading.slug ? 'item-list-item-selected' : ''} hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150`}
              onClick={() => onSelectReading(reading)}
              role="listitem"
              tabIndex={0}
              aria-current={selectedReading?.slug === reading.slug ? 'true' : 'false'}
            >
              <div className="flex items-start gap-3">
                {/* Book Cover Image or Placeholder */}
                {reading.coverImageSrc ? (
                  <div className="h-14 w-10 flex-shrink-0 rounded overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 group-hover:shadow-sm">
                    {/* Use client-side environment variable */}
                    {typeof window !== 'undefined' && window.ENV_NEXT_PUBLIC_SPACES_BASE_URL ? (
                      <Image
                        src={`${window.ENV_NEXT_PUBLIC_SPACES_BASE_URL}${reading.coverImageSrc}`}
                        alt={`Cover for ${reading.title}`}
                        width={40}
                        height={56}
                        className="h-full w-full object-cover"
                        onError={e => {
                          e.currentTarget.src = '/images/projects/book-02.webp';
                        }}
                      />
                    ) : (
                      <Image
                        src="/images/projects/book-02.webp"
                        alt={`Cover for ${reading.title}`}
                        width={40}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-14 w-10 flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 transition-all duration-200 group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                )}

                {/* Reading Details with Search Highlighting */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate flex gap-1 items-center">
                    {searchQuery &&
                    reading.title.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                      <span>{highlightSearchTerm(reading.title, searchQuery)}</span>
                    ) : (
                      reading.title
                    )}
                  </h3>

                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 truncate">
                    {searchQuery &&
                    reading.author.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                      <span>{highlightSearchTerm(reading.author, searchQuery)}</span>
                    ) : (
                      reading.author
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <svg
                        className="h-3 w-3 text-gray-400 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {reading.finishedDate
                        ? formatDateWithoutTimezoneIssue(reading.finishedDate)
                        : 'Unfinished'}
                    </span>

                    {reading.dropped && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                        Dropped
                      </span>
                    )}

                    {/* Add this to show when content search matches */}
                    {searchQuery &&
                      reading.thoughts &&
                      reading.thoughts.toLowerCase().includes(searchQuery.toLowerCase()) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                          Match in content
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
