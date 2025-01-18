import DarkModeToggle from '@/app/components/DarkModeToggle'
import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'phaedrus | software engineer and general tinkerer',
  description: 'high-vibe portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav>
            <ul className="nav-list">
              <li>
                <Link href="/">home</Link>
              </li>
              <li>
                <Link href="/projects">projects</Link>
              </li>
              <li>
                <Link href="/readings">readings</Link>
              </li>
              <li>
                <Link href="/map">travels</Link>
              </li>
            </ul>
          </nav>
          <DarkModeToggle />
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
