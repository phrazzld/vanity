'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error handler component that logs errors and displays a user-friendly message
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error when the component mounts
    logger.error(`Global error handler: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong
        </h2>

        <div className="mb-6 text-gray-700 dark:text-gray-300">
          <p>
            We apologize for the inconvenience. The error has been logged and we're working to fix
            it.
          </p>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded overflow-auto">
              <p className="font-mono text-sm text-red-500 dark:text-red-400">{error.message}</p>
              {error.digest && (
                <p className="font-mono text-xs mt-2 text-gray-500 dark:text-gray-400">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Home
          </button>

          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
