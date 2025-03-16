import DarkModeToggle from '@/app/components/DarkModeToggle'
import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { ThemeProvider } from './context/ThemeContext'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'phaedrus | software engineer and general tinkerer',
  description: 'high-vibe portfolio',
}

function Header() {
  return (
    <header className="site-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <nav>
        <ul className="nav-list">
          <li>
            <Link href="/" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">home</Link>
          </li>
          <li>
            <Link href="/projects" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">projects</Link>
          </li>
          <li>
            <Link href="/readings" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">readings</Link>
          </li>
          <li>
            <Link href="/map" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">travels</Link>
          </li>
        </ul>
      </nav>
      <DarkModeToggle />
    </header>
  );
}

// Use a client component with ThemeProvider
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
        <ThemeProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
          </Suspense>
          <main className="bg-white dark:bg-gray-900">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
