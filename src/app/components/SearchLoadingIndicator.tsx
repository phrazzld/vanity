'use client';

/**
 * SearchLoadingIndicator Component
 * 
 * A subtle loading indicator specifically for search operations.
 * Displays a pulsing animation in the search area to indicate activity.
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface SearchLoadingIndicatorProps {
  /**
   * Whether the search is currently loading
   */
  isLoading: boolean;
  
  /**
   * Optional class name for custom styling
   */
  className?: string;
}

export default function SearchLoadingIndicator({ isLoading, className = '' }: SearchLoadingIndicatorProps) {
  const { isDarkMode } = useTheme();
  const [visible, setVisible] = useState(false);
  
  // Add a small delay before showing the indicator to prevent flickering
  // for very quick operations
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        setVisible(true);
      }, 300); // 300ms delay before showing
    } else {
      setVisible(false);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading]);
  
  if (!visible) return null;
  
  return (
    <div 
      className={`
        inline-flex items-center py-1 px-3 text-xs rounded-full
        text-blue-800 dark:text-blue-300
        bg-blue-100 dark:bg-blue-900/30
        transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      <svg 
        className="animate-spin -ml-0.5 mr-2 h-3 w-3 text-blue-600 dark:text-blue-400" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Searching...
    </div>
  );
}