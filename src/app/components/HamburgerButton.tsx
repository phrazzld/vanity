'use client';

/**
 * HamburgerButton Component
 *
 * An animated hamburger menu button that transforms into an X icon.
 * Designed for mobile navigation with:
 * - Smooth CSS-based animation (GPU-accelerated)
 * - Minimum 44x44px touch target (WCAG 2.1 AAA)
 * - Full accessibility support (ARIA attributes)
 * - Theme-aware styling
 */

import React from 'react';

export interface HamburgerButtonProps {
  /** Whether the menu is currently open (affects icon state) */
  isOpen: boolean;

  /** Click handler for the button */
  onClick: () => void;

  /** Additional CSS classes */
  className?: string;
}

const HamburgerButton = React.memo(function HamburgerButton({
  isOpen,
  onClick,
  className = '',
}: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation"
    >
      <div className="w-6 h-5 relative flex flex-col justify-center">
        {/* Top line */}
        <span
          className={`absolute w-full h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
          }`}
        />

        {/* Middle line */}
        <span
          className={`absolute w-full h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Bottom line */}
        <span
          className={`absolute w-full h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 ease-in-out ${
            isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
          }`}
        />
      </div>
    </button>
  );
});

export default HamburgerButton;
