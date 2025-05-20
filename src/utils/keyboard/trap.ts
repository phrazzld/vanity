/**
 * Focus trap utilities
 *
 * Provides utilities for trapping keyboard focus within a container,
 * which is essential for modal dialogs and other temporary UI overlays.
 */

import { KeyboardKeys } from './constants';
import type { FocusTrapOptions } from './types';
import { getFocusableElements, focusFirstElement, isVisible } from './focus';

/**
 * Creates a focus trap within a container
 *
 * A focus trap ensures keyboard navigation can't leave the container, which
 * is particularly important for modals, dialogs, and dropdown menus.
 *
 * @param container The container element to trap focus within
 * @param options Configuration options for the focus trap
 * @returns Cleanup function to remove the focus trap
 */
export function createFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {}
): () => void {
  const { enabled = true, initialFocus = true, onEscape } = options;

  if (!enabled) {
    return () => {}; // No-op cleanup if disabled
  }

  if (initialFocus) {
    focusFirstElement(container);
  }

  const handleTrapFocus = (event: KeyboardEvent) => {
    // Handle escape key if escape handler provided
    if (event.key === KeyboardKeys.ESCAPE && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    // Only handle tab key for focus trapping
    if (event.key !== KeyboardKeys.TAB) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) return;

    // Handle shift+tab
    if (event.shiftKey) {
      // If focus is on first element, move to last element
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus({ preventScroll: true });
      }
    }
    // Handle tab
    else {
      // If focus is on last element, move to first element
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    }
  };

  // Handle clicks outside the container (optional)
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;

    // If click is outside the container and container is still in the DOM
    if (!container.contains(target) && document.body.contains(container)) {
      // Find focusable elements in the container
      const focusableElements = getFocusableElements(container);

      // If there are focusable elements and container is visible
      if (focusableElements.length > 0 && isVisible(container)) {
        const firstElement = focusableElements[0];
        if (firstElement) {
          // Focus the first element to maintain the trap
          event.preventDefault();
          firstElement.focus({ preventScroll: true });
        }
      }
    }
  };

  // Add event listeners
  container.addEventListener('keydown', handleTrapFocus);
  document.addEventListener('click', handleClickOutside);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTrapFocus);
    document.removeEventListener('click', handleClickOutside);
  };
}

/**
 * Ensures focus remains within a container while tab navigating
 *
 * Simpler version of createFocusTrap that only handles tab key
 * navigation without click handling or escape key support.
 *
 * @param container The container element
 * @returns Cleanup function
 */
export function trapTabKey(container: HTMLElement): () => void {
  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== KeyboardKeys.TAB) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) return;

    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement.focus({ preventScroll: true });
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement.focus({ preventScroll: true });
      event.preventDefault();
    }
  };

  container.addEventListener('keydown', handleTabKey);

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}
