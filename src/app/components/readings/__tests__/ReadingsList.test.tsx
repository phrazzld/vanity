/**
 * Tests for ReadingsList Component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadingsList from '../ReadingsList';
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
process.env.NEXT_PUBLIC_SPACES_BASE_URL = 'https://example.com/';

describe('ReadingsList Component', () => {
  const mockReadings = [
    {
      id: 1,
      slug: 'test-book-1',
      title: 'Test Book 1',
      author: 'Test Author 1',
      finishedDate: new Date().toISOString(),
      coverImageSrc: '/test-cover-1.jpg',
      thoughts: 'Great book',
      audiobook: false,
    },
    {
      id: 2,
      slug: 'test-book-2',
      title: 'Test Book 2',
      author: 'Test Author 2',
      finishedDate: null,
      coverImageSrc: null,
      thoughts: 'Currently reading',
      audiobook: false,
    },
    {
      id: 3,
      slug: 'test-book-3',
      title: 'Test Book 3',
      author: 'Test Author 3',
      finishedDate: null,
      coverImageSrc: '/test-cover-3.jpg',
      thoughts: 'Great audiobook',
      audiobook: true,
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

    // Check if status indicators are rendered
    expect(container.textContent).toContain('🎧 Audiobook');
    expect(container.textContent).toContain('Unfinished');
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
});
