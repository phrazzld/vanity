/**
 * React hook for managing keyboard shortcuts
 */
import { useEffect, useRef } from 'react';
import type { ShortcutHandler, ShortcutManager } from '../../utils/keyboard';
import { createShortcutManager, getGlobalShortcutManager } from '../../utils/keyboard';

/**
 * Options for the useShortcuts hook
 */
interface UseShortcutsOptions {
  /**
   * Whether to use the global shortcut manager or create a local one
   * Global shortcuts work across the entire application
   * Local shortcuts only work when the component is mounted
   * @default false
   */
  global?: boolean;
}

/**
 * Hook for registering and managing keyboard shortcuts
 *
 * @param shortcuts Array of shortcut configurations
 * @param options Hook options
 * @returns ShortcutManager instance
 */
export function useShortcuts(shortcuts: ShortcutHandler[], options: UseShortcutsOptions = {}) {
  const { global = false } = options;

  // Get or create the appropriate shortcut manager
  const managerRef = useRef<ShortcutManager>(
    global ? getGlobalShortcutManager() : createShortcutManager()
  );

  // Keep track of registered shortcut IDs for cleanup
  const registeredIds = useRef<string[]>([]);

  useEffect(() => {
    const manager = managerRef.current;
    const ids: string[] = [];

    // Register all shortcuts
    for (const shortcut of shortcuts) {
      try {
        const id = manager.register(shortcut);
        ids.push(id);
      } catch (error) {
        console.error(`Failed to register shortcut "${shortcut.id}":`, error);
      }
    }

    // Update the registered IDs ref
    registeredIds.current = ids;

    // Clean up when the component unmounts or shortcuts change
    return () => {
      // Only unregister shortcuts from a local manager or if the component is unmounting
      // We don't want to unregister global shortcuts when shortcuts array changes
      if (!global) {
        for (const id of ids) {
          manager.unregister(id);
        }
      }
    };
  }, [shortcuts, global]);

  // Clean up global shortcuts when the component unmounts
  useEffect(() => {
    // Only needed for global shortcuts
    if (!global) return;

    return () => {
      const manager = managerRef.current;

      // Unregister all shortcuts registered by this hook instance
      for (const id of registeredIds.current) {
        manager.unregister(id);
      }
    };
  }, [global]);

  return managerRef.current;
}
