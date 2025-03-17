'use client';

/**
 * Login page for admin section
 * 
 * This page provides a login form for admin users to access the protected admin area.
 * It uses a direct form submission to the auth API endpoint.
 */

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Component for the login form with search params
function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Handle form validation before submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Use fetch to manually submit the form
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        body: formData,
        redirect: 'follow'
      });
      
      // If we get here, check if it's a redirect (success)
      if (response.redirected) {
        // Navigate to the redirect location
        window.location.href = response.url;
        return;
      }
      
      // If not a redirect, parse response for potential error
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setErrorMessage(data.error || 'Authentication failed');
      } else {
        setErrorMessage('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {(error || errorMessage) && (
              <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                      {error === 'CredentialsSignin' ? 'Invalid credentials' : 
                       error && error.includes('Lol you really thought') ? error : errorMessage}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                      rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                      text-gray-900 dark:text-white bg-white dark:bg-gray-700
                      focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                      rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 
                      text-gray-900 dark:text-white bg-white dark:bg-gray-700
                      focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                    shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800
                    disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign in'}
                </button>
              </div>
              
              <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Demo credentials: <span className="font-medium">admin / password123</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback for Suspense
function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">Loading login form...</p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}