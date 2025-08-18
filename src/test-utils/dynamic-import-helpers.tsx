/**
 * Test helpers for Next.js dynamic imports
 *
 * These utilities help test components that use Next.js dynamic()
 * for code splitting and lazy loading.
 */

import React from 'react';
import { waitFor } from '@testing-library/react';
import preloadAll from 'jest-next-dynamic';

/**
 * Preload all dynamic imports before running tests
 * Call this in beforeAll() hooks for test suites that use dynamic imports
 */
export async function preloadDynamicImports(): Promise<void> {
  await preloadAll();
}

/**
 * Wait for a dynamic component to load and render
 * Useful when testing components that show loading states
 */
export async function waitForDynamicComponent(
  getElement: () => HTMLElement | null,
  options?: { timeout?: number }
): Promise<void> {
  await waitFor(
    () => {
      const element = getElement();
      expect(element).toBeInTheDocument();
    },
    { timeout: options?.timeout || 5000 }
  );
}

/**
 * Mock for next/dynamic that immediately renders the component
 * without async loading behavior - useful for unit tests
 */
export function createSyncDynamicMock() {
  return jest.fn().mockImplementation((importFunc: () => Promise<any>, _options?: any) => {
    // If there's a loading component, we'll ignore it for sync tests
    // Return a component that renders immediately
    const Component = jest.fn().mockImplementation((props: any) => {
      const MockComponent = require(
        importFunc.toString().match(/import\(['"](.+)['"]\)/)?.[1] || ''
      );
      return MockComponent.default ? MockComponent.default(props) : MockComponent(props);
    });

    return Component;
  });
}

/**
 * Mock for next/dynamic that simulates async loading
 * Provides better control over loading states in tests
 */
export function createAsyncDynamicMock() {
  return jest.fn().mockImplementation((importFunc: () => Promise<any>, options?: any) => {
    const LoadingComponent = options?.loading || (() => null);

    return function MockDynamicComponent(props: any) {
      const [isLoading, setIsLoading] = React.useState(true);
      const [Component, setComponent] = React.useState<any>(null);

      React.useEffect(() => {
        // Simulate async import
        void importFunc().then(module => {
          setComponent(() => module.default || module);
          setIsLoading(false);
        });
      }, []);

      if (isLoading) {
        return <LoadingComponent />;
      }

      return Component ? <Component {...props} /> : null;
    };
  });
}
