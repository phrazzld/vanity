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
  },
  decorators: [ThemeDecorator],
};

export default preview;
