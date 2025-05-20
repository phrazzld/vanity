import type { Preview } from '@storybook/react';
import { ThemeDecorator } from './ThemeDecorator';
import '../src/app/globals.css';

/**
 * Storybook preview configuration
 *
 * This file configures the global parameters and decorators for all stories.
 * The ThemeDecorator provides integration with the application's ThemeContext
 * and synchronizes it with Storybook's dark mode toggle.
 */
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a202c',
        },
      ],
    },
    nextjs: {
      appDirectory: true,
    },
    darkMode: {
      // Default light mode for Storybook UI
      current: 'light',
      // Apply dark mode to the preview iframe
      stylePreview: true,
      // Customize the dark/light toggles
      darkClass: 'dark',
      lightClass: 'light',
      // Class names applied to the preview body
      classTarget: 'html',
      // Menu button tooltips
      dark: { buttonToolTip: 'Toggle dark mode' },
      light: { buttonToolTip: 'Toggle light mode' },
    },
    /**
     * Accessibility (a11y) configurations
     * This section defines global accessibility testing parameters
     * that will be applied to all stories by default
     */
    a11y: {
      // Axe-core configuration options
      config: {
        // Rules with their level of importance
        rules: [
          {
            // Ensures all page content is contained by landmarks
            id: 'region',
            enabled: false, // Disabled in Storybook context
          },
          {
            // Ensures that ARIA attributes have valid values
            id: 'aria-valid-attr-value',
            enabled: true,
          },
          {
            // Ensures that ARIA attributes are valid
            id: 'aria-valid-attr',
            enabled: true,
          },
          {
            // Ensures all elements with a role attribute have the required ARIA attributes
            id: 'aria-required-attr',
            enabled: true,
          },
          {
            // Ensures that when an element has an ARIA role, all required states & properties are present
            id: 'aria-required-children',
            enabled: true,
          },
          {
            // Ensures buttons have discernible text
            id: 'button-name',
            enabled: true,
          },
          {
            // Ensures <img> elements have alternate text or a role of none or presentation
            id: 'image-alt',
            enabled: true,
          },
          {
            // Ensures form elements have labels
            id: 'label',
            enabled: true,
          },
          {
            // Ensures links have discernible text
            id: 'link-name',
            enabled: true,
          },
          {
            // Ensures the contrast between foreground and background colors meets WCAG 2 AA
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
      // Optional manual checks that maintainers should perform
      manual: [
        {
          description: 'Ensure keyboard navigation works logically and intuitively',
          items: ['Tab order follows a natural reading flow', 'Focus states are clearly visible'],
        },
        {
          description: 'Test with screen readers',
          items: ['VoiceOver on macOS/iOS', 'NVDA or JAWS on Windows', 'TalkBack on Android'],
        },
        {
          description: 'Supports reduced motion preferences',
          items: ['Animations can be disabled', 'No content relies solely on animation'],
        },
      ],
      // Options for the accessibility panel itself
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa'], // WCAG 2.1 AA compliance
        },
      },
    },
  },
  decorators: [ThemeDecorator],
};

export default preview;
