import { listReadings } from '../commands/reading';
import { getReadings } from '../../src/lib/data';
import chalk from 'chalk';

// Mock dependencies
jest.mock('../../src/lib/data');
jest.mock('../lib/preview', () => ({
  previewReading: jest.fn(),
}));
jest.mock('chalk', () => ({
  cyan: jest.fn((text: string) => text),
  yellow: jest.fn((text: string) => text),
  green: jest.fn((text: string) => text),
  gray: jest.fn((text: string) => text),
  bold: jest.fn((text: string) => text),
  red: jest.fn((text: string) => text),
}));

const mockGetReadings = getReadings as jest.MockedFunction<typeof getReadings>;

describe('listReadings', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should display message when no readings found', () => {
    mockGetReadings.mockReturnValue([]);

    listReadings();

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No readings found'));
  });

  it('should list readings with correct formatting', () => {
    const mockReadings = [
      {
        slug: 'dune',
        title: 'Dune',
        author: 'Frank Herbert',
        finishedDate: '2024-01-15T00:00:00.000Z',
        favorite: true,
      },
      {
        slug: '1984',
        title: '1984',
        author: 'George Orwell',
        finishedDate: null,
        favorite: false,
      },
    ];

    mockGetReadings.mockReturnValue(mockReadings as any);

    listReadings();

    // Check header
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Recent Readings (showing 2 of 2)')
    );

    // Check book titles
    expect(consoleLogSpy).toHaveBeenCalledWith('Dune');
    expect(consoleLogSpy).toHaveBeenCalledWith('1984');

    // Check authors
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Frank Herbert'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('George Orwell'));

    // Check favorite marker
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('⭐ Favorite'));

    // Check summary
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Total: 2 books (1 finished, 1 reading)')
    );
  });

  it('should respect the limit parameter', () => {
    const mockReadings = [
      {
        slug: 'book1',
        title: 'Book 1',
        author: 'Author 1',
        finishedDate: null,
        favorite: false,
      },
      {
        slug: 'book2',
        title: 'Book 2',
        author: 'Author 2',
        finishedDate: null,
        favorite: false,
      },
      {
        slug: 'book3',
        title: 'Book 3',
        author: 'Author 3',
        finishedDate: null,
        favorite: false,
      },
    ];

    mockGetReadings.mockReturnValue(mockReadings as any);

    listReadings(2);

    // Should show "showing 2 of 3"
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Recent Readings (showing 2 of 3)')
    );

    // Should display only first 2 books
    expect(consoleLogSpy).toHaveBeenCalledWith('Book 1');
    expect(consoleLogSpy).toHaveBeenCalledWith('Book 2');
    expect(consoleLogSpy).not.toHaveBeenCalledWith('Book 3');
  });

  it('should use default limit of 10 when not specified', () => {
    const mockReadings = Array.from({ length: 15 }, (_, i) => ({
      slug: `book${i}`,
      title: `Book ${i}`,
      author: `Author ${i}`,
      finishedDate: null,
      favorite: false,
    }));

    mockGetReadings.mockReturnValue(mockReadings as any);

    listReadings();

    // Should show "showing 10 of 15"
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Recent Readings (showing 10 of 15)')
    );
  });

  it('should display finished status for completed books', () => {
    const mockReadings = [
      {
        slug: 'finished-book',
        title: 'Finished Book',
        author: 'Test Author',
        finishedDate: '2024-01-15T00:00:00.000Z',
        favorite: false,
      },
    ];

    mockGetReadings.mockReturnValue(mockReadings as any);

    listReadings();

    // Check that finished date is formatted and displayed
    const finishedDate = new Date('2024-01-15T00:00:00.000Z').toLocaleDateString();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(finishedDate));
  });

  it('should display reading status for unfinished books', () => {
    const mockReadings = [
      {
        slug: 'reading-book',
        title: 'Reading Book',
        author: 'Test Author',
        finishedDate: null,
        favorite: false,
      },
    ];

    mockGetReadings.mockReturnValue(mockReadings as any);

    listReadings();

    // Check that "Reading" status is shown
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Reading'));
  });

  it('should calculate correct counts for finished and reading books', () => {
    const mockReadings = [
      {
        slug: 'book1',
        title: 'Book 1',
        author: 'Author 1',
        finishedDate: '2024-01-01T00:00:00.000Z',
        favorite: false,
      },
      {
        slug: 'book2',
        title: 'Book 2',
        author: 'Author 2',
        finishedDate: '2024-01-02T00:00:00.000Z',
        favorite: false,
      },
      {
        slug: 'book3',
        title: 'Book 3',
        author: 'Author 3',
        finishedDate: null,
        favorite: false,
      },
      {
        slug: 'book4',
        title: 'Book 4',
        author: 'Author 4',
        finishedDate: null,
        favorite: false,
      },
      {
        slug: 'book5',
        title: 'Book 5',
        author: 'Author 5',
        finishedDate: null,
        favorite: false,
      },
    ];

    mockGetReadings.mockReturnValue(mockReadings as any);

    listReadings();

    // Should show correct counts: 5 total, 2 finished, 3 reading
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Total: 5 books (2 finished, 3 reading)')
    );
  });

  it('should handle errors gracefully', () => {
    mockGetReadings.mockImplementation(() => {
      throw new Error('Failed to get readings');
    });

    expect(() => {
      listReadings();
    }).toThrow('process.exit called');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error listing readings'),
      expect.any(Error)
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should only show favorite marker for favorite books', () => {
    const mockReadings = [
      {
        slug: 'favorite',
        title: 'Favorite Book',
        author: 'Author 1',
        finishedDate: null,
        favorite: true,
      },
      {
        slug: 'not-favorite',
        title: 'Regular Book',
        author: 'Author 2',
        finishedDate: null,
        favorite: false,
      },
    ];

    mockGetReadings.mockReturnValue(mockReadings as any);

    listReadings();

    // Favorite marker should appear once (for the favorite book)
    const favoriteCalls = consoleLogSpy.mock.calls.filter(call =>
      call[0]?.includes?.('⭐ Favorite')
    );
    expect(favoriteCalls).toHaveLength(1);
  });
});
