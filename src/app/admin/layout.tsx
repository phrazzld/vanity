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
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    return `flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col admin-layout">
      {/* Top navigation bar */}
      <header className="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and mobile menu button */}
            <div className="flex items-center">
              {isAuthenticated && pathname !== '/admin/login' && (
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="mr-2 md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                  {isMobileMenuOpen ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              )}
              <Link href="/admin" className="text-gray-800 hover:text-blue-600 flex items-center group">
                <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 h-8 w-8 rounded-lg mr-2 group-hover:shadow-md transition-all">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">Admin</h1>
              </Link>
            </div>
            
            {/* Right side links */}
            <nav className="flex items-center space-x-3">

              <Link
                href="/"
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 flex items-center transition-colors sm:px-3 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">View Site</span>
              </Link>
              
              {isAuthenticated && (
                <Link
                  href="/api/auth/signout"
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100 flex items-center transition-colors sm:px-3 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="h-5 w-5 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile menu, show/hide based on menu state */}
      {isAuthenticated && pathname !== '/admin/login' && isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg" id="mobile-menu">
          <nav className="px-4 py-3 space-y-1.5">
            <Link href="/admin" className={`${getNavItemClasses("/admin")} group`}>
              <svg className="mr-3 h-5 w-5 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link href="/admin/readings" className={`${getNavItemClasses("/admin/readings")} group`}>
              <svg className="mr-3 h-5 w-5 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Readings
            </Link>
            <Link href="/admin/quotes" className={`${getNavItemClasses("/admin/quotes")} group`}>
              <svg className="mr-3 h-5 w-5 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Quotes
            </Link>
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link href="/api/auth/signout" className="flex items-center px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50">
                <svg className="mr-3 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </Link>
            </div>
          </nav>
        </div>
      )}

      <div className="flex-grow flex">
        {/* Side navigation - only show for authenticated users and not on login page */}
        {isAuthenticated && pathname !== '/admin/login' && (
          <aside className="w-64 bg-white shadow-sm border-r hidden md:block">
            <div className="h-full flex flex-col py-6">
              <div className="px-5 mb-6">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">DASHBOARD</span>
              </div>
              
              <nav className="flex-1 px-3 space-y-1">
                <div className="mb-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Main
                </div>
                <Link href="/admin" className={`${getNavItemClasses("/admin")} group transition-all`}>
                  <svg
                    className="mr-3 h-5 w-5 group-hover:text-blue-600 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <div className="mt-8 mb-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </div>
                <Link
                  href="/admin/readings"
                  className={`${getNavItemClasses("/admin/readings")} group transition-all flex justify-between items-center`}
                >
                  <div className="flex items-center">
                    <svg
                      className="mr-3 h-5 w-5 group-hover:text-blue-600 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>Readings</span>
                  </div>
                  {pathname === "/admin/readings" && (
                    <span className="px-2 text-xs py-0.5 rounded-full bg-blue-100 text-blue-800">
                      View
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/quotes"
                  className={`${getNavItemClasses("/admin/quotes")} group transition-all flex justify-between items-center`}
                >
                  <div className="flex items-center">
                    <svg
                      className="mr-3 h-5 w-5 group-hover:text-blue-600 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <span>Quotes</span>
                  </div>
                  {pathname === "/admin/quotes" && (
                    <span className="px-2 text-xs py-0.5 rounded-full bg-blue-100 text-blue-800">
                      View
                    </span>
                  )}
                </Link>
                
              </nav>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-3 md:mb-0">
              <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 h-6 w-6 rounded-md mr-2">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500">
                Admin Dashboard &copy; {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}