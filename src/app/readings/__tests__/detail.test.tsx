import { render, screen } from '@testing-library/react';
import { getReading } from '@/lib/db';
import ReadingDetailPage from '../[slug]/page';
import prisma from '@/lib/prisma';
import type { Reading } from '@/types';

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
  },
}));

// Mock next/image to avoid static asset loading errors
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || ''} />,
}));

// Mock process.env for NEXT_PUBLIC_SPACES_BASE_URL
process.env.NEXT_PUBLIC_SPACES_BASE_URL = 'https://test-spaces.com';

// Suppress console logs/errors
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ReadingDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches a single reading by slug', async () => {
    // Mock data
    const mockReading: Reading = { 
      id: 1, 
      slug: 'test-book', 
      title: 'Test Book', 
      author: 'Test Author', 
      finishedDate: new Date('2023-01-01'), 
      coverImageSrc: '/covers/test.jpg',
      thoughts: 'Great test book',
      dropped: false,
    };
    
    // Mock Prisma response
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([mockReading]);
    
    // Call the function
    const reading = await getReading('test-book');
    
    // Verify correct data
    expect(reading).toEqual(mockReading);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns null when no reading is found', async () => {
    // Mock empty response
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
    
    // Call the function
    const reading = await getReading('nonexistent-book');
    
    // Should return null
    expect(reading).toBeNull();
  });

  it('handles database errors gracefully', async () => {
    // Mock database error
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    
    // Call the function
    const reading = await getReading('error-book');
    
    // Should return null on error
    expect(reading).toBeNull();
  });

  it('renders reading details when reading exists', async () => {
    // Mock data with a valid Date object (not a string)
    const mockReading: Reading = { 
      id: 1, 
      slug: 'test-book', 
      title: 'Test Book', 
      author: 'Test Author', 
      finishedDate: new Date('2023-01-01'), // Need to use actual Date for toLocaleDateString
      coverImageSrc: '/covers/test.jpg',
      thoughts: 'Great test book',
      dropped: false,
    };
    
    // Mock Prisma response
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([mockReading]);
    
    // Render the component
    const Component = await ReadingDetailPage({ params: { slug: 'test-book' } });
    render(Component);
    
    // Check that reading details are displayed (page renders titles in lowercase)
    expect(screen.getByText('test book')).toBeInTheDocument();
    expect(screen.getByText('test author')).toBeInTheDocument();
    expect(screen.getByText('Great test book')).toBeInTheDocument();
  });

  it('shows not found message when reading does not exist', async () => {
    // Mock empty response
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
    
    // Render the component
    const Component = await ReadingDetailPage({ params: { slug: 'nonexistent-book' } });
    render(Component);
    
    // Check that not found message is displayed
    expect(screen.getByText('not found')).toBeInTheDocument();
  });
});