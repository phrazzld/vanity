import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Custom hook that debounces a value
 *
 * Delays updating the returned value until after wait milliseconds have passed
 * since the last time the input value changed.
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search with debounced value
 *       performSearch(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timeout if value changes (or component unmounts)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that returns a debounced callback function
 *
 * Returns a memoized callback that will only execute after the specified
 * delay has passed since the last invocation.
 *
 * @param callback - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns A debounced version of the callback
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const handleSearch = useDebouncedCallback(
 *     (query: string) => {
 *       console.log('Searching for:', query);
 *       performSearch(query);
 *     },
 *     300
 *   );
 *
 *   return (
 *     <input onChange={(e) => handleSearch(e.target.value)} />
 *   );
 * }
 * ```
 */
export function useDebouncedCallback<T extends (..._args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    ((..._args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(..._args);
      }, delay);
    }) as T,
    [callback, delay]
  );

  return debouncedCallback;
}
