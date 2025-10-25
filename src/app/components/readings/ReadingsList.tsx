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

import { useCallback, useState } from 'react';
import Image from 'next/image';
import type { Reading } from '@/types';
import { logger } from '@/lib/logger';

// Sort option interface
interface ListSortOption {
  field: string;
  order: 'asc' | 'desc';
}

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
    logger.warn(`Error formatting date: ${error instanceof Error ? error.message : String(error)}`);
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
  onSortChange: (field: string) => void;

  /** Current search query for highlighting */
  searchQuery?: string;

  /** Function to call when a reading item is selected */
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
    logger.warn(
      `Error highlighting search term: ${error instanceof Error ? error.message : String(error)}`
    );
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

  // Favorites filter state
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filter readings by favorites if enabled
  const filteredReadings = showOnlyFavorites
    ? readings.filter(reading => reading.favorite)
    : readings;

  // Function to handle sort column click
  const handleSortClick = useCallback(
    (field: string) => {
      onSortChange(field);
    },
    [onSortChange]
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Favorites Filter Toggle */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: showOnlyFavorites ? 'var(--primary-color)' : 'transparent',
            color: showOnlyFavorites ? 'white' : 'var(--text-color)',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
          aria-label={showOnlyFavorites ? 'Show all readings' : 'Show only favorites'}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {showOnlyFavorites ? 'Show All' : 'Favorites Only'}
        </button>
      </div>

      {/* Column Headers with Enhanced Sort Indicators */}
      <div className="border-b border-gray-200 dark:border-gray-700" role="grid">
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
      {filteredReadings.length === 0 ? (
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
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">No readings found</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'Try adjusting your search criteria or filters'
              : 'Start building your literary collection'}
          </p>
        </div>
      ) : (
        <ul className="item-list-body" aria-label="Readings list">
          {filteredReadings.map(reading => (
            <li key={reading.slug} className="list-none">
              <div
                className={`item-list-item group ${selectedReading?.slug === reading.slug ? 'item-list-item-selected' : ''} hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150`}
                role="button"
                onClick={() => onSelectReading(reading)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectReading(reading);
                    e.preventDefault();
                  }
                }}
                tabIndex={0}
                aria-current={selectedReading?.slug === reading.slug ? 'true' : 'false'}
              >
                <div className="flex items-start gap-3">
                  {/* Book Cover Image or Placeholder */}
                  {reading.coverImageSrc ? (
                    <div className="h-14 w-10 flex-shrink-0 rounded overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 group-hover:shadow-sm">
                      {/* External image URLs are handled by Next.js Image component */}
                      {reading.coverImageSrc ? (
                        <Image
                          src={reading.coverImageSrc}
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

                      {reading.audiobook && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                          <svg
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                          </svg>
                          Audiobook
                        </span>
                      )}
                    </div>
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
