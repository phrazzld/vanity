/**
 * UI Store Unit Tests
 * @jest-environment jsdom
 *
 * Comprehensive test coverage for theme initialization logic, state management,
 * media query handling, and race condition protection.
 *
 * Context: PR #70 - Addresses Codex P1 review feedback
 * Issue: Complex theme logic had zero unit test coverage
 * Target: >80% coverage for src/store/ui.ts
 */

import { renderHook, act } from '@testing-library/react';

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import store after mocks are set up
import { useUIStore, useTheme } from '../ui';

describe('UI Store - Theme Logic', () => {
  let mockMatchMedia: jest.Mock;
  let mockAddEventListener: jest.Mock;
  let mockRemoveEventListener: jest.Mock;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Clear localStorage mock
    localStorageMock = {};

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      writable: true,
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
        }),
        key: jest.fn(),
        length: 0,
      },
    });

    // Mock matchMedia
    mockAddEventListener = jest.fn();
    mockRemoveEventListener = jest.fn();
    mockMatchMedia = jest.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as jest.Mock;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    // Clear DOM classes
    document.documentElement.classList.remove('dark', 'theme-transitioning');
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.documentElement.classList.remove('dark', 'theme-transitioning');
  });

  describe('theme state management', () => {
    it('should provide isDarkMode and toggleDarkMode through useTheme hook', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current).toHaveProperty('isDarkMode');
      expect(result.current).toHaveProperty('toggleDarkMode');
      expect(typeof result.current.toggleDarkMode).toBe('function');
    });

    it('should toggle theme on and off', () => {
      const { result } = renderHook(() => useTheme());

      const initialState = result.current.isDarkMode;

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.isDarkMode).toBe(!initialState);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.isDarkMode).toBe(initialState);
    });

    it('should add dark class to document when toggling to dark mode', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => ({
        isDarkMode: useUIStore(state => state.isDarkMode),
        toggleDarkMode: useUIStore(state => state.toggleDarkMode),
      }));

      // Ensure starting from light mode
      if (result.current.isDarkMode) {
        act(() => {
          result.current.toggleDarkMode();
        });
      }

      document.documentElement.classList.remove('dark');

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      jest.useRealTimers();
    });

    it('should set hasExplicitThemePreference when toggling', () => {
      const { result } = renderHook(() => ({
        toggleDarkMode: useUIStore(state => state.toggleDarkMode),
        hasExplicitThemePreference: useUIStore(state => state.hasExplicitThemePreference),
      }));

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.hasExplicitThemePreference).toBe(true);
    });

    it('should update lastUserThemeInteraction timestamp on toggle', () => {
      const { result } = renderHook(() => ({
        toggleDarkMode: useUIStore(state => state.toggleDarkMode),
        lastUserThemeInteraction: useUIStore(state => state.lastUserThemeInteraction),
      }));

      const before = Date.now();

      act(() => {
        result.current.toggleDarkMode();
      });

      const after = result.current.lastUserThemeInteraction;

      expect(after).toBeGreaterThanOrEqual(before);
      expect(after).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('initializeTheme() - backward compatibility', () => {
    it('should respect legacy isDarkMode without explicit flag', () => {
      // Set legacy format in localStorage
      localStorageMock['ui-store'] = JSON.stringify({
        state: { isDarkMode: true },
      });

      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
        isDarkMode: useUIStore(state => state.isDarkMode),
        hasExplicitThemePreference: useUIStore(state => state.hasExplicitThemePreference),
      }));

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.initializeTheme();
      });

      // Should infer explicit preference from presence of isDarkMode
      expect(result.current.hasExplicitThemePreference).toBe(true);
      expect(result.current.isDarkMode).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      cleanup?.();
    });

    it('should respect legacy light mode preference', () => {
      localStorageMock['ui-store'] = JSON.stringify({
        state: { isDarkMode: false },
      });

      document.documentElement.classList.add('dark');

      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
        isDarkMode: useUIStore(state => state.isDarkMode),
        hasExplicitThemePreference: useUIStore(state => state.hasExplicitThemePreference),
      }));

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.initializeTheme();
      });

      expect(result.current.hasExplicitThemePreference).toBe(true);
      expect(result.current.isDarkMode).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      cleanup?.();
    });
  });

  describe('initializeTheme() - new format', () => {
    it('should respect explicit preference flag', () => {
      localStorageMock['ui-store'] = JSON.stringify({
        state: { isDarkMode: true, hasExplicitThemePreference: true },
      });

      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
        isDarkMode: useUIStore(state => state.isDarkMode),
        hasExplicitThemePreference: useUIStore(state => state.hasExplicitThemePreference),
      }));

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.initializeTheme();
      });

      expect(result.current.hasExplicitThemePreference).toBe(true);
      expect(result.current.isDarkMode).toBe(true);

      cleanup?.();
    });

    it('should use system preference when no stored data', () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // System prefers dark
        media: '(prefers-color-scheme: dark)',
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      });

      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
        isDarkMode: useUIStore(state => state.isDarkMode),
        hasExplicitThemePreference: useUIStore(state => state.hasExplicitThemePreference),
      }));

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.initializeTheme();
      });

      expect(result.current.hasExplicitThemePreference).toBe(false);
      expect(result.current.isDarkMode).toBe(true);

      cleanup?.();
    });
  });

  describe('initializeTheme() - error handling', () => {
    it('should handle localStorage unavailability gracefully', () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      });

      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
        isDarkMode: useUIStore(state => state.isDarkMode),
      }));

      let cleanup: (() => void) | undefined;

      expect(() => {
        act(() => {
          cleanup = result.current.initializeTheme();
        });
      }).not.toThrow();

      // Should fallback to system preference
      expect(result.current.isDarkMode).toBe(false);

      cleanup?.();
    });

    it('should handle corrupted localStorage data', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid json{}}');

      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      });

      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
        isDarkMode: useUIStore(state => state.isDarkMode),
      }));

      let cleanup: (() => void) | undefined;

      expect(() => {
        act(() => {
          cleanup = result.current.initializeTheme();
        });
      }).not.toThrow();

      // Should fallback to system preference
      expect(result.current.isDarkMode).toBe(true);

      cleanup?.();
    });
  });

  describe('media query handling', () => {
    it('should listen for system preference changes', () => {
      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
      }));

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.initializeTheme();
      });

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      cleanup?.();
    });

    it('should cleanup listener on unmount', () => {
      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
      }));

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.initializeTheme();
      });

      expect(mockAddEventListener).toHaveBeenCalled();

      cleanup?.();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('DOM synchronization', () => {
    it('should add dark class when initializing with dark preference', () => {
      localStorageMock['ui-store'] = JSON.stringify({
        state: { isDarkMode: true, hasExplicitThemePreference: true },
      });

      document.documentElement.classList.remove('dark');

      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
      }));

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.initializeTheme();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      cleanup?.();
    });

    it('should remove dark class when initializing with light preference', () => {
      localStorageMock['ui-store'] = JSON.stringify({
        state: { isDarkMode: false, hasExplicitThemePreference: true },
      });

      document.documentElement.classList.add('dark');

      const { result } = renderHook(() => ({
        initializeTheme: useUIStore(state => state.initializeTheme),
      }));

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.initializeTheme();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);

      cleanup?.();
    });
  });

  describe('setDarkMode', () => {
    it('should set explicit preference when calling setDarkMode', () => {
      const { result } = renderHook(() => ({
        setDarkMode: useUIStore(state => state.setDarkMode),
        isDarkMode: useUIStore(state => state.isDarkMode),
        hasExplicitThemePreference: useUIStore(state => state.hasExplicitThemePreference),
      }));

      act(() => {
        result.current.setDarkMode(true);
      });

      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.hasExplicitThemePreference).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('State Isolation', () => {
    it('should start with fresh state (test 1)', () => {
      // This test modifies state
      const { result } = renderHook(() => ({
        setDarkMode: useUIStore(state => state.setDarkMode),
        isDarkMode: useUIStore(state => state.isDarkMode),
      }));

      // Verify initial state is fresh
      expect(result.current.isDarkMode).toBe(false);

      // Modify state
      act(() => {
        result.current.setDarkMode(true);
      });

      expect(result.current.isDarkMode).toBe(true);
      // State modified - afterEach will reset before next test
    });

    it('should start with fresh state (test 2)', () => {
      // This test runs AFTER the previous test
      // If mock is working, state should be reset to initial (false)
      // If mock not working, state would still be true from previous test
      const { result } = renderHook(() => ({
        isDarkMode: useUIStore(state => state.isDarkMode),
      }));

      expect(result.current.isDarkMode).toBe(false);
    });
  });

  describe('Mobile Navigation State', () => {
    it('should initialize with mobile nav closed', () => {
      const { result } = renderHook(() => ({
        isMobileNavOpen: useUIStore(state => state.isMobileNavOpen),
      }));

      expect(result.current.isMobileNavOpen).toBe(false);
    });

    it('should open mobile nav when openMobileNav is called', () => {
      const { result } = renderHook(() => ({
        isMobileNavOpen: useUIStore(state => state.isMobileNavOpen),
        openMobileNav: useUIStore(state => state.openMobileNav),
      }));

      act(() => {
        result.current.openMobileNav();
      });

      expect(result.current.isMobileNavOpen).toBe(true);
    });

    it('should close mobile nav when closeMobileNav is called', () => {
      const { result } = renderHook(() => ({
        isMobileNavOpen: useUIStore(state => state.isMobileNavOpen),
        openMobileNav: useUIStore(state => state.openMobileNav),
        closeMobileNav: useUIStore(state => state.closeMobileNav),
      }));

      // First open it
      act(() => {
        result.current.openMobileNav();
      });

      expect(result.current.isMobileNavOpen).toBe(true);

      // Then close it
      act(() => {
        result.current.closeMobileNav();
      });

      expect(result.current.isMobileNavOpen).toBe(false);
    });

    it('should toggle mobile nav state', () => {
      const { result } = renderHook(() => ({
        isMobileNavOpen: useUIStore(state => state.isMobileNavOpen),
        toggleMobileNav: useUIStore(state => state.toggleMobileNav),
      }));

      const initialState = result.current.isMobileNavOpen;

      // Toggle once
      act(() => {
        result.current.toggleMobileNav();
      });

      expect(result.current.isMobileNavOpen).toBe(!initialState);

      // Toggle back
      act(() => {
        result.current.toggleMobileNav();
      });

      expect(result.current.isMobileNavOpen).toBe(initialState);
    });

    it('should not persist mobile nav state to localStorage', () => {
      const { result } = renderHook(() => ({
        openMobileNav: useUIStore(state => state.openMobileNav),
      }));

      // Open mobile nav
      act(() => {
        result.current.openMobileNav();
      });

      // Check that localStorage was called (for theme state)
      // but mobile nav state should NOT be in the persisted data
      const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls;

      if (setItemCalls.length > 0) {
        const lastCall = setItemCalls[setItemCalls.length - 1];
        const persistedData = JSON.parse(lastCall[1] as string);

        // Mobile nav state should not be persisted
        expect(persistedData.state).not.toHaveProperty('isMobileNavOpen');
      }
    });
  });
});
