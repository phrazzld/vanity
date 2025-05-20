/**
 * React hook for creating a focus trap in modals, dialogs, and similar UIs
 */
import { useEffect, useRef } from 'react';
import type { FocusTrapOptions } from '../../utils/keyboard';
import { createFocusTrap } from '../../utils/keyboard';

/**
 * Hook that creates a focus trap within the referenced element
 * Useful for modals, dialogs, and other components that need to trap focus for accessibility
 *
 * @param options Configuration options for the focus trap
 * @returns A ref to be attached to the container element
 */
export function useFocusTrap(options: FocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const containerElement = containerRef.current;

    // Only create the focus trap if the container exists
    if (containerElement) {
      // Clean up any existing trap
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Create a new focus trap
      cleanupRef.current = createFocusTrap(containerElement, options);
    }

    // Clean up when the component unmounts or options change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [
    options.enabled,
    options.initialFocus,
    options.returnFocusOnUnmount,
    // We deliberately exclude onEscape from the dependency array to avoid
    // recreating the trap when only the callback changes
  ]);

  return containerRef;
}
