import DarkModeToggle from '@/app/components/DarkModeToggle';
import Footer from '@/app/components/Footer';
import ThemeInitializer from '@/app/components/ThemeInitializer';
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Suspense } from 'react';
import { inter, spaceGrotesk } from './fonts';

export const metadata: Metadata = {
  title: 'phaedrus | software engineer and general tinkerer',
  description: 'high-vibe portfolio',
};

function Header() {
  return (
    <header className="site-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <nav>
          <ul className="nav-list">
            <li>
              <Link href="/" className="text-gray-900 dark:text-gray-100">
                home
              </Link>
            </li>
            <li>
              <Link href="/projects" className="text-gray-900 dark:text-gray-100">
                projects
              </Link>
            </li>
            <li>
              <Link href="/readings" className="text-gray-900 dark:text-gray-100">
                readings
              </Link>
            </li>
            <li>
              <Link href="/map" className="text-gray-900 dark:text-gray-100">
                travels
              </Link>
            </li>
          </ul>
        </nav>
        <DarkModeToggle />
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col pt-[4.5rem]">
        <ThemeInitializer />
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
        </Suspense>
        <main className="bg-white dark:bg-gray-900 flex-grow pb-[49px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
