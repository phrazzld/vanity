/**
 * Utility functions for working with reading data
 */

import type { Reading } from '@/types';

/**
 * Creates a mapping of readings by year
 * 
 * @param readings Array of reading objects to group by year
 * @returns Object with year keys and arrays of readings as values
 */
export function groupReadingsByYear(readings: Reading[]): Record<string, Reading[]> {
  // Initialize with special sections for "Currently Reading" and "Dropped"
  const grouped: Record<string, Reading[]> = {
    'Currently Reading': [],
    'Dropped': []
  };
  
  // First pass: process readings into correct buckets based on status
  readings.forEach(reading => {
    // Handle special categories first
    if (reading.dropped) {
      grouped['Dropped'].push(reading);
      return;
    }
    
    if (reading.finishedDate === null) {
      grouped['Currently Reading'].push(reading);
      return;
    }
    
    // For finished readings, determine the year
    const finishedDate = typeof reading.finishedDate === 'string' 
      ? new Date(reading.finishedDate) 
      : reading.finishedDate;
    
    const year = finishedDate.getFullYear().toString();
    
    // Initialize array for this year if it doesn't exist yet
    if (!grouped[year]) {
      grouped[year] = [];
    }
    
    // Add reading to appropriate year
    grouped[year].push(reading);
  });
  
  // Remove empty special categories
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });
  
  return grouped;
}

/**
 * Returns sorted year keys with special sections first
 * 
 * @param yearGroups Object with year keys and reading arrays
 * @returns Array of year keys sorted in display order
 */
export function getSortedYearKeys(yearGroups: Record<string, Reading[]>): string[] {
  const years = Object.keys(yearGroups);
  
  // Separate special sections and regular years
  const specialSections = ['Currently Reading', 'Dropped'].filter(section => 
    years.includes(section)
  );
  
  const regularYears = years
    .filter(year => !specialSections.includes(year))
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10)); // Sort years in descending order
  
  // Combine with special sections first
  return [...specialSections, ...regularYears];
}

/**
 * Sorts readings within a specific category/year
 * 
 * @param readings Array of readings to sort
 * @param category Category/year being sorted
 * @returns Sorted array of readings
 */
export function sortReadingsWithinCategory(readings: Reading[], category: string): Reading[] {
  if (category === 'Currently Reading') {
    // Sorting logic for currently reading items (e.g. by title)
    return [...readings].sort((a, b) => a.title.localeCompare(b.title));
  }
  
  if (category === 'Dropped') {
    // Sort dropped readings by title
    return [...readings].sort((a, b) => a.title.localeCompare(b.title));
  }
  
  // For year categories, sort by finishedDate in descending order (most recent first)
  return [...readings].sort((a, b) => {
    const dateA = new Date(a.finishedDate as string | Date);
    const dateB = new Date(b.finishedDate as string | Date);
    return dateB.getTime() - dateA.getTime();
  });
}