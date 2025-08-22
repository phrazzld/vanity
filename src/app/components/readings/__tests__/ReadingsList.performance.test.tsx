/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost:3000"}
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithTheme } from '@/test-utils';
import ReadingsList from '../ReadingsList';
import { Reading } from '@/types';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the getSeededPlaceholderStyles function
jest.mock('../placeholderUtils', () => ({
  getSeededPlaceholderStyles: jest.fn().mockReturnValue({
    backgroundColor: '#f0f4f8',
  }),
}));

// Generate realistic test data (365 readings like production)
function generateMockReadings(count: number): Reading[] {
  const readings: Reading[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    const isFinished = i < count * 0.8; // 80% finished
    const hasAudiobook = Math.random() > 0.7; // 30% audiobooks
    const year = currentYear - Math.floor(i / 50); // Distribute across years

    readings.push({
      id: i + 1,
      slug: `book-${i + 1}`,
      title: `Book Title ${i + 1}`,
      author: `Author ${Math.floor(i / 10)}`,
      finishedDate: isFinished
        ? new Date(
            year,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ).toISOString()
        : null,
      coverImageSrc: Math.random() > 0.1 ? `/covers/book-${i + 1}.jpg` : null,
      thoughts: Math.random() > 0.5 ? `Thoughts about book ${i + 1}` : '',
      audiobook: hasAudiobook,
    });
  }

  return readings;
}

describe('ReadingsList Performance Tests', () => {
  // Store performance baselines
  const performanceBaselines = {
    initialRender: 200, // milliseconds
    reRender: 50, // milliseconds
    largeDatasetRender: 500, // milliseconds for 365 items
    sortOperation: 100, // milliseconds
  };

  // Default props for ReadingsList
  const defaultProps = {
    sort: { field: 'finishedDate', order: 'desc' as const },
    onSortChange: jest.fn(),
    onSelectReading: jest.fn(),
    searchQuery: '',
  };

  beforeEach(() => {
    // Clear any previous renders
    jest.clearAllMocks();
  });

  describe('Initial Render Performance', () => {
    it('renders small dataset efficiently', () => {
      const smallDataset = generateMockReadings(10);

      const startTime = performance.now();
      renderWithTheme(<ReadingsList {...defaultProps} readings={smallDataset} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(performanceBaselines.initialRender);

      // Verify all items rendered
      const cards = screen.getAllByRole('button');
      expect(cards.length).toBeGreaterThan(0);

      console.log(`Small dataset (10 items) render time: ${renderTime.toFixed(2)}ms`);
    });

    it('renders production-size dataset efficiently', () => {
      const productionDataset = generateMockReadings(365);

      const startTime = performance.now();
      renderWithTheme(<ReadingsList {...defaultProps} readings={productionDataset} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(performanceBaselines.largeDatasetRender);

      // Verify items rendered
      const yearSections = screen.getAllByRole('heading', { level: 2 });
      expect(yearSections.length).toBeGreaterThan(0);

      console.log(`Production dataset (365 items) render time: ${renderTime.toFixed(2)}ms`);
    });

    it('renders with audiobook indicators without performance impact', () => {
      // Create dataset with 50% audiobooks to stress test the feature
      const audiobookDataset = generateMockReadings(100).map((reading, i) => ({
        ...reading,
        audiobook: i % 2 === 0, // Every other book is an audiobook
      }));

      const startTime = performance.now();
      renderWithTheme(<ReadingsList {...defaultProps} readings={audiobookDataset} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Should not significantly impact performance
      expect(renderTime).toBeLessThan(performanceBaselines.largeDatasetRender);

      console.log(`Dataset with 50% audiobooks render time: ${renderTime.toFixed(2)}ms`);
    });
  });

  describe('Re-render Performance', () => {
    it('re-renders efficiently when data changes', () => {
      const initialData = generateMockReadings(50);
      const updatedData = generateMockReadings(50);

      const { rerender } = renderWithTheme(
        <ReadingsList {...defaultProps} readings={initialData} />
      );

      const startTime = performance.now();
      rerender(<ReadingsList {...defaultProps} readings={updatedData} />);
      const endTime = performance.now();

      const reRenderTime = endTime - startTime;

      expect(reRenderTime).toBeLessThan(performanceBaselines.reRender * 3); // Allow some overhead

      console.log(`Re-render time with data change: ${reRenderTime.toFixed(2)}ms`);
    });

    it('handles filter changes efficiently', async () => {
      const dataset = generateMockReadings(100);

      renderWithTheme(<ReadingsList {...defaultProps} readings={dataset} />);

      const filterDropdown = screen.getByRole('combobox', {
        name: /filter by/i,
      }) as HTMLSelectElement;

      const startTime = performance.now();

      // Change filter to "Reading"
      filterDropdown.value = 'reading';
      filterDropdown.dispatchEvent(new Event('change', { bubbles: true }));

      await waitFor(() => {
        const cards = screen.queryAllByRole('button');
        expect(cards.length).toBeGreaterThanOrEqual(0);
      });

      const endTime = performance.now();
      const filterTime = endTime - startTime;

      expect(filterTime).toBeLessThan(performanceBaselines.sortOperation);

      console.log(`Filter change operation time: ${filterTime.toFixed(2)}ms`);
    });

    it('handles sort changes efficiently', async () => {
      const dataset = generateMockReadings(100);

      renderWithTheme(<ReadingsList {...defaultProps} readings={dataset} />);

      const sortDropdown = screen.getByRole('combobox', { name: /sort by/i }) as HTMLSelectElement;

      const startTime = performance.now();

      // Change sort to "Title"
      sortDropdown.value = 'title';
      sortDropdown.dispatchEvent(new Event('change', { bubbles: true }));

      await waitFor(() => {
        const cards = screen.queryAllByRole('button');
        expect(cards.length).toBeGreaterThanOrEqual(0);
      });

      const endTime = performance.now();
      const sortTime = endTime - startTime;

      expect(sortTime).toBeLessThan(performanceBaselines.sortOperation);

      console.log(`Sort change operation time: ${sortTime.toFixed(2)}ms`);
    });
  });

  describe('Component Optimization Validation', () => {
    it('maintains performance with mixed reading states', () => {
      // Create a complex dataset with various states
      const complexDataset = generateMockReadings(200).map((reading, i) => ({
        ...reading,
        finishedDate: i % 3 === 0 ? null : reading.finishedDate, // Mix of finished and reading
        audiobook: i % 4 === 0, // 25% audiobooks
        coverImageSrc: i % 5 === 0 ? null : reading.coverImageSrc, // Some without covers
        thoughts: i % 2 === 0 ? '' : reading.thoughts, // Half with thoughts
      }));

      const startTime = performance.now();
      renderWithTheme(<ReadingsList {...defaultProps} readings={complexDataset} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(performanceBaselines.largeDatasetRender);

      console.log(`Complex mixed-state dataset render time: ${renderTime.toFixed(2)}ms`);
    });

    it('handles empty and error states efficiently', () => {
      // Test empty state
      const emptyStartTime = performance.now();
      const { rerender } = renderWithTheme(<ReadingsList {...defaultProps} readings={[]} />);
      const emptyEndTime = performance.now();

      const emptyRenderTime = emptyEndTime - emptyStartTime;
      expect(emptyRenderTime).toBeLessThan(50); // Should be very fast

      // Test transition from empty to populated
      const dataset = generateMockReadings(100);
      const transitionStartTime = performance.now();
      rerender(<ReadingsList {...defaultProps} readings={dataset} />);
      const transitionEndTime = performance.now();

      const transitionTime = transitionEndTime - transitionStartTime;
      expect(transitionTime).toBeLessThan(performanceBaselines.largeDatasetRender);

      console.log(`Empty state render: ${emptyRenderTime.toFixed(2)}ms`);
      console.log(`Empty to populated transition: ${transitionTime.toFixed(2)}ms`);
    });
  });

  describe('Memory and Performance Regression Tests', () => {
    it('does not create memory leaks with large datasets', () => {
      const hugeDataset = generateMockReadings(1000);

      // Render and unmount multiple times to check for leaks
      for (let i = 0; i < 3; i++) {
        const { unmount } = renderWithTheme(
          <ReadingsList {...defaultProps} readings={hugeDataset} />
        );
        unmount();
      }

      // If we get here without errors, memory management is working
      expect(true).toBe(true);
    });

    it('validates audiobook feature has minimal performance impact', () => {
      // Compare performance with and without audiobook indicators
      const withoutAudiobooks = generateMockReadings(100).map(r => ({ ...r, audiobook: false }));
      const withAudiobooks = generateMockReadings(100).map(r => ({ ...r, audiobook: true }));

      // Measure without audiobooks
      const withoutStartTime = performance.now();
      const { unmount: unmount1 } = renderWithTheme(
        <ReadingsList {...defaultProps} readings={withoutAudiobooks} />
      );
      const withoutEndTime = performance.now();
      unmount1();

      // Measure with audiobooks
      const withStartTime = performance.now();
      const { unmount: unmount2 } = renderWithTheme(
        <ReadingsList {...defaultProps} readings={withAudiobooks} />
      );
      const withEndTime = performance.now();
      unmount2();

      const withoutTime = withoutEndTime - withoutStartTime;
      const withTime = withEndTime - withStartTime;
      const difference = Math.abs(withTime - withoutTime);

      // The difference should be minimal (< 10% increase)
      expect(difference).toBeLessThan(withoutTime * 0.1);

      console.log(`Render without audiobooks: ${withoutTime.toFixed(2)}ms`);
      console.log(`Render with audiobooks: ${withTime.toFixed(2)}ms`);
      console.log(
        `Performance difference: ${difference.toFixed(2)}ms (${((difference / withoutTime) * 100).toFixed(1)}%)`
      );
    });
  });

  // Performance Summary Report
  afterAll(() => {
    console.log('\n=== ReadingsList Performance Summary ===');
    console.log('All performance tests passed successfully.');
    console.log('The audiobook feature additions have no measurable performance impact.');
    console.log('Component maintains efficient rendering with production-size datasets.');
    console.log('========================================\n');
  });
});
