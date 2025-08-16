'use client';

import { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all readings data
  useEffect(() => {
    const fetchReadings = async () => {
      try {
        setError(null);
        
        const response = await fetch('/api/readings');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch readings: ${response.status} ${response.statusText}`);
        }
        
        const result = (await response.json()) as ReadingsApiResponse;
        
        // Validate the result structure
        if (!result || !Array.isArray(result.data)) {
          logger.error(
            'Invalid API response format received',
            createLogContext('pages/readings', 'fetchReadings', {
              response_type: typeof result,
              has_data: result ? 'data' in result : false,
            })
          );
          throw new Error('Invalid response format from API');
        }
        
        logger.debug(
          'Successfully fetched all readings',
          createLogContext('pages/readings', 'fetchReadings', {
            total_count: result.totalCount,
          })
        );
        
        setReadings(result.data);
      } catch (err) {
        logger.error(
          'Error fetching readings from API',
          createLogContext('pages/readings', 'fetchReadings', {
            error_type: err instanceof Error ? err.constructor.name : 'Unknown',
          }),
          err instanceof Error ? err : new Error(String(err))
        );
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReadings();
  }, []);

  // Group readings by year whenever they change
  useEffect(() => {
    if (readings.length === 0) return;

    const grouped = groupReadingsByYear(readings);
    setYearGroups(grouped);

    const sortedYears = getSortedYearKeys(grouped);
    setYears(sortedYears);
  }, [readings]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Year-based sections */}
      {!isLoading && years.length > 0 &&
        years.map(year => (
          <YearSection
            key={year}
            year={year}
            readings={sortReadingsWithinCategory(yearGroups[year] || [], year)}
          />
        ))}

      {/* No readings found message */}
      {!isLoading && readings.length === 0 && !error && (
        <div className="flex justify-center items-center py-16">
          <div className="text-gray-500 text-center">
            <p>No readings found.</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <div className="text-red-500 text-center my-4">{error}</div>}
    </section>
  );
}