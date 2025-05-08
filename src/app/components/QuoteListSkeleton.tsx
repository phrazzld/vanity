'use client';

/**
 * QuoteListSkeleton Component
 *
 * A skeleton loading placeholder for the quote list to be shown during data fetching.
 * Provides a better user experience during loading states.
 */

interface QuoteListSkeletonProps {
  /**
   * Number of skeleton items to display
   */
  count?: number;
}

export default function QuoteListSkeleton({ count = 5 }: QuoteListSkeletonProps) {
  // Create an array of length 'count' to map over
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="animate-pulse">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-12 py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750">
          <div className="col-span-9 flex items-center">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="col-span-3 flex items-center">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      <ul className="item-list-body">
        {items.map(index => (
          <li key={index} className="item-list-item">
            <div className="flex flex-col">
              <div className="flex items-start">
                {/* Quote icon skeleton */}
                <div className="h-4 w-4 mt-0.5 mr-1.5 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded"></div>

                {/* Quote text skeleton */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>

              {/* Author skeleton */}
              <div className="mt-2 ml-5.5 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
