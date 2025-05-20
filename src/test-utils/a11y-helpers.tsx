import type { JestAxeConfigureOptions } from 'jest-axe';
import { axe } from 'jest-axe';
import type { ReactElement } from 'react';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/app/context/ThemeContext';

/**
 * Options for configuring the accessibility tests
 */
export interface A11yTestOptions {
  /**
   * Options to pass to axe-core
   */
  axeOptions?: JestAxeConfigureOptions;
  /**
   * Whether to log verbose output
   */
  verbose?: boolean;
}

/**
 * Checks a rendered component for accessibility violations
 *
 * @param ui The React component to test
 * @param options Optional axe configuration options
 * @returns A promise that resolves when the test is complete
 *
 * @example
 * test('component has no accessibility violations', async () => {
 *   await checkA11y(<Button>Click me</Button>);
 * });
 */
export async function checkA11y(ui: ReactElement, options: A11yTestOptions = {}): Promise<void> {
  const { axeOptions, verbose = false } = options;
  const container = render(ui);

  const results = await axe(container.container, axeOptions);

  if (verbose && results.violations.length > 0) {
    console.log(results.violations);
  }

  expect(results).toHaveNoViolations();
}

/**
 * Renders a component inside a ThemeProvider
 *
 * @param ui The component to render
 * @param isDarkMode Whether to use dark mode
 * @returns The rendered component
 */
function renderWithTheme(ui: ReactElement, isDarkMode = false): RenderResult {
  // Mock the ThemeContext value
  jest.doMock('@/app/context/ThemeContext', () => ({
    useTheme: () => ({
      isDarkMode,
      toggleDarkMode: jest.fn(),
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }));

  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

/**
 * Checks a component for accessibility violations in both light and dark mode
 *
 * @param ui The React component to test
 * @param options Optional axe configuration options
 * @returns A promise that resolves when both tests are complete
 *
 * @example
 * test('component has no accessibility violations in either theme', async () => {
 *   await checkA11yInBothThemes(<Button>Click me</Button>);
 * });
 */
export async function checkA11yInBothThemes(
  ui: ReactElement,
  options: A11yTestOptions = {}
): Promise<void> {
  // Test in light mode
  const lightContainer = renderWithTheme(ui, false);
  const lightResults = await axe(lightContainer.container, options.axeOptions);
  expect(lightResults).toHaveNoViolations();

  // Test in dark mode
  const darkContainer = renderWithTheme(ui, true);
  const darkResults = await axe(darkContainer.container, options.axeOptions);
  expect(darkResults).toHaveNoViolations();
}

/**
 * Checks a component for accessibility violations at different viewport sizes
 *
 * @param ui The React component to test
 * @param sizes The viewport sizes to test (default: mobile, tablet, desktop)
 * @param options Optional axe configuration options
 * @returns A promise that resolves when all tests are complete
 *
 * @example
 * test('component is accessible at all viewport sizes', async () => {
 *   await checkResponsiveA11y(<ResponsiveComponent />);
 * });
 */
export async function checkResponsiveA11y(
  ui: ReactElement,
  sizes: { name: string; width: number; height: number }[] = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ],
  options: A11yTestOptions = {}
): Promise<void> {
  // Original viewport dimensions
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;

  try {
    // Test each viewport size
    for (const size of sizes) {
      // Mock the viewport size
      Object.defineProperty(window, 'innerWidth', { value: size.width, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: size.height, writable: true });

      // Force a resize event
      window.dispatchEvent(new Event('resize'));

      // Render and test
      const container = render(ui);
      const results = await axe(container.container, options.axeOptions);

      if (options.verbose && results.violations.length > 0) {
        console.log(
          `Viewport ${size.name} (${size.width}x${size.height}) violations:`,
          results.violations
        );
      }

      expect(results).toHaveNoViolations();
    }
  } finally {
    // Restore original viewport dimensions
    Object.defineProperty(window, 'innerWidth', { value: originalWidth, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalHeight, writable: true });
    window.dispatchEvent(new Event('resize'));
  }
}

/**
 * Configurable rules for axe-core tests
 * These configs can be passed to the testing functions to customize the tests
 */
export const a11yRules = {
  /**
   * Basic rules suitable for most components
   */
  basic: {
    rules: {
      // Enable specific rules
      'button-name': { enabled: true },
      'color-contrast': { enabled: true },
      'document-title': { enabled: false }, // Often not relevant in component tests
      'html-has-lang': { enabled: false }, // Not relevant in component tests
      'landmark-one-main': { enabled: false }, // Not relevant in component tests
      'page-has-heading-one': { enabled: false }, // Not relevant in component tests
    },
  },

  /**
   * Rules focused on forms and inputs
   */
  forms: {
    rules: {
      label: { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'input-button-name': { enabled: true },
      'select-name': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
    },
  },

  /**
   * Rules for navigation and landmark elements
   */
  navigation: {
    rules: {
      region: { enabled: true },
      'landmark-banner-is-top-level': { enabled: true },
      'landmark-complementary-is-top-level': { enabled: true },
      'landmark-contentinfo-is-top-level': { enabled: true },
      'landmark-main-is-top-level': { enabled: true },
      'landmark-no-duplicate': { enabled: true },
      'landmark-unique': { enabled: true },
    },
  },
};
