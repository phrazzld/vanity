'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/ui';

/**
 * ThemeInitializer Component
 *
 * This component initializes the theme from localStorage or system preference
 * on mount. It should be included once at the root of the application.
 *
 * Features:
 * - Loads theme from localStorage if available
 * - Falls back to system preference if no stored preference
 * - Applies dark class to document element immediately
 * - Sets up system preference change listener
 */
export default function ThemeInitializer() {
  useEffect(() => {
    // Initialize theme and get cleanup function
    const cleanup = useUIStore.getState().initializeTheme();

    // Return cleanup to remove media query listener on unmount
    return cleanup;
  }, []);

  return null;
}
