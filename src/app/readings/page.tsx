'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import YearSection from '../components/readings/YearSection';
import type { Reading } from '@/types';
import { groupReadingsByYear, getSortedYearKeys, sortReadingsWithinCategory } from '@/lib/utils/readingUtils';

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
    try {
      // Don't set loading states here - they should be managed by the calling functions
      setError(null);
      
      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      
      // Add a cache-busting parameter to prevent browser caching issues
      const cacheBuster = new Date().getTime();
      const response = await fetch(
        `/api/readings?limit=${ITEMS_PER_PAGE}&offset=${offset}&sortBy=date&sortOrder=desc&_=${cacheBuster}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      
      const result = await response.json();
      
      console.log(`Fetched page ${pageNum} with offset ${offset}. Got ${result.data?.length} items.`);
      
      return {
        data: result.data || [],
        hasMore: offset + ITEMS_PER_PAGE < result.totalCount
      };
    } catch (err) {
      console.error('Error fetching readings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return { data: [], hasMore: false };
    }
    // No finally block - loading states should be managed by the calling functions
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Set initial loading state before fetching
      setIsInitialLoading(true);
      
      const { data, hasMore } = await fetchReadings(1);
      setReadings(data);
      setHasMore(hasMore);
      
      // Make sure initial loading is set to false
      setIsInitialLoading(false);
    };
    
    loadInitialData();
  }, [fetchReadings]);

  // Load more data when user scrolls to bottom
  const loadMore = useCallback(async () => {
    // Guard clause to prevent duplicate requests
    if (isInitialLoading || isPaginationLoading || !hasMore) return;
    
    // Set pagination loading state before fetching to prevent multiple triggers
    setIsPaginationLoading(true);
    
    const nextPage = page + 1;
    const { data, hasMore: moreAvailable } = await fetchReadings(nextPage);
    
    // Use a function to update state based on previous state to avoid race conditions
    setReadings(prev => {
      // Check for duplicates by slug to ensure we don't add the same reading twice
      const existingSlugs = new Set(prev.map(r => r.slug));
      const uniqueNewData = data.filter((item: Reading) => !existingSlugs.has(item.slug));
      
      return [...prev, ...uniqueNewData];
    });
    
    setPage(nextPage);
    setHasMore(moreAvailable);
    // Note: fetchReadings already sets the appropriate loading state to false in its finally block
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
    if (isInitialLoading || isPaginationLoading || readings.length === 0) return;
    
    const currentObserver = observer.current;
    
    // Disconnect previous observer if it exists
    if (currentObserver) {
      currentObserver.disconnect();
    }
    
    // Create new observer
    observer.current = new IntersectionObserver(entries => {
      // Only trigger loadMore if:
      // 1. The loading element is intersecting
      // 2. We're not already loading
      // 3. There are more items to load
      // 4. We have some data already
      if (entries[0].isIntersecting && 
          !isInitialLoading && 
          !isPaginationLoading && 
          hasMore && 
          readings.length > 0) {
        loadMore();
      }
    }, { threshold: 0.5 });
    
    // Only observe loading element if we have data and more items to load
    if (loadingRef.current && readings.length > 0 && hasMore) {
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
      {years.length > 0 && (
        years.map(year => (
          <YearSection
            key={year}
            year={year}
            readings={sortReadingsWithinCategory(yearGroups[year], year)}
          />
        ))
      )}
      
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
      {error && (
        <div className="text-red-500 text-center my-4">
          {error}
        </div>
      )}
      
      {/* End of list message */}
      {!hasMore && readings.length > 0 && (
        <div className="text-gray-500 text-center my-4 text-sm">
          You&apos;ve reached the end of the list.
        </div>
      )}
    </section>
  );
}