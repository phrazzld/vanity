import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Configuration for a single filter
 */
export interface FilterConfig {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}

/**
 * Hook for managing search filters with dual state tracking
 *
 * This hook provides a complete solution for managing filter state in search interfaces:
 * - Tracks both active (current UI) and submitted filter values
 * - Detects changes between active and submitted states
 * - Provides methods to update, submit, and reset filters
 * - Supports initialization from FilterConfig array
 *
 * @param filterConfigs - Array of filter configurations
 * @returns Object with filter state and management utilities
 *
 * @example
 * ```tsx
 * function SearchInterface() {
 *   const filters = useSearchFilters([
 *     {
 *       name: 'category',
 *       label: 'Category',
 *       options: [
 *         { value: '', label: 'All' },
 *         { value: 'tech', label: 'Technology' },
 *         { value: 'design', label: 'Design' }
 *       ],
 *       defaultValue: ''
 *     }
 *   ]);
 *
 *   const handleSearch = () => {
 *     const submittedValues = filters.submit();
 *     performSearch(submittedValues);
 *   };
 *
 *   return (
 *     <>
 *       <select
 *         value={filters.activeFilters.category}
 *         onChange={(e) => filters.setFilter('category', e.target.value)}
 *       >
 *         {filterConfigs[0].options.map(opt => (
 *           <option key={opt.value} value={opt.value}>{opt.label}</option>
 *         ))}
 *       </select>
 *       <button onClick={handleSearch} disabled={!filters.hasChanges}>
 *         Search
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */
export function useSearchFilters(filterConfigs: FilterConfig[] = []) {
  // Initialize filter values from configs
  const initialFilters = useMemo(() => {
    return filterConfigs.reduce(
      (acc, config) => {
        acc[config.name] = config.defaultValue || '';
        return acc;
      },
      {} as Record<string, string>
    );
  }, [filterConfigs]);

  // Active filters (current UI state)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);

  // Submitted filters (last submitted state)
  const [submittedFilters, setSubmittedFilters] = useState<Record<string, string>>(initialFilters);

  // Keep a ref to the current filters for immediate access
  const activeFiltersRef = useRef<Record<string, string>>(activeFilters);
  useEffect(() => {
    activeFiltersRef.current = activeFilters;
  }, [activeFilters]);

  /**
   * Set a single filter value
   */
  const setFilter = useCallback((name: string, value: string) => {
    setActiveFilters(prev => {
      const updated = {
        ...prev,
        [name]: value,
      };
      activeFiltersRef.current = updated;
      return updated;
    });
  }, []);

  /**
   * Update multiple filters at once
   */
  const setFilters = useCallback((updates: Record<string, string>) => {
    setActiveFilters(prev => {
      const updated = {
        ...prev,
        ...updates,
      };
      activeFiltersRef.current = updated;
      return updated;
    });
  }, []);

  /**
   * Replace all filter values
   */
  const replaceFilters = useCallback((newFilters: Record<string, string>) => {
    activeFiltersRef.current = newFilters;
    setActiveFilters(newFilters);
  }, []);

  /**
   * Submit current filter values
   */
  const submit = useCallback(() => {
    const currentFilters = activeFiltersRef.current;
    setSubmittedFilters(currentFilters);
    return currentFilters;
  }, []);

  /**
   * Submit with callback
   */
  const submitWithCallback = useCallback((callback: (filters: Record<string, string>) => void) => {
    const currentFilters = activeFiltersRef.current;
    setSubmittedFilters(currentFilters);
    callback(currentFilters);
  }, []);

  /**
   * Reset all filters to initial values
   */
  const reset = useCallback(() => {
    setActiveFilters(initialFilters);
    setSubmittedFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Reset to last submitted values
   */
  const resetToSubmitted = useCallback(() => {
    setActiveFilters(submittedFilters);
  }, [submittedFilters]);

  /**
   * Clear all filters (set to empty strings)
   */
  const clear = useCallback(() => {
    const clearedFilters = Object.keys(activeFilters).reduce(
      (acc, key) => {
        acc[key] = '';
        return acc;
      },
      {} as Record<string, string>
    );
    setActiveFilters(clearedFilters);
  }, [activeFilters]);

  /**
   * Check if there are any changes between active and submitted filters
   */
  const hasChanges = useMemo(() => {
    const keys = Object.keys(activeFilters);
    return keys.some(key => activeFilters[key] !== submittedFilters[key]);
  }, [activeFilters, submittedFilters]);

  /**
   * Check if any filters are currently active (non-empty)
   */
  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some(value => value !== '');
  }, [activeFilters]);

  /**
   * Get the count of active (non-empty) filters
   */
  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(value => value !== '').length;
  }, [activeFilters]);

  /**
   * Get only the filters that have changed
   */
  const getChangedFilters = useCallback((): Record<string, string> => {
    const changes: Record<string, string> = {};
    Object.keys(activeFilters).forEach(key => {
      if (activeFilters[key] !== submittedFilters[key]) {
        changes[key] = activeFilters[key];
      }
    });
    return changes;
  }, [activeFilters, submittedFilters]);

  /**
   * Get only the active (non-empty) filters
   */
  const getActiveFilters = useCallback((): Record<string, string> => {
    const active: Record<string, string> = {};
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== '') {
        active[key] = value;
      }
    });
    return active;
  }, [activeFilters]);

  /**
   * Check if a specific filter has changed
   */
  const hasFilterChanged = useCallback(
    (name: string): boolean => {
      return activeFilters[name] !== submittedFilters[name];
    },
    [activeFilters, submittedFilters]
  );

  /**
   * Check if a specific filter is active (non-empty)
   */
  const isFilterActive = useCallback(
    (name: string): boolean => {
      return activeFilters[name] !== '';
    },
    [activeFilters]
  );

  /**
   * Get the configuration for a specific filter
   */
  const getFilterConfig = useCallback(
    (name: string): FilterConfig | undefined => {
      return filterConfigs.find(config => config.name === name);
    },
    [filterConfigs]
  );

  /**
   * Get the label for a filter's current value
   */
  const getFilterValueLabel = useCallback(
    (name: string): string => {
      const config = getFilterConfig(name);
      if (!config) return '';

      const value = activeFilters[name];
      const option = config.options.find(opt => opt.value === value);
      return option?.label || '';
    },
    [activeFilters, getFilterConfig]
  );

  return {
    // State
    activeFilters,
    submittedFilters,
    filterConfigs,

    // Setters
    setFilter,
    setFilters,
    replaceFilters,

    // Actions
    submit,
    submitWithCallback,
    reset,
    resetToSubmitted,
    clear,

    // Status
    hasChanges,
    hasActiveFilters,
    activeFilterCount,
    getChangedFilters,
    getActiveFilters,
    hasFilterChanged,
    isFilterActive,

    // Utilities
    getFilterConfig,
    getFilterValueLabel,

    // Direct state setters (for advanced use cases)
    setActiveFiltersState: setActiveFilters,
    setSubmittedFiltersState: setSubmittedFilters,
  };
}

/**
 * Type helper for the return type of useSearchFilters
 */
export type SearchFilters = ReturnType<typeof useSearchFilters>;
