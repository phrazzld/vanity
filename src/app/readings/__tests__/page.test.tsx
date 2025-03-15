import { render } from '@testing-library/react';
import { getReadings } from '@/lib/db';
import ReadingsPage from '../page';
import prisma from '@/lib/prisma';
import type { Reading } from '@/types';

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
  },
}));

// Mock the ReadingCard component
jest.mock('../../components/readings/ReadingCard', () => {
  return {
    __esModule: true,
    default: ({ slug, title }: { slug: string, title: string }) => (
      <div data-testid="reading-card" title={title}>{slug}</div>
    ),
  };
});

// Suppress console logs/errors
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('ReadingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches readings from database', async () => {
    // Mock data
    const mockReadings: Reading[] = [
      { 
        id: 1, 
        slug: 'book-1', 
        title: 'Book 1', 
        author: 'Author 1', 
        finishedDate: new Date('2023-01-01'), 
        coverImageSrc: '/covers/book1.jpg',
        thoughts: 'Great book',
        dropped: false,
      },
      { 
        id: 2, 
        slug: 'book-2', 
        title: 'Book 2', 
        author: 'Author 2',
        finishedDate: null,
        coverImageSrc: null,
        thoughts: 'Reading in progress',
        dropped: false,
      },
    ];
    
    // Mock Prisma response
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockReadings);
    
    // Call the data fetching function
    const readings = await getReadings();
    
    // Verify correct data fetching
    expect(readings).toEqual(mockReadings);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('handles database errors gracefully', async () => {
    // Mock database error
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    
    // Call the data fetching function
    const readings = await getReadings();
    
    // Should return empty array on error
    expect(readings).toEqual([]);
  });

  it('renders the readings page with reading cards', async () => {
    // Mock data with serializable dates (ISO strings instead of Date objects)
    const mockReadings: Omit<Reading, 'finishedDate'>[] = [
      { 
        id: 1, 
        slug: 'book-1', 
        title: 'Book 1', 
        author: 'Author 1', 
        finishedDate: new Date('2023-01-01').toISOString() as any, 
        coverImageSrc: '/covers/book1.jpg',
        thoughts: 'Great book',
        dropped: false,
      },
      { 
        id: 2, 
        slug: 'book-2', 
        title: 'Book 2', 
        author: 'Author 2',
        finishedDate: null,
        coverImageSrc: null,
        thoughts: 'Reading in progress',
        dropped: false,
      },
    ];
    
    // Mock Prisma response
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockReadings);
    
    // Render the component (needs JSX transform for async component)
    const Component = await ReadingsPage();
    const { getAllByTestId } = render(Component);
    
    // Check that reading cards are rendered
    const cards = getAllByTestId('reading-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toBe('book-1');
    expect(cards[1].textContent).toBe('book-2');
  });
});