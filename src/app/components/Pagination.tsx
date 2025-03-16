'use client';

/**
 * Pagination Component
 * 
 * A reusable pagination component for navigating through paginated data.
 * Features:
 * - Page navigation buttons (prev/next)
 * - Page number display with intelligent ellipsis
 * - Items per page selector (optional)
 * - Item count display
 * - Responsive design (mobile and desktop)
 * - Dark mode support
 * - Accessibility features
 */

import { useTheme } from '../context/ThemeContext';
import { useCallback } from 'react';

export interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Whether to show the items per page selector */
  showPageSizeSelector?: boolean;
  /** Additional class names for the component */
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = false,
  className = '',
}: PaginationProps) {
  // Access theme context
  const { isDarkMode } = useTheme();
  
  /**
   * Generates an array of page numbers to display, with ellipses for large ranges
   */
  const getDisplayedPageNumbers = useCallback(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(page => {
        // Always show first and last page, and pages around current page
        const isFirstPage = page === 1;
        const isLastPage = page === totalPages;
        const isCurrentPageArea = Math.abs(page - currentPage) <= 1;
        return isFirstPage || isLastPage || isCurrentPageArea;
      });
  }, [currentPage, totalPages]);
  
  // Calculate display values
  const firstItemIndex = (currentPage - 1) * pageSize + 1;
  const lastItemIndex = Math.min(currentPage * pageSize, totalItems);
  const displayedPageNumbers = getDisplayedPageNumbers();
  
  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };
  
  // If there's nothing to paginate, don't render the component
  if (totalPages <= 0 || totalItems <= 0) {
    return null;
  }
  
  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sm:px-6 ${className}`}>
      {/* Desktop view */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{firstItemIndex}</span> to{' '}
            <span className="font-medium">{lastItemIndex}</span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Page size selector */}
          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center space-x-2">
              <label htmlFor="page-size" className="text-sm text-gray-600 dark:text-gray-400">
                Show
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 pl-2 pr-7"
                aria-label="Items per page"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Pagination controls */}
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous page button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                currentPage <= 1 
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              aria-label="Previous page"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Page numbers with ellipsis */}
            {displayedPageNumbers.map((page, index, array) => {
              // Determine if we need to show ellipsis
              const showEllipsisAfter = index < array.length - 1 && array[index + 1] - page > 1;
              
              return (
                <div key={page} className="flex items-center">
                  {/* Page number button */}
                  <button
                    onClick={() => onPageChange(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    aria-label={`Page ${page}`}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                  
                  {/* Ellipsis if needed */}
                  {showEllipsisAfter && (
                    <span 
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                      aria-hidden="true"
                    >
                      ...
                    </span>
                  )}
                </div>
              );
            })}
            
            {/* Next page button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                currentPage >= totalPages 
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              aria-label="Next page"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Mobile view */}
      <div className="flex items-center sm:hidden w-full justify-between">
        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            currentPage <= 1
              ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
              : 'text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          aria-label="Previous page"
        >
          Previous
        </button>
        
        {/* Current page indicator */}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        
        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${
            currentPage >= totalPages
              ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
              : 'text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}