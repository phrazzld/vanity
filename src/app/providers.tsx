'use client';

/**
 * Application Providers Component
 *
 * This component wraps the application with necessary providers for:
 * - TanStack Query for server state management
 * - Theme provider still uses ThemeContext (to be migrated to Zustand)
 */

import { ThemeProvider } from './context/ThemeContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
      {/* React Query DevTools - only in development */}
      {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
