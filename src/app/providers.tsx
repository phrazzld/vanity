'use client';

/**
 * Application Providers Component
 *
 * This component wraps the application with necessary providers for:
 * - Theme provider using ThemeContext (to be migrated to Zustand)
 */

import { ThemeProvider } from './context/ThemeContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
