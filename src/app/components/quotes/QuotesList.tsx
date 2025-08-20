'use client';

/**
 * QuotesList Component
 *
 * A reusable component for displaying a list of quotes with support for:
 * - Sorting columns with visual indicators
 * - Search term highlighting
 * - Empty state handling
 * - Responsive design
 */

import { useCallback } from 'react';
import type { Quote } from '@/types';
import { useTheme } from '@/store/ui';
import { logger } from '@/lib/logger';

// Sort option interface
interface ListSortOption {
  field: string;
  order: 'asc' | 'desc';
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

// Interface for the QuotesList props
export interface QuotesListProps {
  /** Array of quote items to display */
  quotes: Quote[];

  /** Currently active sort configuration */
  sort: ListSortOption;

  /** Function to call when a column header is clicked for sorting */
  onSortChange: (_field: string) => void;

  /** Current search query for highlighting */
  searchQuery?: string;

  /** Function to call when a quote item is selected */
  onSelectQuote: (_quote: Quote) => void;

  /** Currently selected quote (if any) */
  selectedQuote?: Quote | null;

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

/**
 * Utility function to truncate text to a maximum length
 */
const truncateText = (text: string, maxLength = 60) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function QuotesList({
  quotes,
  sort,
  onSortChange,
  searchQuery = '',
  onSelectQuote,
  selectedQuote,
  className = '',
}: QuotesListProps) {
  // Using theme context for future dark mode styling enhancements
  const { isDarkMode: _isDarkMode } = useTheme();

  // Function to handle sort column click
  const handleSortClick = useCallback(
    (_field: string) => {
      onSortChange(_field);
    },
    [onSortChange]
  );

  // Render column header with sort indicator
  const renderColumnHeader = (field: string, label: string, colSpan: string) => {
    const isActive = sort.field === field;
    const ariaSort = isActive ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none';

    return (
      <div
        className={`${colSpan} flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150`}
        onClick={() => handleSortClick(field)}
        role="columnheader"
        aria-sort={ariaSort}
        tabIndex={0}
      >
        <span>{label}</span>
        {isActive ? (
          sort.order === 'asc' ? (
            <SortAscIcon />
          ) : (
            <SortDescIcon />
          )
        ) : (
          <span className="ml-1 text-gray-300 dark:text-gray-600">↕</span>
        )}
      </div>
    );
  };

  // Render column headers section
  const renderColumnHeaders = () => (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div
        className="grid grid-cols-12 py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750"
        role="row"
      >
        {renderColumnHeader('text', 'QUOTE', 'col-span-9')}
        {renderColumnHeader('author', 'AUTHOR', 'col-span-3')}
      </div>
    </div>
  );

  // Render empty state when no quotes
  const renderEmptyState = () => (
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">No quotes found</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {searchQuery
          ? 'Try adjusting your search criteria or filters'
          : 'Start building your collection of inspirational quotes'}
      </p>
    </div>
  );

  // Render individual quote item
  const renderQuoteItem = (quote: Quote) => {
    const isSelected = selectedQuote?.id === quote.id;
    const shouldHighlightText =
      searchQuery && quote.text.toLowerCase().includes(searchQuery.toLowerCase());
    const shouldHighlightAuthor =
      searchQuery && quote.author && quote.author.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div
        key={quote.id}
        className={`item-list-item group ${isSelected ? 'item-list-item-selected' : ''} hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150`}
        role="button"
        onClick={() => onSelectQuote(quote)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelectQuote(quote);
            e.preventDefault();
          }
        }}
        tabIndex={0}
        aria-current={isSelected ? 'true' : 'false'}
      >
        <div className="flex flex-col">
          <div className="flex items-start">
            {/* Quote icon */}
            <svg
              className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors duration-150"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>

            {/* Quote text with search highlighting */}
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-5">
              {shouldHighlightText ? (
                <>&ldquo;{highlightSearchTerm(truncateText(quote.text), searchQuery)}&rdquo;</>
              ) : (
                <>&ldquo;{truncateText(quote.text)}&rdquo;</>
              )}
            </p>
          </div>

          {/* Author with search highlighting */}
          <div className="mt-1 ml-5.5 text-xs text-gray-500 dark:text-gray-400">
            {shouldHighlightAuthor ? (
              <>
                —{' '}
                <span className="inline-block">
                  {highlightSearchTerm(quote.author || 'Anonymous', searchQuery)}
                </span>
              </>
            ) : (
              <>
                — <span className="inline-block">{quote.author || 'Anonymous'}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render quotes list
  const renderQuotesList = () => (
    <ul className="item-list-body" aria-label="Quotes list">
      {quotes.map(renderQuoteItem)}
    </ul>
  );

  return (
    <div className={`w-full ${className}`}>
      {renderColumnHeaders()}
      {quotes.length === 0 ? renderEmptyState() : renderQuotesList()}
    </div>
  );
}
