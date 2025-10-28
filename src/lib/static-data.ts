/**
 * Client-side access to static data
 * These imports load the generated JSON files at build time
 */

import type { Quote, Reading } from '@/types';

// Import static JSON data
// These files are generated at build time by scripts/generate-static-data.js
import quotesData from '../../public/data/quotes.json';
import readingsData from '../../public/data/readings.json';

export function getStaticQuotes(): Quote[] {
  // Return mock data in test environment if needed
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return [
      { id: 1, text: 'Test quote 1', author: 'Test Author 1' },
      { id: 2, text: 'Test quote 2', author: 'Test Author 2' },
      { id: 3, text: 'Test quote 3', author: 'Test Author 3' },
    ];
  }
  return quotesData;
}

export function getStaticReadings(): { data: Reading[]; totalCount: number; hasMore: boolean } {
  // Return mock data in test environment if needed
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return {
      data: [
        {
          id: 1,
          slug: 'test-book-1',
          title: 'Test Book 1',
          author: 'Test Author',
          finishedDate: '2024-01-01',
          coverImageSrc: null,
          audiobook: false,
          favorite: false,
        },
      ],
      totalCount: 1,
      hasMore: false,
    };
  }
  return readingsData as { data: Reading[]; totalCount: number; hasMore: boolean };
}
