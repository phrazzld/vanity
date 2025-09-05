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
    logger.error(`Global error handler: ${error.name} - ${error.message}`);
  }, [error]);

  return (
    <section>
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-lg mb-6">An error occurred while processing your request.</p>

      {/* Error details in development */}
      {typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && (
        <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm">
          <p className="text-red-600 dark:text-red-400">{error.message}</p>
          {error.digest && (
            <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      )}

      <button
        onClick={reset}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        Try again
      </button>
    </section>
  );
}
