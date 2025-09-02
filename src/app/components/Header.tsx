'use client';

import DarkModeToggle from '@/app/components/DarkModeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  // Helper to determine if a link is active
  const isActive = (href: string) => {
    if (!pathname) return false;
    // Special case for home
    if (href === '/' && pathname === '/') return true;
    // For other routes, check if pathname starts with href
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  const navLinks = [
    { href: '/', label: 'home' },
    { href: '/projects', label: 'projects' },
    { href: '/readings', label: 'readings' },
    { href: '/map', label: 'travels' },
  ];

  return (
    <header className="site-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-20">
      <div className="container-content flex items-center justify-between">
        <nav>
          <ul className="nav-list">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-gray-900 dark:text-gray-100"
                  data-active={isActive(href)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <DarkModeToggle />
      </div>
    </header>
  );
}
