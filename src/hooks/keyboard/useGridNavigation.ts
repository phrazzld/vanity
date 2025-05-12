/**
 * React hook for grid keyboard navigation (2D navigation)
 */
import { useRef, useCallback, useEffect } from 'react';
import { createGridNavigationHandler } from '../../utils/keyboard';

/**
 * Configuration options for grid navigation
 */
interface GridNavigationOptions {
  /**
   * CSS selector for row elements
   * @default 'tr, [role="row"]'
   */
  rowSelector?: string;

  /**
   * CSS selector for cell elements within rows
   * @default 'td, th, [role="gridcell"], [role="columnheader"]'
   */
  cellSelector?: string;

  /**
   * Whether navigation should loop from last to first element and vice versa
   * @default true
   */
  loop?: boolean;

  /**
   * Whether to prevent scrolling when focusing elements
   * @default true
   */
  preventScroll?: boolean;

  /**
   * Optional callback when navigation occurs
   */
  onNavigate?: (_rowIndex: number, _columnIndex: number) => void;
}

/**
 * Hook that handles grid keyboard navigation (arrow keys in a 2D layout)
 * Useful for tables, grids, calendars, and other 2D layouts
 *
 * @param options Grid navigation configuration options
 * @returns A ref to be attached to the grid container element
 */
export function useGridNavigation(options: GridNavigationOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);

  const {
    rowSelector = 'tr, [role="row"]',
    cellSelector = 'td, th, [role="gridcell"], [role="columnheader"]',
    loop = true,
    preventScroll = true,
    onNavigate,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (containerRef.current) {
        const handler = createGridNavigationHandler(
          containerRef.current,
          rowSelector,
          cellSelector,
          { loop, preventScroll, onNavigate }
        );

        handler(event);
      }
    },
    [
      rowSelector,
      cellSelector,
      loop,
      preventScroll,
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
