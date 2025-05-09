'use client';

/**
 * UI Store using Zustand
 *
 * This store manages global UI state such as:
 * - Sidebar visibility
 * - Modal state
 * - Navigation state
 * - Other app-wide UI concerns
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define the UI state interface
interface UIState {
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

// Create the UI store with devtools
export const useUIStore = create<UIState>()(
  devtools(
    set => ({
      // Initial sidebar state
      isSidebarOpen: false,
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Initial modal state
      activeModal: null,
      openModal: _modalId => set({ activeModal: _modalId }),
      closeModal: () => set({ activeModal: null }),

      // Initial search state
      globalSearchQuery: '',
      setGlobalSearchQuery: _query => set({ globalSearchQuery: _query }),
      isSearchActive: false,
      setSearchActive: _active => set({ isSearchActive: _active }),
    }),
    {
      name: 'UIStore',
      enabled:
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'),
    }
  )
);
