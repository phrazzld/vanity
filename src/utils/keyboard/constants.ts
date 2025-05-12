/**
 * Keyboard-related constants
 *
 * This file provides constants and type definitions for common keyboard interactions,
 * making keyboard event handling more consistent throughout the application.
 */

/**
 * Common keyboard key constants
 */
export const KeyboardKeys = {
  TAB: 'Tab',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Type for keyboard key constants
 */
export type KeyboardKey = (typeof KeyboardKeys)[keyof typeof KeyboardKeys];

/**
 * Standard keyboard modifiers
 */
export const KeyboardModifiers = {
  CTRL: 'ctrl',
  ALT: 'alt',
  SHIFT: 'shift',
  META: 'meta', // Command key on Mac, Windows key on PC
} as const;

/**
 * Type for keyboard modifiers
 */
export type KeyboardModifier = (typeof KeyboardModifiers)[keyof typeof KeyboardModifiers];

/**
 * Common selector for all focusable elements
 *
 * This covers standard interactive elements and those with tabindex
 * that can receive keyboard focus.
 */
export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
] as const;

/**
 * Combined selector string for all focusable elements
 */
export const FOCUSABLE_ELEMENTS_SELECTOR = FOCUSABLE_ELEMENTS.join(',');

/**
 * Common ARIA role selectors for semantic elements
 */
export const ARIA_ROLES = {
  BUTTON: '[role="button"]',
  CHECKBOX: '[role="checkbox"]',
  COMBOBOX: '[role="combobox"]',
  DIALOG: '[role="dialog"]',
  LINK: '[role="link"]',
  LISTBOX: '[role="listbox"]',
  LISTITEM: '[role="listitem"]',
  MENU: '[role="menu"]',
  MENUITEM: '[role="menuitem"]',
  OPTION: '[role="option"]',
  RADIO: '[role="radio"]',
  SWITCH: '[role="switch"]',
  TAB: '[role="tab"]',
  TABPANEL: '[role="tabpanel"]',
} as const;
