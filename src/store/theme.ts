'use client';

/**
 * Theme Store using Zustand
 *
 * This store manages the application's theme state (dark/light mode)
 * using Zustand with the persist middleware for local storage persistence.
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { useEffect } from 'react';

// Define the shape of our theme state
interface ThemeState {
  // State
  isDarkMode: boolean;

  // Actions
  toggleDarkMode: () => void;
  setDarkMode: (_isDark: boolean) => void;
}

// Create the theme store with persistence and devtools
export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      set => ({
        // Initial state
        isDarkMode: false,

        // Actions
        toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
        setDarkMode: (_isDark: boolean) => set({ isDarkMode: _isDark }),
      }),
      {
        // Local storage configuration
        name: 'theme-storage',

        // Only persist the isDarkMode value
        partialize: state => ({ isDarkMode: state.isDarkMode }),
      }
    ),
    {
      name: 'ThemeStore',
      enabled:
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'),
    }
  )
);

/**
 * Theme Effect Hook
 *
 * This hook handles side effects related to the theme:
 * - Applies the dark mode class to the document
 * - Syncs with system color scheme preference
 * - Handles hydration
 */
export function useThemeEffect() {
  const { isDarkMode, setDarkMode } = useThemeStore();

  // Apply theme class to document when state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle system preference and initialization
  useEffect(() => {
    // Check if store has loaded from localStorage
    const isStoreHydrated = useThemeStore.persist.hasHydrated();

    // If store isn't hydrated, initialize from system preference
    if (!isStoreHydrated) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference in localStorage
      if (typeof window !== 'undefined' && !window.localStorage.getItem('theme-storage')) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);
}
