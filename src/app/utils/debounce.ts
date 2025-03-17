/**
 * Utility function for debouncing function calls
 * 
 * This is useful for operations that should not be executed too frequently,
 * such as API calls during typing in a search input.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Utility function that returns a new debounced function with the specified delay
 * and executes the callback with the event value
 * 
 * This is specifically designed for React input onChange events.
 * 
 * @param callback - The callback function to execute with the debounced value
 * @param delay - Delay in milliseconds
 * @returns A debounced function that takes an event and extracts its value
 */
export function useDebouncedSearch<T = string>(
  callback: (value: T) => void,
  delay: number
): (value: T) => void {
  return debounce(callback, delay);
}