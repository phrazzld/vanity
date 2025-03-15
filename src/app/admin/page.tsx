'use client';

/**
 * Admin Dashboard Page
 * 
 * This is the main page for the admin dashboard.
 * It's protected by our middleware.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

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
  )
};

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    readings: 0,
    quotes: 0
  });
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch session data
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        
        if (sessionData.isAuthenticated && sessionData.user) {
          setUser(sessionData.user);
        }
        
        // Fetch stats data
        const [readingsRes, quotesRes] = await Promise.all([
          fetch('/api/readings'),
          fetch('/api/quotes')
        ]);
        
        const readingsData = await readingsRes.json();
        const quotesData = await quotesRes.json();
        
        setStats({
          readings: Array.isArray(readingsData) ? readingsData.length : 0,
          quotes: Array.isArray(quotesData) ? quotesData.length : 0
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Define dashboard cards inside the component to access state
  const dashboardCards = [
    {
      title: "Readings Management",
      description: "Add, edit, or delete readings in the database.",
      link: "/admin/readings",
      color: "blue",
      icon: dashboardIcons.readings,
      ctaText: "Manage Readings",
      count: stats.readings
    },
    {
      title: "Quotes Management",
      description: "Add, edit, or delete quotes in the database.",
      link: "/admin/quotes",
      color: "green",
      icon: dashboardIcons.quotes,
      ctaText: "Manage Quotes",
      count: stats.quotes
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome{user ? `, ${user.name}` : ''}! Manage your content here.
          </p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex rounded-md shadow-sm">
            <Link
              href="/admin/readings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Reading
            </Link>
          </span>
        </div>
      </div>
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 overflow-hidden">
        <div className="p-6 sm:p-8 md:flex md:items-center md:justify-between">
          <div className="md:flex-1 mb-6 md:mb-0">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Welcome back, {user?.name || 'Admin'}!
            </h2>
            <p className="mt-2 text-blue-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Link 
              href="/admin/readings/new" 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 bg-opacity-60 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Reading
            </Link>
            <Link 
              href="/admin/quotes/new" 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Quote
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Readings Stats Card */}
        <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 transition hover:shadow-md">
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
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Readings
                </dt>
                <dd className="mt-1 text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.readings}
                </dd>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100">
              <Link href="/admin/readings" className="font-medium text-blue-600 hover:text-blue-500 flex items-center text-sm">
                View all readings
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quotes Stats Card */}
        <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 transition hover:shadow-md">
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
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Quotes
                </dt>
                <dd className="mt-1 text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.quotes}
                </dd>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100">
              <Link href="/admin/quotes" className="font-medium text-green-600 hover:text-green-500 flex items-center text-sm">
                View all quotes
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* User Status Card */}
        <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 transition hover:shadow-md">
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
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Account Status
                </dt>
                <dd className="mt-1 flex flex-col">
                  <div className="flex items-center">
                    <span className="h-2.5 w-2.5 bg-green-400 rounded-full mr-2"></span>
                    <span className="text-sm font-semibold text-gray-900">Active as {user?.role || 'Admin'}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Last login: {new Date().toLocaleString()}
                  </div>
                </dd>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user?.email || 'admin@example.com'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Management Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Content Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const colorClasses = {
              blue: {
                bg: 'bg-blue-50',
                text: 'text-blue-500',
                hover: 'hover:bg-blue-700',
                ring: 'focus:ring-blue-500',
                button: 'bg-blue-600'
              },
              green: {
                bg: 'bg-green-50',
                text: 'text-green-500',
                hover: 'hover:bg-green-700',
                ring: 'focus:ring-green-500',
                button: 'bg-green-600'
              },
              indigo: {
                bg: 'bg-indigo-50',
                text: 'text-indigo-500',
                hover: 'hover:bg-indigo-700',
                ring: 'focus:ring-indigo-500',
                button: 'bg-indigo-600'
              }
            };
            const colorClass = colorClasses[card.color as keyof typeof colorClasses || 'blue'] || colorClasses.blue;
            
            return (
              <div key={index} className="bg-white shadow rounded-xl overflow-hidden transition transform hover:translate-y-[-3px] hover:shadow-lg border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${colorClass.bg} rounded-lg p-3`}>
                      {card.icon}
                    </div>
                    {card.count !== null && (
                      <span className="text-2xl font-bold text-gray-800">
                        {isLoading ? "..." : card.count}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-5">{card.description}</p>
                  <Link
                    href={card.link}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${colorClass.button} ${colorClass.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClass.ring} transition-colors w-full justify-center`}
                  >
                    {card.ctaText}
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* System Information */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Information</h2>
        <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Environment Details</h3>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Environment</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${process.env.NODE_ENV === 'production' ? 'bg-green-400' : 'bg-yellow-400'} mr-2`}></span>
                  {process.env.NODE_ENV || 'development'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Next.js Version</dt>
                <dd className="mt-1 text-sm text-gray-900">15.1.4</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}