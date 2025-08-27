'use client';

/**
 * @file YearSection component displays a group of readings for a specific year
 * @module components/readings/YearSection
 */

import type { ReactNode } from 'react';
import type { Reading } from '@/types';
import ReadingCard from './ReadingCard';

/**
 * Props for the YearSection component
 */
export interface YearSectionProps {
  /** Year or category name (e.g., "2023", "Currently Reading") */
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
  children,
}: YearSectionProps) {
  // Determine if this is a special section
  const isSpecialSection = year === 'Currently Reading';

  return (
    <section ref={sectionRef} className={`mb-8 ${className}`} data-year={year}>
      {/* Year heading */}
      <h2
        className={`text-sm font-inter font-medium tracking-wide py-2 px-4 mb-4 border-b 
          ${
            isSpecialSection
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
          } 
          sticky top-[4.25rem] z-10 uppercase backdrop-blur-sm`}
      >
        {year}
        {readings.length > 0 && (
          <span className="ml-2 text-xs font-normal opacity-60">({readings.length})</span>
        )}
      </h2>

      {/* Optional content before the readings grid */}
      {children}

      {/* Display message if no readings */}
      {readings.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p className="text-sm">
            No readings found for this {isSpecialSection ? 'category' : 'year'}.
          </p>
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
          {readings.map(reading => (
            <ReadingCard
              key={reading.slug}
              slug={reading.slug}
              title={reading.title}
              author={reading.author}
              coverImageSrc={reading.coverImageSrc}
              audiobook={reading.audiobook}
              finishedDate={reading.finishedDate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
