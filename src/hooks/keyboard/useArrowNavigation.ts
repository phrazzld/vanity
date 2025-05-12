/**
 * React hook for arrow key navigation within a container
 */
import { useRef, useCallback, useEffect } from 'react';
import type { ArrowNavigationOptions } from '../../utils/keyboard';
import { handleArrowNavigation } from '../../utils/keyboard';

/**
 * Hook that handles arrow key navigation within a container of focusable elements
 *
 * @param options Navigation configuration options
 * @returns A ref to be attached to the container element
 */
export function useArrowNavigation(options: ArrowNavigationOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (containerRef.current) {
        handleArrowNavigation(event, containerRef.current, options);
      }
    },
    [
      options.direction,
      options.loop,
      options.preventScroll,
      // We deliberately exclude onNavigate from the dependency array to avoid
      // recreating the handler when only the callback changes
    ]
  );

  useEffect(() => {
    const containerElement = containerRef.current;

    // Only attach the event listener if the container exists
    if (containerElement) {
      containerElement.addEventListener('keydown', handleKeyDown);
    }

    // Clean up when the component unmounts or options change
    return () => {
      if (containerElement) {
        containerElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [handleKeyDown]);

  return containerRef;
}
