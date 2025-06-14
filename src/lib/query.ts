/**
 * TanStack Query client configuration
 *
 * This file sets up the QueryClient instance used throughout the application
 * for server state management (API data fetching, caching, etc.)
 */

import { QueryClient } from '@tanstack/react-query';
import { logger, createLogContext } from './logger';

// Enhanced dev options
// Only enabled in development (client-side detection)
const devOptions =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? {
        logger: {
          log: (message: string, ...args: unknown[]) => {
            logger.debug(
              message,
              createLogContext('lib/query', 'tanstack-query', {
                query_args: args.length > 0 ? args : undefined,
              })
            );
          },
          warn: (message: string, ...args: unknown[]) => {
            logger.warn(
              message,
              createLogContext('lib/query', 'tanstack-query', {
                query_args: args.length > 0 ? args : undefined,
              })
            );
          },
          error: (message: string, ...args: unknown[]) => {
            logger.error(
              message,
              createLogContext('lib/query', 'tanstack-query', {
                query_args: args.length > 0 ? args : undefined,
              })
            );
          },
        },
      }
    : {};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Only refetch data after 1 minute (good balance for most use cases)
      staleTime: 60 * 1000,

      // Retry once if a query fails before showing error UI
      retry: 1,

      // Disable automatic refetching when window regains focus
      // (can be enabled for specific queries if needed)
      refetchOnWindowFocus: false,

      // Disable refetching on reconnect (can be enabled for specific queries)
      refetchOnReconnect: false,
    },
  },
  ...devOptions,
});
