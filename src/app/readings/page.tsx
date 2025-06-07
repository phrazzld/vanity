'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import YearSection from '../components/readings/YearSection';
import type { Reading } from '@/types';
import { logger, createLogContext } from '@/lib/logger';

// Type for API responses
interface ReadingsApiResponse {
  data: Reading[];
  totalCount: number;
  hasMore?: boolean;
}
import {
  groupReadingsByYear,
  getSortedYearKeys,
  sortReadingsWithinCategory,
} from '@/lib/utils/readingUtils';

export default function ReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [yearGroups, setYearGroups] = useState<Record<string, Reading[]>>({});
  const [years, setYears] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const ITEMS_PER_PAGE = 12;

  // Fetch readings data with pagination
  const fetchReadings = useCallback(async (pageNum: number) => {
    const offset = (pageNum - 1) * ITEMS_PER_PAGE;

    try {
      // Don't set loading states here - they should be managed by the calling functions
      setError(null);

      // Add a cache-busting parameter to prevent browser caching issues
      const cacheBuster = new Date().getTime();
      const response = await fetch(
        `/api/readings?limit=${ITEMS_PER_PAGE}&offset=${offset}&sortBy=date&sortOrder=desc&_=${cacheBuster}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch readings: ${response.status} ${response.statusText}`);
      }

      // Parse response with explicit typing
      const result = (await response.json()) as ReadingsApiResponse;

      // Validate the result structure to ensure it has the expected properties
      if (!result || !Array.isArray(result.data)) {
        logger.error(
          'Invalid API response format received',
          createLogContext('pages/readings', 'fetchReadings', {
            page_num: pageNum,
            response_type: typeof result,
            has_data: result ? 'data' in result : false,
          })
        );
        throw new Error('Invalid response format from API');
      }

      logger.debug(
        'Successfully fetched readings page',
        createLogContext('pages/readings', 'fetchReadings', {
          page_num: pageNum,
          offset,
          items_received: result.data.length,
          total_count: result.totalCount,
        })
      );

      return {
        data: result.data,
        hasMore: offset + ITEMS_PER_PAGE < result.totalCount,
      };
    } catch (err) {
      logger.error(
        'Error fetching readings from API',
        createLogContext('pages/readings', 'fetchReadings', {
          page_num: pageNum,
          offset,
          error_type: err instanceof Error ? err.constructor.name : 'Unknown',
        }),
        err instanceof Error ? err : new Error(String(err))
      );
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Return empty data and false for hasMore to prevent further loading attempts
      return { data: [], hasMore: false };
    }
    // No finally block - loading states should be managed by the calling functions
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Set initial loading state before fetching
      setIsInitialLoading(true);

      try {
        const result = await fetchReadings(1);
        // Explicitly type the destructured values
        const fetchedData: Reading[] = result.data;
        const moreAvailable: boolean = result.hasMore;

        setReadings(fetchedData);
        setHasMore(moreAvailable);
      } catch (error) {
        logger.error(
          'Error loading initial readings data',
          createLogContext('pages/readings', 'loadInitialData', {
            error_type: error instanceof Error ? error.constructor.name : 'Unknown',
            page: 1,
          }),
          error instanceof Error ? error : new Error(String(error))
        );
        setError(error instanceof Error ? error.message : 'Failed to load initial data');
      } finally {
        // Ensure loading state is always set to false, even on error
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [fetchReadings]);

  // Load more data when user scrolls to bottom
  const loadMore = useCallback(async () => {
    // Guard clause to prevent duplicate requests
    if (isInitialLoading || isPaginationLoading || !hasMore) return;

    // Set pagination loading state before fetching to prevent multiple triggers
    setIsPaginationLoading(true);

    try {
      const nextPage = page + 1;
      const result = await fetchReadings(nextPage);

      // Explicitly type the destructured values
      const fetchedData: Reading[] = result.data;
      const moreAvailable: boolean = result.hasMore;

      // Use a function to update state based on previous state to avoid race conditions
      setReadings(prev => {
        // Check for duplicates by slug to ensure we don't add the same reading twice
        const existingSlugs = new Set(prev.map(r => r.slug));
        // Explicitly type the filter operation
        const uniqueNewData = fetchedData.filter(item => !existingSlugs.has(item.slug));

        return [...prev, ...uniqueNewData];
      });

      setPage(nextPage);
      setHasMore(moreAvailable);
    } catch (error) {
      logger.error(
        'Error loading more readings via pagination',
        createLogContext('pages/readings', 'loadMore', {
          current_page: page,
          next_page: page + 1,
          error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        }),
        error instanceof Error ? error : new Error(String(error))
      );
      setError(error instanceof Error ? error.message : 'Failed to load more readings');
    } finally {
      // CRITICAL FIX: Ensure pagination loading state is reset even if there's an error
      setIsPaginationLoading(false);
    }
  }, [fetchReadings, hasMore, isInitialLoading, isPaginationLoading, page]);

  // Group readings by year whenever they change
  useEffect(() => {
    if (readings.length === 0) return;

    const grouped = groupReadingsByYear(readings);
    setYearGroups(grouped);

    const sortedYears = getSortedYearKeys(grouped);
    setYears(sortedYears);
  }, [readings]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    // Don't set up observer when loading or when we have no data yet
    if (isInitialLoading || readings.length === 0) return;

    const currentObserver = observer.current;

    // Disconnect previous observer if it exists
    if (currentObserver) {
      currentObserver.disconnect();
    }

    // Create new observer with improved options
    observer.current = new IntersectionObserver(
      entries => {
        // Only trigger loadMore if:
        // 1. The loading element is intersecting
        // 2. We're not already loading
        // 3. There are more items to load
        // 4. We have some data already
        if (
          entries[0]?.isIntersecting &&
          !isInitialLoading &&
          !isPaginationLoading &&
          hasMore &&
          readings.length > 0
        ) {
          // Add a short debounce to prevent multiple triggers
          // This is important for mobile devices with touch scrolling
          logger.debug(
            'Infinite scroll triggered',
            createLogContext('pages/readings', 'intersectionObserver', {
              current_page: page,
              has_more: hasMore,
              current_items: readings.length,
            })
          );
          loadMore();
        }
      },
      {
        // Lower threshold to trigger earlier
        threshold: 0.1,
        // Add rootMargin to load earlier (before element is fully visible)
        rootMargin: '0px 0px 100px 0px',
      }
    );

    // Only observe loading element if we have data and more items to load
    if (loadingRef.current && hasMore) {
      observer.current.observe(loadingRef.current);
    }

    // Cleanup
    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [hasMore, isInitialLoading, isPaginationLoading, loadMore, readings.length]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Year-based sections */}
      {/* Initial loading state - only show when there's no data yet */}
      {isInitialLoading && readings.length === 0 && (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Show years if we have data */}
      {years.length > 0 &&
        years.map(year => (
          <YearSection
            key={year}
            year={year}
            readings={sortReadingsWithinCategory(yearGroups[year] || [], year)}
          />
        ))}

      {/* No readings found message */}
      {!isInitialLoading && readings.length === 0 && (
        <div className="flex justify-center items-center py-16">
          <div className="text-gray-500 text-center">
            <p>No readings found.</p>
          </div>
        </div>
      )}

      {/* Pagination loading indicator - only show if we already have some data */}
      {readings.length > 0 && (
        <div
          ref={loadingRef}
          className="flex justify-center my-8"
          style={{ height: hasMore ? '50px' : '0px' }}
        >
          {isPaginationLoading && (
            <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <div className="text-red-500 text-center my-4">{error}</div>}

      {/* End of list message */}
      {!hasMore && readings.length > 0 && (
        <div className="text-gray-500 text-center my-4 text-sm">
          You&apos;ve reached the end of the list.
        </div>
      )}
    </section>
  );
}
