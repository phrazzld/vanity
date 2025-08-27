'use client';

import { useState, useEffect } from 'react';
import YearSection from '../components/readings/YearSection';
import type { Reading } from '@/types';
import { logger } from '@/lib/logger';
import { getStaticReadings } from '@/lib/static-data';
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

  // Load all readings data
  useEffect(() => {
    const loadReadings = () => {
      try {
        setError(null);

        const result = getStaticReadings();

        // Validate the result structure
        if (!result || !Array.isArray(result.data)) {
          logger.error('Invalid static data format received');
          throw new Error('Invalid static data format');
        }

        logger.debug(`Successfully loaded ${result.totalCount} readings`);

        setReadings(result.data);
      } catch (err) {
        logger.error(`Error loading readings: ${err instanceof Error ? err.message : String(err)}`);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadReadings();
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
    <section>
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Year-based sections */}
      {!isLoading &&
        years.length > 0 &&
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
