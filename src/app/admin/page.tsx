'use client';

/**
 * Admin Dashboard Page
 *
 * This is the main page for the admin dashboard.
 * It's protected by our middleware.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { logger, createLogContext } from '@/lib/logger';

type User = {
  name: string;
  email: string;
  role: string;
};

// SVG icons for dashboard cards
const dashboardIcons = {
  readings: (
    <svg
      className="w-8 h-8 text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
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
  ),
  quotes: (
    <svg
      className="w-8 h-8 text-green-500"
      xmlns="http://www.w3.org/2000/svg"
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
  ),
};

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    readings: 0,
    quotes: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch session data
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = (await sessionRes.json()) as {
          isAuthenticated?: boolean;
          user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string | null;
          };
        };

        if (sessionData.isAuthenticated && sessionData.user) {
          setUser({
            name: sessionData.user.name || '',
            email: sessionData.user.email || '',
            role: sessionData.user.role || 'user',
          });
        }

        // Fetch stats data
        const [readingsRes, quotesRes] = await Promise.all([
          fetch('/api/readings'),
          fetch('/api/quotes'),
        ]);

        const readingsData = (await readingsRes.json()) as unknown[];
        const quotesData = (await quotesRes.json()) as unknown[];

        setStats({
          readings: Array.isArray(readingsData) ? readingsData.length : 0,
          quotes: Array.isArray(quotesData) ? quotesData.length : 0,
        });
      } catch (error) {
        logger.error(
          'Failed to fetch dashboard data',
          createLogContext('admin/dashboard', 'fetchData', {
            error_type: error instanceof Error ? error.constructor.name : 'Unknown',
            has_user: !!user,
          }),
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Define dashboard cards inside the component to access state
  const dashboardCards = [
    {
      title: 'Readings Management',
      description: 'Add, edit, or delete readings in the database.',
      link: '/admin/readings',
      color: 'blue',
      icon: dashboardIcons.readings,
      ctaText: 'Manage Readings',
      count: stats.readings,
    },
    {
      title: 'Quotes Management',
      description: 'Add, edit, or delete quotes in the database.',
      link: '/admin/quotes',
      color: 'green',
      icon: dashboardIcons.quotes,
      ctaText: 'Manage Quotes',
      count: stats.quotes,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome{user ? `, ${user.name}` : ''}! Manage your content here.
        </p>
      </div>

      {/* Content Cards */}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Readings Stats Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-xl border border-gray-100 dark:border-gray-700 transition hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3">
                <svg
                  className="h-7 w-7 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
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
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Readings
                </dt>
                <dd className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats.readings}
                </dd>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Link
                href="/admin/readings"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center text-sm"
              >
                View all readings
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Quotes Stats Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-xl border border-gray-100 dark:border-gray-700 transition hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-lg p-3">
                <svg
                  className="h-7 w-7 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
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
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Quotes
                </dt>
                <dd className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : stats.quotes}
                </dd>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Link
                href="/admin/quotes"
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 flex items-center text-sm"
              >
                View all quotes
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* User Status Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-xl border border-gray-100 dark:border-gray-700 transition hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-3">
                <svg
                  className="h-7 w-7 text-indigo-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Account Status
                </dt>
                <dd className="mt-1 flex flex-col">
                  <div className="flex items-center">
                    <span className="h-2.5 w-2.5 bg-green-400 rounded-full mr-2"></span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Active as {user?.role || 'Admin'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Last login: {new Date().toLocaleString()}
                  </div>
                </dd>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <svg
                  className="mr-1.5 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {user?.email || 'admin@example.com'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Management Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Content Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardCards.map((card, index) => {
            // Simple color mapping for each card
            const bgColor = card.color === 'blue' ? 'bg-blue-50' : 'bg-green-50';
            const buttonColor =
              card.color === 'blue'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700';
            const ringColor =
              card.color === 'blue' ? 'focus:ring-blue-500' : 'focus:ring-green-500';

            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${bgColor} rounded-lg p-3`}>{card.icon}</div>
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                      {isLoading ? '...' : card.count}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {card.description}
                  </p>
                  <Link
                    href={card.link}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 ${ringColor} transition-colors w-full justify-center`}
                  >
                    {card.ctaText}
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
