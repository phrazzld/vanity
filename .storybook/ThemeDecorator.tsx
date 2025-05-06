import React from 'react';
import { ThemeProvider } from '../src/app/context/ThemeContext';
import { useDarkMode } from 'storybook-dark-mode';
import { useEffect } from 'react';

export default {}
export const ThemeDecorator = (Story: React.ComponentType) => {
  const isDarkMode = useDarkMode();

  useEffect(() => {
    // Update the document class when the dark mode changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeProvider>
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
          <Story />
        </div>
      </div>
    </ThemeProvider>
  );
};
