'use client';

/**
 * ReadingListSkeleton Component
 *
 * A skeleton loading placeholder for the reading list to be shown during data fetching.
 * Provides a better user experience during loading states.
 */

import { useTheme } from '../context/ThemeContext';

interface ReadingListSkeletonProps {
  /**
   * Number of skeleton items to display
   */
  count?: number;
}

export default function ReadingListSkeleton({ count = 5 }: ReadingListSkeletonProps) {
  const { isDarkMode } = useTheme();

  // Create an array of length 'count' to map over
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="animate-pulse">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-12 py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750">
          <div className="col-span-7 flex items-center">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="col-span-3 flex items-center">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      <ul className="item-list-body">
        {items.map(index => (
          <li key={index} className="item-list-item">
            <div className="flex items-start gap-3">
              {/* Book cover skeleton */}
              <div className="h-14 w-10 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700"></div>

              <div className="flex-1 min-w-0">
                {/* Title skeleton */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>

                {/* Author skeleton */}
                <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>

                {/* Info line skeleton */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
