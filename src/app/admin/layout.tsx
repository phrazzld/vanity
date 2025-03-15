'use client';

/**
 * Admin Layout
 * 
 * This layout wraps all admin-related pages and provides:
 * - Consistent UI structure for the admin section
 * - Navigation menu for admin features
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
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
    return `flex items-center px-4 py-2 text-sm ${
      isActive
        ? "bg-indigo-50 text-indigo-700 font-medium border-l-4 border-indigo-500"
        : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
    }`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-gray-800 hover:text-indigo-600">
            <h1 className="text-lg font-semibold">Vanity Admin</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-indigo-600"
            >
              View Site
            </Link>
            
            {isAuthenticated && (
              <Link
                href="/api/auth/signout"
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-grow flex">
        {/* Side navigation - only show for authenticated users and not on login page */}
        {isAuthenticated && pathname !== '/admin/login' && (
          <aside className="w-64 bg-white shadow-sm border-r hidden md:block">
            <nav className="mt-5 px-2">
              <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dashboard
              </div>
              <Link href="/admin" className={getNavItemClasses("/admin")}>
                <svg
                  className="mr-3 h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Overview
              </Link>

              <div className="mt-8 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Content
              </div>
              <Link
                href="/admin/readings"
                className={getNavItemClasses("/admin/readings")}
              >
                <svg
                  className="mr-3 h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Readings
              </Link>
              <Link
                href="/admin/quotes"
                className={getNavItemClasses("/admin/quotes")}
              >
                <svg
                  className="mr-3 h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Quotes
              </Link>
            </nav>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            Admin Dashboard &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}