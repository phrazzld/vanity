'use client';

/**
 * @file YearSection component displays a group of readings for a specific year
 * @module components/readings/YearSection
 */

import { ReactNode } from 'react';
import type { Reading } from '@/types';
import ReadingCard from './ReadingCard';

/**
 * Props for the YearSection component
 */
export interface YearSectionProps {
  /** Year or category name (e.g., "2023", "Currently Reading", "Dropped") */
  year: string;
  
  /** Array of readings to display for this year/category */
  readings: Reading[];
  
  /** Optional reference to attach to the section */
  sectionRef?: React.RefObject<HTMLDivElement>;
  
  /** Optional custom class name */
  className?: string;
  
  /** Optional children to render before readings */
  children?: ReactNode;
}

/**
 * YearSection component that displays a heading for a year or category
 * and a grid of readings belonging to that year
 * 
 * @param {YearSectionProps} props - Component properties
 * @returns {JSX.Element} A year section with heading and grid of reading cards
 */
export default function YearSection({
  year,
  readings,
  sectionRef,
  className = '',
  children
}: YearSectionProps) {
  
  // Determine if this is a special section
  const isSpecialSection = year === 'Currently Reading' || year === 'Dropped';
  
  // Background colors for the year heading
  const bgColor = {
    'Currently Reading': 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-800',
    'Dropped': 'bg-gray-50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    'default': 'bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/40 dark:to-transparent text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  };
  
  // Choose the appropriate background color based on section type
  const headingBgColor = isSpecialSection 
    ? bgColor[year as keyof typeof bgColor] 
    : bgColor.default;
  
  return (
    <section 
      ref={sectionRef}
      className={`mb-8 ${className}`}
      data-year={year}
    >
      {/* Year heading */}
      <h2 
        className={`text-lg font-medium py-2 px-4 mb-4 border-b ${headingBgColor} sticky top-0 z-10`}
      >
        {year}
        {readings.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({readings.length} {readings.length === 1 ? 'book' : 'books'})
          </span>
        )}
      </h2>
      
      {/* Optional content before the readings grid */}
      {children}
      
      {/* Display message if no readings */}
      {readings.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p className="text-sm">No readings found for this {isSpecialSection ? 'category' : 'year'}.</p>
        </div>
      )}
      
      {/* Grid of reading cards */}
      {readings.length > 0 && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          }}
        >
          {readings.map((reading) => (
            <ReadingCard
              key={reading.slug}
              slug={reading.slug}
              title={reading.title}
              author={reading.author}
              coverImageSrc={reading.coverImageSrc}
              dropped={reading.dropped}
              finishedDate={reading.finishedDate}
            />
          ))}
        </div>
      )}
    </section>
  );
}