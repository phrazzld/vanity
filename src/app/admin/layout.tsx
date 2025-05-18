'use client';

/**
 * Admin Layout
 *
 * This layout wraps all admin-related pages and provides:
 * - Consistent UI structure for the admin section
 * - Navigation menu for admin features
 * - Dark mode support
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import './admin.css';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode: _isDarkMode } = useTheme();

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session');
        // Define the expected response type
        interface SessionResponse {
          isAuthenticated: boolean;
          user?: {
            name: string;
            email: string;
            role: string;
          };
          expires?: string;
        }

        // Parse with type safety
        const data = (await response.json()) as SessionResponse;
        setIsAuthenticated(data.isAuthenticated || false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    }

    if (pathname !== '/admin/login') {
      checkAuth();
    } else {
      setIsAuthenticated(false);
    }
  }, [pathname]);

  // Generate nav item classes based on active state
  const getNavItemClasses = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
    }`;
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col admin-layout">
      {/* Top navigation bar */}
      <header className="admin-header bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and mobile menu button */}
            <div className="flex items-center">
              {isAuthenticated && pathname !== '/admin/login' && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="mr-2 md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                  {isMobileMenuOpen ? (
                    <svg
                      className="h-6 w-6"
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
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              )}
              <Link
                href="/admin"
                className="text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
              >
                <svg
                  className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h1 className="text-lg font-semibold">Admin</h1>
              </Link>
            </div>

            {/* Right side links */}
            <nav className="flex items-center space-x-3">
              <Link
                href="/"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                View Site
              </Link>

              {isAuthenticated && (
                <Link
                  href="/api/auth/signout"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  Sign Out
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isAuthenticated && pathname !== '/admin/login' && isMobileMenuOpen && (
        <div
          className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow dark:shadow-gray-900/50"
          id="mobile-menu"
        >
          <nav className="px-4 py-2 space-y-1">
            <Link href="/admin" className={getNavItemClasses('/admin')}>
              Dashboard
            </Link>
            <Link href="/admin/readings" className={getNavItemClasses('/admin/readings')}>
              Readings
            </Link>
            <Link href="/admin/quotes" className={getNavItemClasses('/admin/quotes')}>
              Quotes
            </Link>
          </nav>
        </div>
      )}

      <div className="flex-grow flex">
        {/* Side navigation - only show for authenticated users and not on login page */}
        {isAuthenticated && pathname !== '/admin/login' && (
          <aside className="w-56 bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50 border-r border-gray-200 dark:border-gray-700 hidden md:block">
            <div className="h-full flex flex-col py-4">
              <nav className="flex-1 px-4 space-y-1">
                <Link href="/admin" className={getNavItemClasses('/admin')}>
                  <span>Dashboard</span>
                </Link>
                <Link href="/admin/readings" className={getNavItemClasses('/admin/readings')}>
                  <span>Readings</span>
                </Link>
                <Link href="/admin/quotes" className={getNavItemClasses('/admin/quotes')}>
                  <span>Quotes</span>
                </Link>
              </nav>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin Dashboard &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
