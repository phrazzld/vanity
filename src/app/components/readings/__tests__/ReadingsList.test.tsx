/**
 * Tests for ReadingsList Component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadingsList from '../ReadingsList';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock UIStore because it's used in the component
jest.mock('@/store/ui', () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
  useUIStore: jest.fn(() => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
    setDarkMode: jest.fn(),
    initializeTheme: jest.fn(),
  })),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    // These properties are required for type checking but not used in the mock

    src: _src,
    alt,
    width,
    height,
    className,

    onError: _onError,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    onError?: (_e: any) => void;
  }) => (
    <div data-testid="mock-image" style={{ width, height }} className={className}>
      {/* Replace img with div to avoid ESLint warnings */}
      Mock Image: {alt}
    </div>
  ),
}));

// Mock environment variable for image URLs
// In Jest environment, we can safely set environment variables
// NEXT_PUBLIC_SPACES_BASE_URL removed - no longer used

import type { Reading } from '@/types';

describe('ReadingsList Component', () => {
  const mockReadings: Reading[] = [
    {
      id: 1,
      slug: 'test-book-1',
      title: 'Test Book 1',
      author: 'Test Author 1',
      finishedDate: new Date().toISOString(),
      coverImageSrc: '/test-cover-1.jpg',
      audiobook: false,
      favorite: true,
    },
    {
      id: 2,
      slug: 'test-book-2',
      title: 'Test Book 2',
      author: 'Test Author 2',
      finishedDate: null,
      coverImageSrc: null,
      audiobook: false,
      favorite: false,
    },
    {
      id: 3,
      slug: 'test-book-3',
      title: 'Test Book 3',
      author: 'Test Author 3',
      finishedDate: null,
      coverImageSrc: '/test-cover-3.jpg',
      audiobook: true,
      favorite: false,
    },
  ];

  const mockSort = { field: 'title', order: 'asc' as const };
  const mockHandleSortChange = jest.fn();
  const mockHandleSelectReading = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the list of readings correctly', () => {
    const { container } = render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Check if all readings are rendered
    expect(container.textContent).toContain('Test Book 1');
    expect(container.textContent).toContain('Test Book 2');
    expect(container.textContent).toContain('Test Book 3');

    // Check if authors are rendered
    expect(container.textContent).toContain('Test Author 1');
    expect(container.textContent).toContain('Test Author 2');
    expect(container.textContent).toContain('Test Author 3');

    // Check if status indicators are rendered (no emoji, just text)
    expect(container.textContent).toContain('Audiobook');
    expect(container.textContent).toContain('Unfinished');
  });

  it('does not render dropped or paused status badges', () => {
    const { container } = render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Verify no "Paused" or "Dropped" badges appear
    expect(screen.queryByText(/paused/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/dropped/i)).not.toBeInTheDocument();

    // Verify only reading/finished status indicators exist
    expect(container.textContent).toContain('Unfinished');
    // No "Paused" or three-state status should exist
  });

  it('displays audiobook indicators correctly', () => {
    const { container } = render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Test Book 3 has audiobook: true - should show "Audiobook" text (no emoji)
    expect(container.textContent).toContain('Audiobook');

    // Check that the audiobook badge exists
    const audiobookBadge = screen.getByText('Audiobook');
    expect(audiobookBadge).toBeInTheDocument();

    // Check that it's part of a badge with the icon
    const badgeElement = audiobookBadge.closest('span');
    expect(badgeElement).toHaveClass('inline-flex', 'items-center');
  });

  it('correctly filters readings by status (reading vs finished)', () => {
    // Test with only finished readings
    const finishedReadings = mockReadings.filter(r => r.finishedDate !== null);
    const { container: finishedContainer, unmount: unmountFinished } = render(
      <ReadingsList
        readings={finishedReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );
    expect(finishedContainer.textContent).toContain('Test Book 1');
    expect(finishedContainer.textContent).not.toContain('Test Book 2');
    expect(finishedContainer.textContent).not.toContain('Test Book 3');
    unmountFinished();

    // Test with only currently reading
    const currentlyReading = mockReadings.filter(r => r.finishedDate === null);
    const { container: readingContainer } = render(
      <ReadingsList
        readings={currentlyReading}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );
    expect(readingContainer.textContent).not.toContain('Test Book 1');
    expect(readingContainer.textContent).toContain('Test Book 2');
    expect(readingContainer.textContent).toContain('Test Book 3');
  });

  it('handles sorting when column headers are clicked', () => {
    render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Click on title header
    fireEvent.click(screen.getByText('TITLE'));
    expect(mockHandleSortChange).toHaveBeenCalledWith('title');

    // Click on author header
    fireEvent.click(screen.getByText('AUTHOR'));
    expect(mockHandleSortChange).toHaveBeenCalledWith('author');

    // Click on date header
    fireEvent.click(screen.getByText('DATE'));
    expect(mockHandleSortChange).toHaveBeenCalledWith('date');
  });

  it('calls onSelectReading when a reading is clicked', () => {
    const { container } = render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Find the first reading item using role and click it
    const readingItems = container.querySelectorAll('[role="button"]');
    if (readingItems.length > 0) {
      const firstReadingItem = readingItems[0];
      if (firstReadingItem) {
        fireEvent.click(firstReadingItem);
        expect(mockHandleSelectReading).toHaveBeenCalledWith(mockReadings[0]);
      } else {
        throw new Error('First reading item is undefined');
      }
    } else {
      throw new Error('No reading items with role="button" found');
    }
  });

  it('highlights search terms in title and author', () => {
    render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
        searchQuery="Test"
      />
    );

    // Check if there are mark elements for highlighting
    const markElements = screen.getAllByRole('mark');
    expect(markElements.length).toBeGreaterThan(0);
  });

  it('shows the proper empty state when no readings are available', () => {
    const { container } = render(
      <ReadingsList
        readings={[]}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Using a more flexible approach to find text elements
    expect(container.textContent).toContain('No readings found');
    expect(container.textContent).toContain('Start building your literary collection');
  });

  it('shows different empty state message when searching', () => {
    const { container } = render(
      <ReadingsList
        readings={[]}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
        searchQuery="nonexistent"
      />
    );

    // Debug the rendered output
    // console.log(container.innerHTML);

    // Using a more flexible approach to find text elements
    expect(container.textContent).toContain('No readings found');
    expect(container.textContent).toContain('Try adjusting your search criteria or filters');
  });

  it('handles keyboard navigation correctly', () => {
    const { container } = render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    const readingItems = container.querySelectorAll('[role="button"]');
    expect(readingItems.length).toBe(3);

    // Test Enter key
    if (readingItems[0]) {
      fireEvent.keyDown(readingItems[0], { key: 'Enter' });
      expect(mockHandleSelectReading).toHaveBeenCalledWith(mockReadings[0]);
    }

    // Clear mock
    mockHandleSelectReading.mockClear();

    // Test Space key
    if (readingItems[1]) {
      fireEvent.keyDown(readingItems[1], { key: ' ' });
      expect(mockHandleSelectReading).toHaveBeenCalledWith(mockReadings[1]);
    }
  });

  it('handles date formatting with valid dates', () => {
    const readingsWithDates: Reading[] = [
      {
        id: 1,
        slug: 'test-book-1',
        title: 'Test Book 1',
        author: 'Test Author 1',
        coverImageSrc: '/test-cover-1.jpg',
        audiobook: false,
        favorite: false,
        finishedDate: '2023-12-25T00:00:00Z',
      },
      {
        id: 3,
        slug: 'test-book-3',
        title: 'Test Book 3',
        author: 'Test Author 3',
        coverImageSrc: '/test-cover-3.jpg',
        audiobook: true,
        favorite: true,
        finishedDate: new Date('2023-06-15').toISOString(),
      },
    ];

    const { container } = render(
      <ReadingsList
        readings={readingsWithDates}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Check that dates are formatted and displayed
    expect(container.textContent).toContain('12/25/2023');
    expect(container.textContent).toContain('6/15/2023');
  });

  it('handles highlighting errors gracefully', () => {
    jest.clearAllMocks();

    // Test with potentially problematic search query
    render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
        searchQuery="[invalid-regex"
      />
    );

    // Component should still render
    expect(screen.getByText('Test Book 1')).toBeInTheDocument();
  });

  it('handles image loading errors', () => {
    const { container } = render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Find image elements
    const images = container.querySelectorAll('[data-testid="mock-image"]');

    // Trigger error on first image
    if (images[0]) {
      const onError = images[0].getAttribute('onError');
      if (onError) {
        fireEvent.error(images[0]);
      }
    }

    // Component should still be functional
    expect(container.textContent).toContain('Test Book 1');
  });

  it('verifies complete removal of dropped status', () => {
    // Test that ReadingsList doesn't have any dropped-related code
    const componentText = ReadingsList.toString();
    expect(componentText).not.toMatch(/dropped/i);
    expect(componentText).not.toMatch(/paused/i);

    // Render and verify UI
    render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // No dropped or paused UI elements should exist
    expect(screen.queryByText(/dropped/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/paused/i)).not.toBeInTheDocument();
  });
});
