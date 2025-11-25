import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import ThemeInitializer from '@/app/components/ThemeInitializer';
import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { inter, ibmPlexMono } from './fonts';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'phaedrus | software engineer and general tinkerer',
  description: 'high-vibe portfolio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('ui-store');
                  var darkMode = false;

                  if (stored) {
                    var parsed = JSON.parse(stored);
                    // Check if user has explicitly set a preference
                    if (parsed.state && parsed.state.hasExplicitThemePreference === true) {
                      // New format - explicit flag present
                      darkMode = parsed.state.isDarkMode === true;
                    } else if (parsed.state && parsed.state.isDarkMode !== undefined) {
                      // Legacy format - isDarkMode exists but no explicit flag
                      // Infer explicit preference for backward compatibility
                      darkMode = parsed.state.isDarkMode === true;
                    } else {
                      // No stored preference, use system preference
                      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    }
                  } else {
                    // No stored data, use system preference
                    darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }

                  if (darkMode) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // Fail silently
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col pt-[4.5rem]">
        <ThemeInitializer />
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
        </Suspense>
        <main className="bg-white dark:bg-gray-900 flex-grow pb-[49px]">
          <div className="container-content pt-16 pb-8">{children}</div>
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
