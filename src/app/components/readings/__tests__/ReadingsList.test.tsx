/**
 * Tests for ReadingsList Component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadingsList from '../ReadingsList';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock ThemeContext because it's used in the component
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className, onError }: { 
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    onError?: (e: any) => void;
  }) => (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
      data-testid="mock-image"
    />
  )
}));

// Mock environment variable for image URLs
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
      dropped: false
    },
    {
      id: 2,
      slug: 'test-book-2',
      title: 'Test Book 2',
      author: 'Test Author 2',
      finishedDate: null,
      coverImageSrc: null,
      thoughts: 'Currently reading',
      dropped: false
    },
    {
      id: 3,
      slug: 'test-book-3',
      title: 'Test Book 3',
      author: 'Test Author 3',
      finishedDate: null,
      coverImageSrc: '/test-cover-3.jpg',
      thoughts: 'Not my favorite',
      dropped: true
    }
  ];

  const mockSort = { field: 'title', order: 'asc' as const };
  const mockHandleSortChange = jest.fn();
  const mockHandleSelectReading = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the list of readings correctly', () => {
    render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Check if all readings are rendered
    expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    expect(screen.getByText('Test Book 2')).toBeInTheDocument();
    expect(screen.getByText('Test Book 3')).toBeInTheDocument();
    
    // Check if authors are rendered
    expect(screen.getByText('Test Author 1')).toBeInTheDocument();
    expect(screen.getByText('Test Author 2')).toBeInTheDocument();
    expect(screen.getByText('Test Author 3')).toBeInTheDocument();

    // Check if status indicators are rendered
    expect(screen.getByText('Dropped')).toBeInTheDocument();
    // Use getAllByText since 'Unfinished' appears multiple times
    expect(screen.getAllByText('Unfinished').length).toBeGreaterThan(0);
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
    render(
      <ReadingsList
        readings={mockReadings}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    // Click on a reading
    fireEvent.click(screen.getByText('Test Book 1'));
    expect(mockHandleSelectReading).toHaveBeenCalledWith(mockReadings[0]);
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
    render(
      <ReadingsList
        readings={[]}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
      />
    );

    expect(screen.getByText('No readings found')).toBeInTheDocument();
    expect(screen.getByText('Start building your literary collection')).toBeInTheDocument();
  });

  it('shows different empty state message when searching', () => {
    render(
      <ReadingsList
        readings={[]}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectReading={mockHandleSelectReading}
        searchQuery="nonexistent"
      />
    );

    expect(screen.getByText('No readings found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria or filters')).toBeInTheDocument();
  });
});