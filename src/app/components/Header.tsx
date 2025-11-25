'use client';

import DarkModeToggle from '@/app/components/DarkModeToggle';

export default function Header() {
  return (
    <header className="site-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-20">
      <div className="container-content flex items-center justify-end">
        <DarkModeToggle />
      </div>
    </header>
  );
}
