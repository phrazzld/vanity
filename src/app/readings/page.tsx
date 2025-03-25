'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReadingCard from '../components/readings/ReadingCard'
import { getReadingsWithFilters } from '@/lib/db/readings'
import type { Reading } from '@/types'

/**
 * Helper function to check if a reading is "currently reading"
 * Currently reading = no finishedDate and not dropped
 */
function isCurrentlyReading(reading: Reading): boolean {
  return reading.finishedDate === null && !reading.dropped;
}

/**
 * Sorts readings to prioritize currently reading items first
 */
function sortReadings(readings: Reading[]): Reading[] {
  return [...readings].sort((a, b) => {
    // If a is currently reading and b is not, a comes first
    if (isCurrentlyReading(a) && !isCurrentlyReading(b)) {
      return -1;
    }
    // If b is currently reading and a is not, b comes first
    if (!isCurrentlyReading(a) && isCurrentlyReading(b)) {
      return 1;
    }
    // Otherwise, keep original order
    return 0;
  });
}

export default function ReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  
  const ITEMS_PER_PAGE = 12;

  // Fetch readings data with pagination
  const fetchReadings = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      
      const response = await fetch(`/api/readings?limit=${ITEMS_PER_PAGE}&offset=${offset}&sortBy=date&sortOrder=desc`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      
      const result = await response.json();
      
      return {
        data: result.data || [],
        hasMore: offset + ITEMS_PER_PAGE < result.totalCount
      };
    } catch (err) {
      console.error('Error fetching readings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return { data: [], hasMore: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const { data, hasMore } = await fetchReadings(1);
      setReadings(data);
      setHasMore(hasMore);
    };
    
    loadInitialData();
  }, [fetchReadings]);

  // Load more data when user scrolls to bottom
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    const nextPage = page + 1;
    const { data, hasMore: moreAvailable } = await fetchReadings(nextPage);
    
    setReadings(prev => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(moreAvailable);
  }, [fetchReadings, hasMore, isLoading, page]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (isLoading) return;
    
    const currentObserver = observer.current;
    
    // Disconnect previous observer if it exists
    if (currentObserver) {
      currentObserver.disconnect();
    }
    
    // Create new observer
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold: 0.5 });
    
    // Observe loading element
    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }
    
    // Cleanup
    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore]);

  return (
    <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          // auto-fill ensures as many columns as fit in the container
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        }}
      >
        {readings.map((reading) => (
          <ReadingCard
            key={reading.slug}
            slug={reading.slug}
            title={reading.title}
            coverImageSrc={reading.coverImageSrc}
            dropped={reading.dropped}
            finishedDate={reading.finishedDate}
          />
        ))}
      </div>
      
      {/* Loading indicator */}
      <div 
        ref={loadingRef} 
        className="flex justify-center my-8"
        style={{ height: hasMore ? '50px' : '0px' }}
      >
        {isLoading && (
          <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        )}
      </div>
      
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
  )
}
