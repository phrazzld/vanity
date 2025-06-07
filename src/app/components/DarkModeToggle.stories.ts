/**
 * LOGGING EXEMPTION: Console usage in this file is intentionally preserved.
 * Storybook stories use console.log for developer interaction and demonstration
 * purposes. This is part of the intended developer experience.
 * See: edge-cases-decisions.md
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import DarkModeToggle from './DarkModeToggle';

const meta: Meta<typeof DarkModeToggle> = {
  title: 'Components/DarkModeToggle',
  component: DarkModeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A toggle button that switches between light and dark modes. This component uses the ThemeContext to determine the current mode and to toggle between modes.

## Features
- Adapts to both light and dark modes automatically
- Supports different sizes (small, medium, large)
- Fully accessible with proper ARIA attributes
- Customizable with additional CSS classes

## Usage
\`\`\`tsx
// Basic usage
<DarkModeToggle />

// With custom size
<DarkModeToggle size="large" />

// With custom styling
<DarkModeToggle className="shadow-lg" />

// With forced mode (for testing purposes)
<DarkModeToggle forcedMode="dark" />

// With custom click handler
<DarkModeToggle onClick={() => console.log('Custom handler')} />
\`\`\`

## Accessibility
The button includes proper ARIA labels that change based on the current mode state.
`,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the toggle button',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the button',
    },
    onClick: {
      action: 'clicked',
      description: 'Optional click handler (will override ThemeContext toggle)',
    },
    forcedMode: {
      control: 'select',
      options: [undefined, 'light', 'dark'],
      description: 'Force a specific mode (overrides ThemeContext)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - initial state depends on Storybook's dark mode setting
export const Default: Story = {
  args: {},
};

// Light mode story - forces the story to render in light mode
export const LightMode: Story = {
  args: {
    forcedMode: 'light',
  },
};

// Dark mode story - forces the story to render in dark mode
export const DarkMode: Story = {
  args: {
    forcedMode: 'dark',
  },
};

// Size variants
export const Sizes: Story = {
  // Note: We can't use JSX in .ts files, so we use React.createElement
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex gap-4 items-center' },
      React.createElement(DarkModeToggle, { size: 'small' }),
      React.createElement(DarkModeToggle, { size: 'medium' }),
      React.createElement(DarkModeToggle, { size: 'large' })
    );
  },
};

// Size variants in dark mode
export const SizesDarkMode: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex gap-4 items-center' },
      React.createElement(DarkModeToggle, { size: 'small', forcedMode: 'dark' }),
      React.createElement(DarkModeToggle, { size: 'medium', forcedMode: 'dark' }),
      React.createElement(DarkModeToggle, { size: 'large', forcedMode: 'dark' })
    );
  },
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};

// With custom styling
export const CustomStyling: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-4' },
      React.createElement(DarkModeToggle, { className: 'shadow-md' }),
      React.createElement(DarkModeToggle, {
        className: 'border border-gray-300 dark:border-gray-700',
      }),
      React.createElement(DarkModeToggle, { className: 'bg-gray-100 dark:bg-gray-800' }),
      React.createElement(DarkModeToggle, { className: 'hover:bg-blue-100 dark:hover:bg-blue-900' })
    );
  },
};

// Interactive version with click handler
export const Interactive: Story = {
  args: {
    forcedMode: 'light',
    onClick: () => {
      console.log('Toggle clicked');
    },
  },
};

// Accessibility version with focus styling
export const WithA11yFocus: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-4 items-center' },
      React.createElement(
        'p',
        { className: 'text-sm text-gray-600 dark:text-gray-400' },
        'Tab to focus this button to see the focus ring'
      ),
      React.createElement(DarkModeToggle, {
        className: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
      })
    );
  },
};
