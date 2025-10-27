import { useState, useMemo } from 'react';
import type { Reading } from '@/types';

/**
 * Custom hook for filtering readings by favorite status
 *
 * Encapsulates filter state and logic to avoid duplication across components.
 * Returns filtered readings array and toggle controls.
 *
 * @param readings - Array of readings to filter
 * @returns Object containing filtered readings, current filter state, and setter
 *
 * @example
 * ```tsx
 * const { filteredReadings, showOnlyFavorites, setShowOnlyFavorites } = useReadingsFilter(readings);
 * ```
 */
export function useReadingsFilter(readings: Reading[]) {
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const filteredReadings = useMemo(
    () => (showOnlyFavorites ? readings.filter(r => r.favorite) : readings),
    [readings, showOnlyFavorites]
  );

  return { filteredReadings, showOnlyFavorites, setShowOnlyFavorites };
}
