'use client';

/**
 * MobileNav Component
 *
 * A slide-in navigation drawer for mobile viewports with:
 * - Smooth slide animation from the left
 * - Semi-transparent overlay backdrop
 * - Focus trap for accessibility
 * - Multiple close mechanisms (X button, ESC key, overlay click, navigation)
 * - Auto-close on route changes
 */

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFocusTrap } from '@/hooks/keyboard/useFocusTrap';

export interface MobileNavProps {
  /** Whether the drawer is open */
  isOpen: boolean;

  /** Callback when drawer should close */
  onClose: () => void;

  /** Navigation links to display */
  navLinks: Array<{
    href: string;
    label: string;
  }>;

  /** Additional CSS classes for the drawer */
  className?: string;
}

const MobileNav = React.memo(function MobileNav({
  isOpen,
  onClose,
  navLinks,
  className = '',
}: MobileNavProps) {
  const pathname = usePathname();

  // Create focus trap for the drawer when open
  const drawerRef = useFocusTrap({
    enabled: isOpen,
    initialFocus: true,
    returnFocusOnUnmount: true,
    onEscape: onClose,
  });

  /**
   * Auto-close drawer on route navigation
   *
   * CRITICAL: Do NOT include `isOpen` in dependency array!
   * - Including it would cause the drawer to close immediately when opened
   * - We only want to close on pathname changes (user navigating to a new page)
   * - Use ref pattern to detect actual pathname changes, not re-renders
   */
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // Pathname has changed - user navigated to a new page
      onClose();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Helper to determine if a link is active
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="mobile-nav-overlay fixed inset-0 bg-black/50 z-modal animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        ref={drawerRef}
        id="mobile-navigation"
        className={`mobile-nav-drawer fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-overlay shadow-2xl animate-slide-in-left ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-end p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Close navigation menu"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <ul className="flex flex-col p-4 space-y-2">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                data-active={isActive(href)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
});

export default MobileNav;
