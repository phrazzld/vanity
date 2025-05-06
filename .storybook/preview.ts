import type { Preview } from '@storybook/react';
import { ThemeDecorator } from './ThemeDecorator';
import '../src/app/globals.css';

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
      current: 'light',
      stylePreview: true,
    },
  },
  decorators: [ThemeDecorator],
};

export default preview;
