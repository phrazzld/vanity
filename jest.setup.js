/* eslint-env jest, node */
/* global global, URLSearchParams, process */

// Import Jest DOM extensions and other test utilities
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import React from 'react';

// Configure Testing Library
configure({
  // Set the timeout for async utilities
  asyncUtilTimeout: 5000,
  // When true, all queries from Testing Library are
  // wrapped with expect assertions
  throwSuggestions: true,
});

// =============================================================================
// Custom Jest Matchers for Snapshots
// =============================================================================

expect.extend({
  // Custom matcher for checking if a component renders consistently
  toMatchComponentSnapshot(received, expected) {
    const { container } = received;
    const innerHTML = container.innerHTML
      .replace(/\s{2,}/g, ' ')
      .replace(/\n/g, '')
      .trim();

    const pass = innerHTML === expected;

    return {
      pass,
      message: () =>
        pass
          ? `Expected component not to match snapshot`
          : `Expected component to match snapshot.\n\nExpected: ${expected}\n\nReceived: ${innerHTML}`,
    };
  },

  // Custom matcher for responsive snapshots
  toMatchResponsiveSnapshots(received, expected) {
    const pass = Object.keys(expected).every(key => expected[key] === received[key]);

    return {
      pass,
      message: () =>
        pass
          ? `Expected responsive snapshots not to match`
          : `Expected responsive snapshots to match.\n\nDifferences:\n${Object.keys(expected)
              .filter(key => expected[key] !== received[key])
              .map(key => `${key}:\nExpected: ${expected[key]}\nReceived: ${received[key]}`)
              .join('\n\n')}`,
    };
  },

  // Adds ability to check if a component matches theme variants
  toMatchThemeSnapshots(lightModeRender, darkModeRender) {
    const lightHTML = lightModeRender.container.innerHTML
      .replace(/\s{2,}/g, ' ')
      .replace(/\n/g, '')
      .trim();

    const darkHTML = darkModeRender.container.innerHTML
      .replace(/\s{2,}/g, ' ')
      .replace(/\n/g, '')
      .trim();

    // Check that the renders are different (if they're the same, the component isn't respecting the theme)
    const pass = lightHTML !== darkHTML;

    return {
      pass,
      message: () =>
        pass
          ? `Expected component to render the same in light and dark mode`
          : `Expected component to render differently in light and dark mode, but they are identical`,
    };
  },
});

// =============================================================================
// Browser API Mocks
// =============================================================================

// Mock browser APIs only in browser-like environments
if (typeof window !== 'undefined') {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn(key => store[key] ?? null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn(key => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      length: Object.keys(store).length,
      key: jest.fn(index => Object.keys(store)[index] || null),
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false, // Default to light mode
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Make matchMedia mockable for dark mode tests
  window.matchMedia.mockImplementation(query => {
    return {
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// =============================================================================
// Next.js and App Mocks
// =============================================================================

// Mock the ThemeContext
jest.mock('@/app/context/ThemeContext', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  }),
  ThemeProvider: ({ children }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'theme-provider',
      },
      children
    ),
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // We're forwarding all props including alt, so this is safe
    return React.createElement('img', props);
  },
}));

// =============================================================================
// Test Setup and Teardown
// =============================================================================

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();

  // Reset localStorage mock and other browser-specific mocks only in browser environments
  if (typeof window !== 'undefined') {
    // Get localStorage mock from window property
    const localStorageMock = window.localStorage;
    if (localStorageMock && typeof localStorageMock.clear === 'function') {
      localStorageMock.clear();
    }

    // Reset any custom window mocks
    if (window.matchMedia && typeof window.matchMedia.mockClear === 'function') {
      window.matchMedia.mockClear();
    }
  }
});

// Mock environment variables
process.env.NEXT_PUBLIC_SPACES_BASE_URL = 'https://test-space.com';
process.env.NODE_ENV = 'test';
