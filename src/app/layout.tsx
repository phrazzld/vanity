import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import ThemeInitializer from '@/app/components/ThemeInitializer';
import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { inter, spaceGrotesk } from './fonts';

export const metadata: Metadata = {
  title: 'phaedrus | software engineer and general tinkerer',
  description: 'high-vibe portfolio',
};

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
          <div className="container-content pt-16 pb-8">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
