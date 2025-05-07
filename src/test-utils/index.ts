// src/test-utils/index.ts
import React, { useState } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeContext } from '@/app/context/ThemeContext';
import userEvent from '@testing-library/user-event';

// ===========================================================================
// Theme Provider Test Setup
// ===========================================================================

/**
 * A custom theme provider for tests that doesn't use browser APIs
 */
export function TestThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}) {
  const [isDarkMode, setIsDarkMode] = useState(initialTheme === 'dark');

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return React.createElement(
    ThemeContext.Provider,
    { value: { isDarkMode, toggleDarkMode } },
    React.createElement(
      'div',
      { 
        'data-testid': 'theme-provider',
        'data-theme': isDarkMode ? 'dark' : 'light'
      },
      children
    )
  );
}

/**
 * Custom render method that includes the TestThemeProvider wrapper
 * Simplified from https://testing-library.com/docs/react-testing-library/setup
 */
type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  themeMode?: 'light' | 'dark';
  // Add other custom render options here as needed
};

export function renderWithTheme(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const { themeMode = 'light', ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      React.createElement(TestThemeProvider, { initialTheme: themeMode }, children)
    ),
    ...renderOptions,
  });
}

// Setup user-event with standard configuration
export function setupUser(options = { delay: null }) {
  return userEvent.setup(options);
}

// ===========================================================================
// Mock Response Helpers
// ===========================================================================

// Mock Fetch Response Helper
export function createMockResponse<T>(data: T, status = 200, statusText = 'OK') {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

// Create a failed response
export function createMockErrorResponse(
  status = 500,
  statusText = 'Server Error',
  message = 'An error occurred'
) {
  return {
    ok: false,
    status,
    statusText,
    json: jest.fn().mockResolvedValue({ error: message }),
    text: jest.fn().mockResolvedValue(JSON.stringify({ error: message })),
  };
}

// Mocks the fetch for testing API calls
export function mockFetch<T>(data: T, status = 200) {
  const mockResponse = createMockResponse(data, status);
  const fetchMock = jest.fn().mockResolvedValue(mockResponse);
  // Cast window to unknown first to avoid TypeScript errors
  (window as unknown as { fetch: typeof fetchMock }).fetch = fetchMock;
  return { mockResponse, mockFetch: fetchMock };
}

// ===========================================================================
// Test Utilities
// ===========================================================================

// Helper to wait for a condition
export function waitForCondition(
  callback: () => boolean | Promise<boolean>,
  { timeout = 1000, interval = 50 } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = async () => {
      const result = await callback();
      if (result) {
        resolve();
        return;
      }

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > timeout) {
        reject(new Error(`Timed out waiting for condition after ${timeout}ms`));
        return;
      }

      setTimeout(checkCondition, interval);
    };

    checkCondition();
  });
}

// Hook testing with theme context
import { renderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react';

/**
 * Custom renderHook method that includes the ThemeProvider wrapper
 */
export function renderHookWithTheme<Result, Props>(
  hook: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'> & {
    themeMode?: 'light' | 'dark';
  }
): RenderHookResult<Result, Props> {
  const { themeMode = 'light', ...renderOptions } = options || {};
  
  return renderHook(hook, {
    wrapper: ({ children }) => (
      React.createElement(TestThemeProvider, { initialTheme: themeMode }, children)
    ),
    ...renderOptions,
  });
}

// Export everything from testing library for convenience
export * from '@testing-library/react';
export { userEvent };
