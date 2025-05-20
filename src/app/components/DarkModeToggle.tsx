'use client';

import { useTheme } from '../context/ThemeContext';

export type DarkModeToggleProps = {
  /**
   * The size of the toggle button
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Additional CSS classes to apply to the button
   */
  className?: string;
  /**
   * Optional click handler
   * In most cases, you should let the component use the ThemeContext's toggleDarkMode
   */
  onClick?: () => void;
  /**
   * Force a specific mode (overrides ThemeContext)
   */
  forcedMode?: 'light' | 'dark';
};

export default function DarkModeToggle({
  size = 'medium',
  className = '',
  onClick,
  forcedMode,
}: DarkModeToggleProps) {
  const { isDarkMode: contextDarkMode, toggleDarkMode } = useTheme();

  // Use forcedMode if provided, otherwise use the context value
  const isDarkMode = forcedMode === undefined ? contextDarkMode : forcedMode === 'dark';

  // Determine icon size based on the size prop
  const iconSize = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
  }[size];

  // Determine button padding based on size
  const buttonPadding = {
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-2.5',
  }[size];

  // Base classes for the button
  const baseClasses =
    'dark-mode-toggle flex items-center justify-center bg-transparent rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800';

  return (
    <button
      className={`${baseClasses} ${buttonPadding} ${className}`}
      onClick={onClick || toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconSize}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconSize}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
