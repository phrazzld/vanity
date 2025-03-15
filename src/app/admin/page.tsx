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

// Define data for dashboard cards
const dashboardCards = [
  {
    title: "Readings Management",
    description: "Add, edit, or delete readings in the database.",
    link: "/admin/readings",
    icon: (
      <svg 
        className="w-12 h-12 text-indigo-500" 
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
    ctaText: "Manage Readings"
  },
  {
    title: "Quotes Management",
    description: "Add, edit, or delete quotes in the database.",
    link: "/admin/quotes",
    icon: (
      <svg 
        className="w-12 h-12 text-indigo-500" 
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
    ctaText: "Manage Quotes"
  }
];

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
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome{user ? `, ${user.name}` : ''}! Manage your content here.
      </p>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 mr-4">
              <svg
                className="h-8 w-8 text-indigo-600"
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
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Readings</p>
              <p className="text-2xl font-semibold">
                {isLoading ? '...' : stats.readings}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg
                className="h-8 w-8 text-green-600"
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
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Quotes</p>
              <p className="text-2xl font-semibold">
                {isLoading ? '...' : stats.quotes}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg
                className="h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Last Login</p>
              <p className="text-sm font-semibold">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Management Cards */}
      <h2 className="text-xl font-semibold mb-4">Content Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {dashboardCards.map((card, index) => (
          <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {card.icon}
                <h3 className="text-xl font-semibold ml-4">{card.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <Link
                href={card.link}
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {card.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* System Information */}
      <h2 className="text-xl font-semibold mb-4">System Information</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Environment:</span>{" "}
              {process.env.NODE_ENV || 'development'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Next.js Version:</span> 15.1.4
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium">User Role:</span> {user?.role || 'Admin'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">User Email:</span> {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}