import type { Meta, StoryObj } from '@storybook/react';
import DarkModeToggle from './DarkModeToggle';

const meta: Meta<typeof DarkModeToggle> = {
  title: 'Components/DarkModeToggle',
  component: DarkModeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A toggle button that switches between light and dark modes. This component uses the ThemeContext to determine the current mode and to toggle between modes.',
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
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - initial state depends on Storybook's dark mode setting
export const Default: Story = {
  args: {},
};

// Light mode story - forces the story to render in light mode
export const LightMode: Story = {
  args: {},
  parameters: {
    darkMode: {
      current: 'light',
    },
  },
};

// Dark mode story - forces the story to render in dark mode
export const DarkMode: Story = {
  args: {},
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};
