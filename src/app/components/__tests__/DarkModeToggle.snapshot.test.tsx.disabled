/**
 * DarkModeToggle Component Snapshot Tests
 *
 * This file demonstrates snapshot testing patterns for the DarkModeToggle component.
 * It tests various component states, sizes, and themes.
 */

import { createComponentSnapshot } from '@/test-utils';
import DarkModeToggle from '../DarkModeToggle';

describe('DarkModeToggle Component Snapshots', () => {
  describe('Size Variants', () => {
    it('renders in different sizes', () => {
      const sizes = ['small', 'medium', 'large'] as const;

      sizes.forEach(size => {
        const { cleanHtml } = createComponentSnapshot(<DarkModeToggle size={size} />);

        expect(cleanHtml).toMatchSnapshot(`size: ${size}`);
      });
    });
  });

  describe('Theme Variants', () => {
    it('renders light and dark mode icons correctly', () => {
      // Test with forced light mode
      const lightRender = createComponentSnapshot(<DarkModeToggle forcedMode="light" />);

      // Test with forced dark mode
      const darkRender = createComponentSnapshot(<DarkModeToggle forcedMode="dark" />);

      // Verify toggle shows different icons for light/dark
      expect(lightRender).toMatchThemeSnapshots(darkRender);

      // Also snapshot each theme
      expect(lightRender.cleanHtml).toMatchSnapshot('light mode icon');
      expect(darkRender.cleanHtml).toMatchSnapshot('dark mode icon');
    });

    it('renders correctly within light and dark themes', () => {
      // Test within light theme context
      const lightThemeRender = createComponentSnapshot(<DarkModeToggle />, { themeMode: 'light' });

      // Test within dark theme context
      const darkThemeRender = createComponentSnapshot(<DarkModeToggle />, { themeMode: 'dark' });

      expect(lightThemeRender.cleanHtml).toMatchSnapshot('within light theme');
      expect(darkThemeRender.cleanHtml).toMatchSnapshot('within dark theme');
    });
  });

  describe('Custom Classes', () => {
    it('renders with custom class names', () => {
      const { cleanHtml } = createComponentSnapshot(
        <DarkModeToggle className="custom-class-1 custom-class-2" />
      );

      expect(cleanHtml).toMatchSnapshot();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label for light and dark modes', () => {
      // Create snapshots for both modes
      const lightAriaRender = createComponentSnapshot(<DarkModeToggle forcedMode="light" />);

      const darkAriaRender = createComponentSnapshot(<DarkModeToggle forcedMode="dark" />);

      // Verify the light mode aria-label contains the right text
      expect(lightAriaRender.cleanHtml).toContain('aria-label="Switch to dark mode"');

      // Verify the dark mode aria-label contains the right text
      expect(darkAriaRender.cleanHtml).toContain('aria-label="Switch to light mode"');

      // Save snapshots for reference
      expect(lightAriaRender.cleanHtml).toMatchSnapshot('light mode aria-label');
      expect(darkAriaRender.cleanHtml).toMatchSnapshot('dark mode aria-label');
    });
  });
});
