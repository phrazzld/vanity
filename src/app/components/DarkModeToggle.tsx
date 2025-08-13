'use client';

import React, { useState, useEffect, useRef } from 'react';
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

const DarkModeToggle = React.memo(function DarkModeToggle({
  size = 'medium',
  className = '',
  onClick,
  forcedMode,
}: DarkModeToggleProps) {
  const { isDarkMode: contextDarkMode, toggleDarkMode } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  /**
   * Animation State Management
   *
   * The component uses a multi-layered animation system:
   * 1. isAnimating: Tracks whether the toggle animation is currently running
   *    - Prevents spam clicking during the 200ms animation duration
   *    - Triggers the subtle scale pulse animation when true
   *
   * 2. hasBeenVisible: Lazy-loads animations using Intersection Observer
   *    - Defers animation classes until component is visible in viewport
   *    - Improves initial page load performance by avoiding unnecessary GPU acceleration
   *    - Once visible, animations are permanently enabled
   *
   * 3. GPU Acceleration: Uses transform-gpu class after visibility
   *    - Forces GPU acceleration for smoother 60fps animations
   *    - Only applied after component has been seen to reduce memory usage
   *
   * Animation Flow:
   * - User clicks → isAnimating = true → icon scales down and back with subtle pulse
   * - After 200ms → isAnimating = false → ready for next interaction
   * - Theme transition CSS handles color/background changes separately (300ms)
   */
  const [isAnimating, setIsAnimating] = useState(false);
  const handleToggle = () => {
    if (isAnimating) return; // Prevent spam clicking
    setIsAnimating(true);
    (onClick || toggleDarkMode)();
    setTimeout(() => setIsAnimating(false), 200);
  };

  // Intersection observer to defer animations until visible
  useEffect(() => {
    if (!buttonRef.current || hasBeenVisible) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setHasBeenVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(buttonRef.current);

    return () => observer.disconnect();
  }, [hasBeenVisible]);

  // Preload both icon states to prevent flicker
  useEffect(() => {
    // Create hidden elements to force browser to parse both SVGs
    const preloadContainer = document.createElement('div');
    preloadContainer.style.position = 'absolute';
    preloadContainer.style.width = '0';
    preloadContainer.style.height = '0';
    preloadContainer.style.overflow = 'hidden';
    preloadContainer.setAttribute('aria-hidden', 'true');

    // Sun icon
    const sunSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sunSvg.innerHTML =
      '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';

    // Moon icon
    const moonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    moonSvg.innerHTML =
      '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';

    preloadContainer.appendChild(sunSvg);
    preloadContainer.appendChild(moonSvg);
    document.body.appendChild(preloadContainer);

    return () => {
      if (preloadContainer.parentNode) {
        document.body.removeChild(preloadContainer);
      }
    };
  }, []);

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
    'dark-mode-toggle relative flex items-center justify-center bg-transparent rounded-full ' +
    'transition-all duration-300 ease-elegant-entrance ' +
    'hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md hover:scale-105 ' +
    'active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${buttonPadding} ${className}`}
      onClick={handleToggle}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {isDarkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${iconSize} ${hasBeenVisible && isAnimating ? 'animate-icon-switch' : ''} text-yellow-500 ${hasBeenVisible ? 'transform-gpu' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <defs>
              <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              fill="url(#sun-gradient)"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${iconSize} ${hasBeenVisible && isAnimating ? 'animate-icon-switch' : ''} text-slate-700 dark:text-slate-300 ${hasBeenVisible ? 'transform-gpu' : ''}`}
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
      </div>
    </button>
  );
});

export default DarkModeToggle;
