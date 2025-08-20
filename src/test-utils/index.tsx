// src/test-utils/index.tsx
import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ===========================================================================
// Theme Provider Test Setup
// ===========================================================================

/**
 * A simple test wrapper that sets a data-theme attribute for testing
 * Note: Theme is now managed by Zustand store, so we don't need a provider
 */
export function TestThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}) {
  return <div data-theme={initialTheme}>{children}</div>;
}

/**
 * Custom render method that includes the TestThemeProvider wrapper
 * Simplified from https://testing-library.com/docs/react-testing-library/setup
 */
type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  themeMode?: 'light' | 'dark';
  // Add other custom render options here as needed
};

export function renderWithTheme(ui: React.ReactElement, options?: CustomRenderOptions) {
  const { themeMode = 'light', ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <TestThemeProvider initialTheme={themeMode}>{children}</TestThemeProvider>
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

/**
 * Type for the mock response returned by createMockResponse
 */
export type MockResponse<T> = {
  ok: boolean;
  status: number;
  statusText: string;
  json: jest.Mock<Promise<T>>;
  text: jest.Mock<Promise<string>>;
};

/**
 * Type for the return value of mockFetch
 */
export type MockFetchReturn<T> = {
  mockResponse: MockResponse<T>;
  mockFetch: jest.Mock<Promise<MockResponse<T>>>;
};

// Mock Fetch Response Helper
export function createMockResponse<T>(data: T, status = 200, statusText = 'OK'): MockResponse<T> {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: jest.fn().mockResolvedValue(data) as jest.Mock<Promise<T>>,
    text: jest.fn().mockResolvedValue(JSON.stringify(data)) as jest.Mock<Promise<string>>,
  };
}

// Create a failed response
export function createMockErrorResponse(
  status = 500,
  statusText = 'Server Error',
  message = 'An error occurred'
): MockResponse<{ error: string }> {
  return {
    ok: false,
    status,
    statusText,
    json: jest.fn().mockResolvedValue({ error: message }) as jest.Mock<Promise<{ error: string }>>,
    text: jest.fn().mockResolvedValue(JSON.stringify({ error: message })) as jest.Mock<
      Promise<string>
    >,
  };
}

// Mocks the fetch for testing API calls
export function mockFetch<T>(data: T, status = 200): MockFetchReturn<T> {
  const mockResponse = createMockResponse(data, status);
  const fetchMock = jest.fn().mockResolvedValue(mockResponse) as jest.Mock<
    Promise<MockResponse<T>>
  >;
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
import { renderHook } from '@testing-library/react';
import type { RenderHookOptions, RenderHookResult } from '@testing-library/react';

/**
 * Custom renderHook method that includes the ThemeProvider wrapper
 */
export function renderHookWithTheme<Result, Props>(
  hook: (_props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'> & {
    themeMode?: 'light' | 'dark';
  }
): RenderHookResult<Result, Props> {
  // _initialProps would be used by the renderHook function internally
  const { themeMode = 'light', ...renderOptions } = options || {};

  return renderHook(hook, {
    wrapper: ({ children }) => (
      <TestThemeProvider initialTheme={themeMode}>{children}</TestThemeProvider>
    ),
    ...renderOptions,
  });
}

// ===========================================================================
// Snapshot Testing Utilities
// ===========================================================================

/**
 * Creates a snapshot test with consistent formatting
 *
 * @param ui The React element to render
 * @param options The render options, including theme mode
 * @returns The rendered component for snapshot testing
 */
export function createComponentSnapshot(ui: React.ReactElement, options?: CustomRenderOptions) {
  const { container } = renderWithTheme(ui, options);

  // Remove whitespace for cleaner snapshots
  const cleanHtml = container.innerHTML
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, '')
    .trim();

  return {
    container,
    cleanHtml,
  };
}

/**
 * Creates a responsive snapshot for multiple viewport sizes
 * Sets the viewport size using Jest's mocked window object
 */
export function createResponsiveSnapshots(
  ui: React.ReactElement,
  viewportSizes = ['mobile', 'tablet', 'desktop'],
  options?: CustomRenderOptions
) {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  const viewportMap: Record<string, { width: number; height: number }> = {
    mobile: { width: 390, height: 844 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 800 },
  };

  const snapshots: Record<string, string> = {};

  // Generate snapshot for each viewport size
  viewportSizes.forEach(size => {
    // Set viewport size
    const viewport = viewportMap[size];
    if (!viewport) return;

    // Use temporary variables to avoid TypeScript's unsafe assignment error
    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;

    // Use explicit type for configurable object to avoid unsafe assignment
    const widthConfig: PropertyDescriptor = {
      writable: true,
      configurable: true,
      value: viewportWidth,
    };
    const heightConfig: PropertyDescriptor = {
      writable: true,
      configurable: true,
      value: viewportHeight,
    };

    Object.defineProperty(window, 'innerWidth', widthConfig);
    Object.defineProperty(window, 'innerHeight', heightConfig);

    // Create window.matchMedia mock for the current viewport
    // Use width value directly to avoid unsafe assignment
    const width = viewport.width;
    const isDarkMode = options?.themeMode === 'dark';

    // Create type-safe query matcher function
    const matchesQuery = (query: string): boolean => {
      return (
        query.includes(`(min-width: ${width}px)`) ||
        (query.includes('(prefers-color-scheme: dark)') && isDarkMode)
      );
    };

    const mockMatchMedia = jest.fn().mockImplementation((query: string) => {
      return {
        matches: matchesQuery(query),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });

    // Type assertion to avoid TypeScript errors
    window.matchMedia = mockMatchMedia as typeof window.matchMedia;

    // Render the component
    const { cleanHtml } = createComponentSnapshot(ui, options);
    snapshots[size] = cleanHtml;
  });

  // Restore original viewport size
  // Use temporary variables to avoid unsafe assignment
  const originalWidth = originalInnerWidth;
  const originalHeight = originalInnerHeight;

  // Use explicit type for configurable object to avoid unsafe assignment
  const originalWidthConfig: PropertyDescriptor = {
    writable: true,
    configurable: true,
    value: originalWidth,
  };
  const originalHeightConfig: PropertyDescriptor = {
    writable: true,
    configurable: true,
    value: originalHeight,
  };

  Object.defineProperty(window, 'innerWidth', originalWidthConfig);
  Object.defineProperty(window, 'innerHeight', originalHeightConfig);

  return snapshots;
}

// ===========================================================================
// Accessibility Testing Utilities
// ===========================================================================

// Import and export accessibility testing helpers
export * from './a11y-helpers';

// Custom matcher for testing theme differences
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchThemeSnapshots: (_comparison: unknown) => R;
    }
  }
}

// Add the matcher to Jest's expect
expect.extend({
  toMatchThemeSnapshots(received, comparison) {
    const pass = received.cleanHtml !== comparison.cleanHtml;

    if (pass) {
      return {
        message: () => `Expected theme snapshots to be different and they are.`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected theme snapshots to be different, but they are the same.`,
        pass: false,
      };
    }
  },
});

// Export everything from testing library for convenience
export * from '@testing-library/react';
export { userEvent };
