'use client';

/**
 * ResponsiveExamples.tsx
 *
 * This file contains example components demonstrating various responsive design patterns
 * using the custom Tailwind responsive utilities. These components serve as references
 * and can be used in Storybook to show different responsive behaviors.
 */

import type { ReactNode } from 'react';

// Demo component showing a responsive card grid
export function ResponsiveCardGrid({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

// Demo component showing a responsive sidebar layout
export function ResponsiveSidebarLayout({
  sidebar,
  main,
  className = '',
}: {
  sidebar: ReactNode;
  main: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      <aside className="w-full lg:w-1/4 p-4 border rounded border-border bg-muted">{sidebar}</aside>
      <main className="w-full lg:flex-1 p-4">{main}</main>
    </div>
  );
}

// Demo component showing a responsive navigation
export function ResponsiveNavigation({
  items,
  className = '',
}: {
  items: string[];
  className?: string;
}) {
  return (
    <nav className={className}>
      {/* Mobile navigation (hamburger menu) */}
      <div className="lg:hidden">
        <button className="btn btn-ghost p-2" aria-label="Toggle navigation menu">
          <span className="block w-6 h-0.5 bg-foreground mb-1.5"></span>
          <span className="block w-6 h-0.5 bg-foreground mb-1.5"></span>
          <span className="block w-6 h-0.5 bg-foreground"></span>
        </button>
      </div>

      {/* Desktop navigation */}
      <ul className="hidden lg:flex gap-4 items-center">
        {items.map(item => (
          <li key={item}>
            <button className="content-link">{item}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Demo component with aspect ratio examples
export function AspectRatioExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="aspect-square bg-blue-100 flex items-center justify-center p-4">
        <span>Square 1:1</span>
      </div>
      <div className="aspect-portrait bg-green-100 flex items-center justify-center p-4">
        <span>Portrait 2:3</span>
      </div>
      <div className="aspect-landscape bg-red-100 flex items-center justify-center p-4">
        <span>Landscape 16:9</span>
      </div>
      <div className="aspect-golden bg-yellow-100 flex items-center justify-center p-4">
        <span>Golden Ratio 1.618:1</span>
      </div>
    </div>
  );
}

// Demo component showing container queries
export function ContainerQueryDemo() {
  return (
    <div className="border border-border rounded p-4 mb-4">
      <h3 className="mb-4">Resize the browser to see container queries in action:</h3>

      <div className="@container border border-border rounded p-4 resize-x overflow-hidden min-w-[200px] max-w-full">
        <div className="@xs:text-blue-500 @sm:text-green-500 @md:text-purple-500 @lg:text-red-500">
          <p className="@xs:hidden">Container smaller than xs breakpoint</p>
          <p className="hidden @xs:block @sm:hidden">Container at xs breakpoint</p>
          <p className="hidden @sm:block @md:hidden">Container at sm breakpoint</p>
          <p className="hidden @md:block @lg:hidden">Container at md breakpoint</p>
          <p className="hidden @lg:block">Container at lg breakpoint or larger</p>
        </div>

        <div className="mt-4 grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded">Card 1</div>
          <div className="bg-card p-4 rounded">Card 2</div>
          <div className="bg-card p-4 rounded">Card 3</div>
        </div>
      </div>
    </div>
  );
}

// Demo component showing responsive typography utility
export function ResponsiveTypography() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2">Responsive Heading</h2>
        <p className="text-sm sm:text-base md:text-lg">
          This text changes size at different breakpoints
        </p>
      </div>

      <div>
        <h3 className="mb-2">Optimal Reading Width</h3>
        <p className="w-readable bg-blue-50 dark:bg-blue-950/20 p-4">
          This paragraph uses the <code>w-readable</code> class for optimal reading width. It
          maintains a comfortable line length for reading across different screen sizes. The width
          is set to <code>clamp(45ch, 60%, 75ch)</code> which ensures it's never too wide or too
          narrow.
        </p>
      </div>

      <div>
        <h3 className="mb-2">Prose Width</h3>
        <p className="w-prose bg-green-50 dark:bg-green-950/20 p-4">
          This paragraph uses the <code>w-prose</code> class which provides an ideal width for
          long-form content. It's set to <code>min(65ch, 100%)</code> ensuring it's never wider than
          65 characters but can shrink on smaller screens.
        </p>
      </div>
    </div>
  );
}

// Demo component showing z-index scale
export function ZIndexDemo() {
  return (
    <div className="relative h-64 w-full border border-border rounded p-4">
      <div className="absolute left-4 top-4 w-32 h-32 bg-red-200 dark:bg-red-900/50 z-base flex items-center justify-center">
        z-base
      </div>
      <div className="absolute left-12 top-12 w-32 h-32 bg-blue-200 dark:bg-blue-900/50 z-elevated flex items-center justify-center">
        z-elevated
      </div>
      <div className="absolute left-20 top-20 w-32 h-32 bg-green-200 dark:bg-green-900/50 z-dropdown flex items-center justify-center">
        z-dropdown
      </div>
      <div className="absolute left-28 top-28 w-32 h-32 bg-yellow-200 dark:bg-yellow-900/50 z-sticky flex items-center justify-center">
        z-sticky
      </div>
    </div>
  );
}

// Exported component that combines all the examples
export default function ResponsivePatterns() {
  return (
    <div className="space-y-12 p-4">
      <section>
        <h2 className="text-2xl font-bold mb-4">Responsive Card Grid</h2>
        <ResponsiveCardGrid>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-4 h-32 flex items-center justify-center"
            >
              Card {i}
            </div>
          ))}
        </ResponsiveCardGrid>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Responsive Sidebar Layout</h2>
        <ResponsiveSidebarLayout
          sidebar={
            <div className="space-y-2">
              <h3 className="font-bold">Sidebar</h3>
              <ul>
                <li>Navigation Item 1</li>
                <li>Navigation Item 2</li>
                <li>Navigation Item 3</li>
              </ul>
            </div>
          }
          main={
            <div>
              <h2 className="text-xl font-bold mb-2">Main Content</h2>
              <p>
                This area is for the main content. On mobile, the sidebar appears above this
                content, but on desktop, they're side by side.
              </p>
            </div>
          }
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Responsive Navigation</h2>
        <div className="bg-card border border-border rounded-lg p-4">
          <ResponsiveNavigation items={['Home', 'About', 'Services', 'Blog', 'Contact']} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Aspect Ratio Examples</h2>
        <AspectRatioExamples />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Container Queries</h2>
        <ContainerQueryDemo />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Responsive Typography</h2>
        <ResponsiveTypography />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Z-Index Scale</h2>
        <ZIndexDemo />
      </section>
    </div>
  );
}
