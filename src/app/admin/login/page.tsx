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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
        
        {(error || errorMessage) && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
            {error === 'CredentialsSignin' ? 'Invalid credentials' : errorMessage}
          </div>
        )}
        
        {/* Form for login */}
        <form 
          onSubmit={handleSubmit} 
          className="mt-8 space-y-6"
        >
          {/* Include callbackUrl as hidden input */}
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500">
            Demo credentials: admin / password123
          </p>
        </form>
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