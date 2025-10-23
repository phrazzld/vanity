'use client';

/**
 * UI Store using Zustand
 *
 * This store manages global UI state such as:
 * - Theme (dark/light mode)
 * - Sidebar visibility
 * - Modal state
 * - Navigation state
 * - Other app-wide UI concerns
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';

// Define the UI state interface
interface UIState {
  // Theme state
  isDarkMode: boolean;
  hasExplicitThemePreference: boolean; // Track if user explicitly chose a theme
  lastUserThemeInteraction: number; // Timestamp of last user theme toggle (for race protection)
  toggleDarkMode: () => void;
  setDarkMode: (_isDark: boolean) => void;
  initializeTheme: () => (() => void) | undefined;

  // Sidebar state
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Modal state
  activeModal: string | null;
  openModal: (_modalId: string) => void;
  closeModal: () => void;

  // Search state
  globalSearchQuery: string;
  setGlobalSearchQuery: (_query: string) => void;
  isSearchActive: boolean;
  setSearchActive: (_active: boolean) => void;
}

// Create store function that will conditionally apply devtools
const createUIStore = () => {
  const storeCreator: StateCreator<UIState> = (set, get) => ({
    // Theme state with localStorage persistence
    isDarkMode: false, // Will be initialized from localStorage/system preference
    hasExplicitThemePreference: false, // Will be set to true when user toggles
    lastUserThemeInteraction: 0, // Timestamp for race condition protection
    toggleDarkMode: () => {
      const newValue = !get().isDarkMode;
      const now = Date.now();
      set({
        isDarkMode: newValue,
        hasExplicitThemePreference: true,
        lastUserThemeInteraction: now,
      });

      // Apply dark mode class and transition animation
      if (typeof window !== 'undefined') {
        document.documentElement.classList.add('theme-transitioning');
        if (newValue) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 200);
      }
    },
    setDarkMode: (_isDark: boolean) => {
      const now = Date.now();
      set({
        isDarkMode: _isDark,
        hasExplicitThemePreference: true,
        lastUserThemeInteraction: now,
      });

      // Apply dark mode class
      if (typeof window !== 'undefined') {
        if (_isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    initializeTheme: () => {
      if (typeof window === 'undefined') return;

      // Read directly from localStorage to avoid hydration race condition
      // Zustand persistence middleware hydrates asynchronously, so we can't trust
      // get().hasExplicitThemePreference on first mount - it will always be false
      let hasExplicitPreference = false;
      let storedDarkMode = false;

      try {
        const stored = localStorage.getItem('ui-store');
        if (stored) {
          const parsed = JSON.parse(stored) as {
            state?: { hasExplicitThemePreference?: boolean; isDarkMode?: boolean };
          };
          if (parsed.state?.hasExplicitThemePreference === true) {
            // New format - explicit flag present
            hasExplicitPreference = true;
            storedDarkMode = parsed.state.isDarkMode === true;
          } else if (parsed.state?.isDarkMode !== undefined) {
            // Legacy format - isDarkMode exists but no explicit flag
            // Infer explicit preference for backward compatibility
            hasExplicitPreference = true;
            storedDarkMode = parsed.state.isDarkMode === true;
          }
        }
      } catch {
        // localStorage unavailable or corrupt, fall through to system preference
      }

      const isDarkFromDOM = document.documentElement.classList.contains('dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (!hasExplicitPreference) {
        // No saved preference - use system preference
        set({ isDarkMode: prefersDark, hasExplicitThemePreference: false });

        // Sync DOM with system preference
        if (prefersDark && !isDarkFromDOM) {
          document.documentElement.classList.add('dark');
        } else if (!prefersDark && isDarkFromDOM) {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // User has explicit preference - ensure store matches saved value
        set({ isDarkMode: storedDarkMode, hasExplicitThemePreference: true });

        // Sync DOM with stored preference
        if (storedDarkMode !== isDarkFromDOM) {
          if (storedDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }

      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const timeSinceLastUserInteraction = Date.now() - get().lastUserThemeInteraction;
        const USER_INTERACTION_GRACE_PERIOD = 1000; // 1 second

        // Only update from system changes if:
        // 1. User hasn't set explicit preference AND
        // 2. No recent user interaction (prevent race conditions)
        if (
          !get().hasExplicitThemePreference &&
          timeSinceLastUserInteraction > USER_INTERACTION_GRACE_PERIOD
        ) {
          set({ isDarkMode: e.matches });
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      };
      mediaQuery.addEventListener('change', handleChange);

      // Return cleanup function to remove listener
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    },

    // Sidebar state
    isSidebarOpen: false,
    openSidebar: () => set({ isSidebarOpen: true }),
    closeSidebar: () => set({ isSidebarOpen: false }),
    toggleSidebar: () => set((state: UIState) => ({ isSidebarOpen: !state.isSidebarOpen })),

    // Modal state
    activeModal: null,
    openModal: (_modalId: string) => set({ activeModal: _modalId }),
    closeModal: () => set({ activeModal: null }),

    // Search state
    globalSearchQuery: '',
    setGlobalSearchQuery: (_query: string) => set({ globalSearchQuery: _query }),
    isSearchActive: false,
    setSearchActive: (_active: boolean) => set({ isSearchActive: _active }),
  });

  // Check if we should enable devtools (only in development)
  const isDevelopment =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const persistedStore = persist(storeCreator, {
    name: 'ui-store',
    partialize: (state: UIState) => ({
      isDarkMode: state.isDarkMode,
      hasExplicitThemePreference: state.hasExplicitThemePreference,
    }),
  });

  // Apply devtools only in development
  if (isDevelopment && typeof devtools === 'function') {
    return create<UIState>()(
      devtools(persistedStore, {
        name: 'UIStore',
      })
    );
  }

  // In production, no devtools
  return create<UIState>()(persistedStore);
};

// Export the store
export const useUIStore = createUIStore();

/**
 * Hook to use theme from UIStore (for easy migration from ThemeContext)
 */
export function useTheme() {
  const isDarkMode = useUIStore(state => state.isDarkMode);
  const toggleDarkMode = useUIStore(state => state.toggleDarkMode);
  return { isDarkMode, toggleDarkMode };
}
