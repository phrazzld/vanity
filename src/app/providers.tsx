'use client';

/**
 * Global Providers Component
 * 
 * This component wraps the application with necessary providers:
 * - NextAuth SessionProvider for authentication
 */

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>{children}</SessionProvider>
  );
}