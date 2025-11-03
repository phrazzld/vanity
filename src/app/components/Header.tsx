'use client';

import DarkModeToggle from '@/app/components/DarkModeToggle';
import HamburgerButton from '@/app/components/HamburgerButton';
import MobileNav from '@/app/components/MobileNav';
import { useUIStore } from '@/store/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isMobileNavOpen = useUIStore(state => state.isMobileNavOpen);
  const toggleMobileNav = useUIStore(state => state.toggleMobileNav);
  const closeMobileNav = useUIStore(state => state.closeMobileNav);

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
    <>
      <header className="site-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-20">
        <div className="container-content flex items-center justify-between">
          {/* Mobile hamburger button - visible only on mobile */}
          <div className="md:hidden">
            <HamburgerButton isOpen={isMobileNavOpen} onClick={toggleMobileNav} />
          </div>

          {/* Desktop navigation - hidden on mobile */}
          <nav className="hidden md:block">
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

      {/* Mobile navigation drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={closeMobileNav} navLinks={navLinks} />
    </>
  );
}
