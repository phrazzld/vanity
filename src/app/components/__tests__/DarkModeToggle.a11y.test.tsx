/**
 * DarkModeToggle Component Accessibility Tests
 *
 * This file demonstrates how to use axe-core for testing component accessibility.
 * It serves as an example for how to implement accessibility testing for other components.
 */

import { render } from '@testing-library/react';
import DarkModeToggle from '../DarkModeToggle';
import { axe } from 'jest-axe';
import { checkA11y, checkA11yInBothThemes, a11yRules } from '@/test-utils/a11y-helpers';

describe('DarkModeToggle Accessibility', () => {
  it('has no accessibility violations in basic rendering', async () => {
    // Basic axe test using the jest-axe directly
    const { container } = render(<DarkModeToggle />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in all size variants', async () => {
    // Using our helper function to simplify testing
    await checkA11y(<DarkModeToggle size="small" />);
    await checkA11y(<DarkModeToggle size="medium" />);
    await checkA11y(<DarkModeToggle size="large" />);
  });

  it('has no accessibility violations in both light and dark modes', async () => {
    // Test in both theme modes
    await checkA11y(<DarkModeToggle forcedMode="light" />);
    await checkA11y(<DarkModeToggle forcedMode="dark" />);
  });

  it('passes accessibility checks with custom configuration', async () => {
    // Using custom axe configuration rules
    await checkA11y(<DarkModeToggle />, {
      axeOptions: a11yRules.basic,
      verbose: true,
    });
  });

  it('passes accessibility checks in both themes with one helper', async () => {
    // Using helper to test both themes at once
    await checkA11yInBothThemes(<DarkModeToggle />);
  });
});
