/**
 * Type definitions for keyboard navigation utilities
 */

/**
 * Directions for arrow key navigation
 */
export type NavigationDirection = 'horizontal' | 'vertical' | 'both';

/**
 * Configuration options for arrow key navigation
 */
export interface ArrowNavigationOptions {
  /**
   * Direction of arrow key navigation
   * - horizontal: left/right arrows
   * - vertical: up/down arrows
   * - both: all arrow keys
   * @default 'both'
   */
  direction?: NavigationDirection;

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
   * @param currentIndex Index of the newly focused element
   * @param previousIndex Index of the previously focused element
   */
  onNavigate?: (_currentIndex: number, _previousIndex: number) => void;
}

/**
 * String representation of a key combination (e.g., "ctrl+s", "shift+alt+r")
 */
export type KeyCombination = string;

/**
 * Configuration for a keyboard shortcut
 */
export interface ShortcutHandler {
  /**
   * Unique identifier for this shortcut
   */
  id: string;

  /**
   * Key combination, e.g., "ctrl+s" or "shift+alt+r"
   */
  keyCombination: KeyCombination;

  /**
   * Function to call when the shortcut is triggered
   */
  handler: (_event: KeyboardEvent) => void;

  /**
   * Whether to prevent the default browser action
   * @default true
   */
  preventDefault?: boolean;

  /**
   * Description of what the shortcut does (for documentation)
   */
  description?: string;
}

/**
 * Internal representation of a registered shortcut
 */
export interface RegisteredShortcut extends ShortcutHandler {
  /**
   * Individual keys from the key combination
   */
  keys: string[];

  /**
   * Modifier keys parsed from the key combination
   */
  modifiers: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
}

/**
 * Configuration options for focus trap
 */
export interface FocusTrapOptions {
  /**
   * Whether the focus trap is active
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to automatically focus the first focusable element
   * @default true
   */
  initialFocus?: boolean;

  /**
   * Whether to restore focus to the previously focused element when unmounted
   * @default true
   */
  returnFocusOnUnmount?: boolean;

  /**
   * Callback when user attempts to tab out of the trap
   */
  onEscape?: () => void;
}

/**
 * Configuration options for focus management
 */
export interface FocusManagerOptions {
  /**
   * Whether to track focus history
   * @default true
   */
  trackHistory?: boolean;

  /**
   * Maximum number of focus history entries to track
   * @default 10
   */
  historyLimit?: number;
}
