import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// Create a wrapper for testing Tailwind classes
const TailwindTest = () => {
  return React.createElement(
    'div',
    { className: 'p-4' },
    React.createElement(
      'h1',
      { className: 'text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4' },
      'Tailwind CSS Test'
    ),
    React.createElement(
      'p',
      { className: 'text-gray-800 dark:text-gray-200 mb-4' },
      'This component is used to verify that Tailwind CSS classes are working correctly in Storybook.'
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-4' },
      React.createElement(
        'div',
        { className: 'bg-gray-100 dark:bg-gray-800 p-4 rounded shadow' },
        React.createElement(
          'h2',
          { className: 'text-xl font-semibold text-gray-900 dark:text-white' },
          'Box 1'
        ),
        React.createElement(
          'p',
          { className: 'text-gray-700 dark:text-gray-300' },
          'Testing background, text colors, and spacing.'
        )
      ),
      React.createElement(
        'div',
        { className: 'bg-blue-100 dark:bg-blue-900 p-4 rounded shadow' },
        React.createElement(
          'h2',
          { className: 'text-xl font-semibold text-blue-800 dark:text-blue-200' },
          'Box 2'
        ),
        React.createElement(
          'p',
          { className: 'text-blue-700 dark:text-blue-300' },
          'Testing additional color variants.'
        )
      )
    ),
    React.createElement(
      'button',
      {
        className:
          'mt-4 px-4 py-2 bg-blue-600 text-white dark:bg-blue-700 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition duration-200',
      },
      'Test Button'
    )
  );
};

const meta: Meta = {
  title: 'Tests/TailwindTest',
  component: TailwindTest,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A test component to verify Tailwind CSS integration.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const DarkMode: Story = {
  args: {},
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};
