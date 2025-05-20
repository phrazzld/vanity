import React from 'react';
import { ThemeContext } from '../src/app/context/ThemeContext';
import { useDarkMode } from 'storybook-dark-mode';
import { useEffect, useCallback } from 'react';

/**
 * A custom ThemeProvider specifically for Storybook that wraps components in a ThemeContext.Provider
 * This allows us to sync the app's theme context with Storybook's dark mode toggle
 */
export default {};

export const ThemeDecorator = (Story: React.ComponentType) => {
  // Get the dark mode state from Storybook
  const isDarkMode = useDarkMode();

  // Create a function to toggle dark mode in Storybook
  // (This isn't used directly in this code but is provided to components via context)
  const toggleDarkMode = useCallback(() => {
    // The actual toggle is handled by Storybook's dark mode addon
    // This is a placeholder function that components can call
    console.log('toggleDarkMode was called from a component');
    // In a real Storybook environment, we can't directly toggle Storybook's state
    // Components should work without actually changing the state
  }, []);

  // Update the document class when the dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Create a value for the ThemeContext that uses Storybook's dark mode state
  const themeContextValue = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    // Provide the theme context with values synced to Storybook's dark mode
    <ThemeContext.Provider value={themeContextValue}>
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
          <Story />
        </div>
      </div>
    </ThemeContext.Provider>
  );
};
