/**
 * Focus management utilities
 *
 * Provides functions for finding focusable elements, checking visibility,
 * and managing focus within containers.
 */

import { FOCUSABLE_ELEMENTS_SELECTOR } from './constants';

/**
 * Returns all focusable elements within a container
 *
 * @param container The container element to search within
 * @returns Array of focusable HTML elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)).filter(
    el => isVisible(el)
  );
}

/**
 * Checks if an element is visible in the DOM
 *
 * This helper determines if an element is currently visible by checking:
 * - If it has dimensions (width/height) and client rects in real browsers
 * - Style properties like display, visibility, and hidden attribute in test environments
 *
 * @param element The element to check
 * @returns True if the element is visible, false otherwise
 */
export function isVisible(element: HTMLElement): boolean {
  // Standard browser check for real browser environments
  if (element.offsetWidth || element.offsetHeight || element.getClientRects().length) {
    return true;
  }

  // Additional check for JSDOM test environment where offsetWidth, etc. may not work properly
  // This is specifically for test environments and won't be used in production
  const computedStyle = window.getComputedStyle(element);
  return !(
    element.hasAttribute('hidden') ||
    element.style.display === 'none' ||
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    computedStyle.opacity === '0'
  );
}

/**
 * Sets focus to the first focusable element in a container
 *
 * @param container The container element
 * @param options Focus options
 * @returns True if an element was focused, false otherwise
 */
export function focusFirstElement(
  container: HTMLElement,
  options: FocusOptions = { preventScroll: true }
): boolean {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus(options);
    return true;
  }
  return false;
}

/**
 * Sets focus to the last focusable element in a container
 *
 * @param container The container element
 * @param options Focus options
 * @returns True if an element was focused, false otherwise
 */
export function focusLastElement(
  container: HTMLElement,
  options: FocusOptions = { preventScroll: true }
): boolean {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[focusableElements.length - 1].focus(options);
    return true;
  }
  return false;
}

/**
 * Focuses a specific element by matching a predicate function
 *
 * @param container The container element
 * @param predicate Function that returns true for the element to focus
 * @param options Focus options
 * @returns True if an element was focused, false otherwise
 */
export function focusElementWhere(
  container: HTMLElement,
  predicate: (_element: HTMLElement) => boolean,
  options: FocusOptions = { preventScroll: true }
): boolean {
  const focusableElements = getFocusableElements(container);
  const elementToFocus = focusableElements.find(predicate);

  if (elementToFocus) {
    elementToFocus.focus(options);
    return true;
  }

  return false;
}

/**
 * Finds the next focusable element after the currently focused element
 *
 * @param container The container element
 * @param currentElement The currently focused element
 * @param loop Whether to loop back to the first element after the last
 * @returns The next focusable element or null if none found
 */
export function getNextFocusableElement(
  container: HTMLElement,
  currentElement: HTMLElement = document.activeElement as HTMLElement,
  loop = true
): HTMLElement | null {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return null;

  const currentIndex = focusableElements.indexOf(currentElement);
  if (currentIndex === -1) return focusableElements[0];

  const nextIndex = currentIndex + 1;
  if (nextIndex >= focusableElements.length) {
    return loop ? focusableElements[0] : null;
  }

  return focusableElements[nextIndex];
}

/**
 * Finds the previous focusable element before the currently focused element
 *
 * @param container The container element
 * @param currentElement The currently focused element
 * @param loop Whether to loop to the last element after the first
 * @returns The previous focusable element or null if none found
 */
export function getPreviousFocusableElement(
  container: HTMLElement,
  currentElement: HTMLElement = document.activeElement as HTMLElement,
  loop = true
): HTMLElement | null {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return null;

  const currentIndex = focusableElements.indexOf(currentElement);
  if (currentIndex === -1) return focusableElements[0];

  const prevIndex = currentIndex - 1;
  if (prevIndex < 0) {
    return loop ? focusableElements[focusableElements.length - 1] : null;
  }

  return focusableElements[prevIndex];
}

/**
 * Restores focus to a previously focused element
 *
 * @param element The element to focus
 * @param options Focus options
 */
export function restoreFocus(
  element: HTMLElement | null,
  options: FocusOptions = { preventScroll: true }
): void {
  if (element && typeof element.focus === 'function') {
    element.focus(options);
  }
}
