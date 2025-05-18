/**
 * Keyboard shortcut management utilities
 */
import type { KeyCombination, ShortcutHandler, RegisteredShortcut } from './types';
// We don't need KeyboardKeys in this file
// import { KeyboardKeys } from './constants';

// Removed unused MODIFIER_MAP constant

/**
 * Parse a key combination string (e.g., "ctrl+shift+s") into individual keys and modifiers
 *
 * @param keyCombination Key combination string (e.g., "ctrl+s", "shift+alt+p")
 * @returns Object containing the parsed keys and modifiers
 */
export function parseKeyCombination(keyCombination: KeyCombination): {
  keys: string[];
  modifiers: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
} {
  const keys = keyCombination.toLowerCase().split('+');

  const modifiers = {
    ctrl: keys.includes('ctrl'),
    alt: keys.includes('alt'),
    shift: keys.includes('shift'),
    meta: keys.includes('meta') || keys.includes('cmd'),
  };

  // Filter out modifier keys to get the actual keys
  const nonModifierKeys = keys.filter(
    key => !['ctrl', 'alt', 'shift', 'meta', 'cmd'].includes(key)
  );

  return {
    keys: nonModifierKeys,
    modifiers,
  };
}

/**
 * Check if a keyboard event matches a registered shortcut
 *
 * @param event The keyboard event
 * @param shortcut The registered shortcut to check against
 * @returns boolean indicating if the event matches the shortcut
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: RegisteredShortcut): boolean {
  // Check modifiers
  if (event.ctrlKey !== shortcut.modifiers.ctrl) return false;
  if (event.altKey !== shortcut.modifiers.alt) return false;
  if (event.shiftKey !== shortcut.modifiers.shift) return false;
  if (event.metaKey !== shortcut.modifiers.meta) return false;

  // Check if the key matches one of the non-modifier keys
  const key = event.key.toLowerCase();
  return shortcut.keys.includes(key);
}

/**
 * Class to manage a collection of keyboard shortcuts
 */
export class ShortcutManager {
  private shortcuts: Map<string, RegisteredShortcut> = new Map();
  private eventListener: ((_event: KeyboardEvent) => void) | null = null;

  /**
   * Register a new keyboard shortcut
   *
   * @param shortcutConfig The shortcut configuration
   * @returns The registered shortcut ID
   */
  public register(shortcutConfig: ShortcutHandler): string {
    const { id, keyCombination, handler, preventDefault = true, description } = shortcutConfig;

    if (this.shortcuts.has(id)) {
      throw new Error(`Shortcut with ID "${id}" is already registered`);
    }

    const { keys, modifiers } = parseKeyCombination(keyCombination);

    const registeredShortcut: RegisteredShortcut = {
      id,
      keyCombination,
      handler,
      preventDefault,
      description,
      keys,
      modifiers,
    };

    this.shortcuts.set(id, registeredShortcut);

    // If this is the first shortcut, add the global event listener
    if (this.shortcuts.size === 1 && !this.eventListener) {
      this.attach();
    }

    return id;
  }

  /**
   * Unregister a keyboard shortcut by ID
   *
   * @param id The ID of the shortcut to remove
   * @returns boolean indicating if the shortcut was found and removed
   */
  public unregister(id: string): boolean {
    const removed = this.shortcuts.delete(id);

    // If no shortcuts remain, remove the global event listener
    if (this.shortcuts.size === 0 && this.eventListener) {
      this.detach();
    }

    return removed;
  }

  /**
   * Get all registered shortcuts
   *
   * @returns Array of registered shortcuts
   */
  public getAll(): RegisteredShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get a specific shortcut by ID
   *
   * @param id The shortcut ID
   * @returns The shortcut or undefined if not found
   */
  public get(id: string): RegisteredShortcut | undefined {
    return this.shortcuts.get(id);
  }

  /**
   * Clear all registered shortcuts
   */
  public clear(): void {
    this.shortcuts.clear();
    this.detach();
  }

  /**
   * Handle a keyboard event and trigger any matching shortcuts
   *
   * @param event The keyboard event
   * @returns boolean indicating if any shortcut was triggered
   */
  public handleEvent(event: KeyboardEvent): boolean {
    if (event.defaultPrevented) return false;

    for (const shortcut of this.shortcuts.values()) {
      if (matchesShortcut(event, shortcut)) {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }

        shortcut.handler(event);
        return true;
      }
    }

    return false;
  }

  /**
   * Attach the event listener to handle keyboard events
   */
  private attach(): void {
    this.eventListener = (event: KeyboardEvent) => {
      this.handleEvent(event);
    };

    document.addEventListener('keydown', this.eventListener);
  }

  /**
   * Detach the event listener
   */
  private detach(): void {
    if (this.eventListener) {
      document.removeEventListener('keydown', this.eventListener);
      this.eventListener = null;
    }
  }
}

/**
 * Create and return a new shortcut manager instance
 *
 * @returns A new ShortcutManager instance
 */
export function createShortcutManager(): ShortcutManager {
  return new ShortcutManager();
}

/**
 * Singleton instance of the shortcut manager for global shortcuts
 */
let globalShortcutManager: ShortcutManager | null = null;

/**
 * Get the global shortcut manager instance
 *
 * @returns The global ShortcutManager instance
 */
export function getGlobalShortcutManager(): ShortcutManager {
  if (!globalShortcutManager) {
    globalShortcutManager = createShortcutManager();
  }

  return globalShortcutManager;
}
