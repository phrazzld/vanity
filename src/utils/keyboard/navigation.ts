/**
 * Arrow key navigation utilities for keyboard accessibility
 */
import type { ArrowNavigationOptions } from './types';
import { KeyboardKeys } from './constants';
import { getFocusableElements } from './focus';

/**
 * Handles arrow key navigation within a container of focusable elements
 *
 * @param event The keyboard event
 * @param container The container element to navigate within
 * @param options Navigation configuration options
 * @returns boolean indicating if navigation was handled
 */
export function handleArrowNavigation(
  event: KeyboardEvent,
  container: HTMLElement,
  options: ArrowNavigationOptions = {}
): boolean {
  const { direction = 'both', loop = true, preventScroll = true, onNavigate } = options;

  // Only handle arrow keys
  if (
    event.key !== KeyboardKeys.ARROW_UP &&
    event.key !== KeyboardKeys.ARROW_DOWN &&
    event.key !== KeyboardKeys.ARROW_LEFT &&
    event.key !== KeyboardKeys.ARROW_RIGHT
  ) {
    return false;
  }

  // Skip if the key direction is not enabled
  if (
    (direction === 'horizontal' &&
      (event.key === KeyboardKeys.ARROW_UP || event.key === KeyboardKeys.ARROW_DOWN)) ||
    (direction === 'vertical' &&
      (event.key === KeyboardKeys.ARROW_LEFT || event.key === KeyboardKeys.ARROW_RIGHT))
  ) {
    return false;
  }

  const elements = getFocusableElements(container);
  if (elements.length === 0) return false;

  const currentElement = document.activeElement as HTMLElement;
  const currentIndex = elements.indexOf(currentElement);

  // If focus is not within the container, focus the first element
  if (currentIndex === -1) {
    (elements[0] as HTMLElement).focus({ preventScroll });
    return true;
  }

  let nextIndex = currentIndex;

  // Calculate the next index based on the arrow key pressed
  switch (event.key) {
    case KeyboardKeys.ARROW_UP:
    case KeyboardKeys.ARROW_LEFT:
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = loop ? elements.length - 1 : 0;
      }
      break;
    case KeyboardKeys.ARROW_DOWN:
    case KeyboardKeys.ARROW_RIGHT:
      nextIndex = currentIndex + 1;
      if (nextIndex >= elements.length) {
        nextIndex = loop ? 0 : elements.length - 1;
      }
      break;
  }

  // Only focus if the index changed
  if (nextIndex !== currentIndex) {
    (elements[nextIndex] as HTMLElement).focus({ preventScroll });
    onNavigate?.(nextIndex, currentIndex);
    event.preventDefault();
    return true;
  }

  return false;
}

/**
 * Creates a grid navigation handler for 2D keyboard navigation
 *
 * @param container The container element with the grid
 * @param rowSelector CSS selector for row elements
 * @param cellSelector CSS selector for cell elements within rows
 * @param options Navigation options
 * @returns A keyboard event handler for grid navigation
 */
export function createGridNavigationHandler(
  container: HTMLElement,
  rowSelector: string,
  cellSelector: string,
  options: {
    loop?: boolean;
    preventScroll?: boolean;
    onNavigate?: (_rowIndex: number, _columnIndex: number) => void;
  } = {}
): (event: KeyboardEvent) => boolean {
  const { loop = true, preventScroll = true, onNavigate } = options;

  return (event: KeyboardEvent): boolean => {
    // Only handle arrow keys
    if (
      event.key !== KeyboardKeys.ARROW_UP &&
      event.key !== KeyboardKeys.ARROW_DOWN &&
      event.key !== KeyboardKeys.ARROW_LEFT &&
      event.key !== KeyboardKeys.ARROW_RIGHT
    ) {
      return false;
    }

    const rows = Array.from(container.querySelectorAll(rowSelector));
    if (rows.length === 0) return false;

    // Get the currently focused element
    const currentElement = document.activeElement as HTMLElement;

    // Find which row and cell are currently focused
    let currentRowIndex = -1;
    let currentCellIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll(cellSelector));
      const cellIndex = cells.indexOf(currentElement);

      if (cellIndex !== -1) {
        currentRowIndex = i;
        currentCellIndex = cellIndex;
        break;
      }
    }

    // If focus is not in the grid, focus the first cell
    if (currentRowIndex === -1 || currentCellIndex === -1) {
      const firstRow = rows[0];
      const firstCell = firstRow.querySelector(cellSelector) as HTMLElement;

      if (firstCell) {
        (firstCell).focus({ preventScroll });
        return true;
      }

      return false;
    }

    // Calculate the next position based on arrow key
    let nextRowIndex = currentRowIndex;
    let nextCellIndex = currentCellIndex;

    switch (event.key) {
      case KeyboardKeys.ARROW_UP:
        nextRowIndex = currentRowIndex - 1;
        if (nextRowIndex < 0 && loop) {
          nextRowIndex = rows.length - 1;
        }
        break;

      case KeyboardKeys.ARROW_DOWN:
        nextRowIndex = currentRowIndex + 1;
        if (nextRowIndex >= rows.length && loop) {
          nextRowIndex = 0;
        }
        break;

      case KeyboardKeys.ARROW_LEFT:
        nextCellIndex = currentCellIndex - 1;
        if (nextCellIndex < 0) {
          if (loop) {
            // Go to the previous row, last cell
            nextRowIndex = currentRowIndex - 1;
            if (nextRowIndex < 0) {
              nextRowIndex = rows.length - 1;
            }

            const cells = Array.from(rows[nextRowIndex].querySelectorAll(cellSelector));
            nextCellIndex = cells.length - 1;
          } else {
            nextCellIndex = 0;
          }
        }
        break;

      case KeyboardKeys.ARROW_RIGHT: {
        const currentCells = Array.from(rows[currentRowIndex].querySelectorAll(cellSelector));
        nextCellIndex = currentCellIndex + 1;

        if (nextCellIndex >= currentCells.length) {
          if (loop) {
            // Go to the next row, first cell
            nextRowIndex = currentRowIndex + 1;
            if (nextRowIndex >= rows.length) {
              nextRowIndex = 0;
            }
            nextCellIndex = 0;
          } else {
            nextCellIndex = currentCells.length - 1;
          }
        }
        break;
      }
    }

    // Check if we can move to the calculated position
    if (nextRowIndex >= 0 && nextRowIndex < rows.length) {
      const nextRow = rows[nextRowIndex];
      const nextCells = Array.from(nextRow.querySelectorAll(cellSelector));

      // Adjust cellIndex if needed for the new row
      if (nextCellIndex >= nextCells.length) {
        nextCellIndex = nextCells.length - 1;
      }

      if (nextCellIndex >= 0 && nextCellIndex < nextCells.length) {
        const nextCell = nextCells[nextCellIndex] as HTMLElement;
        nextCell.focus({ preventScroll });
        onNavigate?.(nextRowIndex, nextCellIndex);
        event.preventDefault();
        return true;
      }
    }

    return false;
  };
}

/**
 * Creates an event handler for Home/End key navigation
 *
 * @param container The container with focusable elements
 * @param options Configuration options
 * @returns A keyboard event handler
 */
export function createHomeEndHandler(
  container: HTMLElement,
  options: {
    preventScroll?: boolean;
  } = {}
): (event: KeyboardEvent) => boolean {
  const { preventScroll = true } = options;

  return (event: KeyboardEvent): boolean => {
    if (event.key !== KeyboardKeys.HOME && event.key !== KeyboardKeys.END) {
      return false;
    }

    const elements = getFocusableElements(container);
    if (elements.length === 0) return false;

    if (event.key === KeyboardKeys.HOME) {
      (elements[0] as HTMLElement).focus({ preventScroll });
      event.preventDefault();
      return true;
    }

    if (event.key === KeyboardKeys.END) {
      (elements[elements.length - 1] as HTMLElement).focus({ preventScroll });
      event.preventDefault();
      return true;
    }

    return false;
  };
}

/**
 * Creates a composite keyboard navigation handler that combines multiple handlers
 *
 * @param handlers Array of keyboard event handlers
 * @returns A combined handler that tries each handler in sequence
 */
export function createCompositeHandler(
  handlers: ((event: KeyboardEvent) => boolean)[]
): (event: KeyboardEvent) => boolean {
  return (event: KeyboardEvent): boolean => {
    for (const handler of handlers) {
      if (handler(event)) {
        return true;
      }
    }
    return false;
  };
}
