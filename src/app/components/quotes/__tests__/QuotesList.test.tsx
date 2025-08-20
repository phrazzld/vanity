/**
 * Tests for QuotesList Component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuotesList from '../QuotesList';

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

describe('QuotesList Component', () => {
  const mockQuotes = [
    {
      id: 1,
      text: 'The way to get started is to quit talking and begin doing.',
      author: 'Walt Disney',
    },
    {
      id: 2,
      text: "Life is what happens when you're busy making other plans.",
      author: 'John Lennon',
    },
    {
      id: 3,
      text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
      author: null,
    },
  ];

  const mockSort = { field: 'text', order: 'asc' as const };
  const mockHandleSortChange = jest.fn();
  const mockHandleSelectQuote = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the list of quotes correctly', () => {
    const { container } = render(
      <QuotesList
        quotes={mockQuotes}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
      />
    );

    // Check if all quote text snippets are rendered (could be truncated)
    expect(container.textContent).toContain('The way to get started');
    expect(container.textContent).toContain('Life is what happens');
    expect(container.textContent).toContain('The greatest glory');

    // Check if authors are rendered
    expect(container.textContent).toContain('Walt Disney');
    expect(container.textContent).toContain('John Lennon');
    expect(container.textContent).toContain('Anonymous');
  });

  it('handles sorting when column headers are clicked', () => {
    render(
      <QuotesList
        quotes={mockQuotes}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
      />
    );

    // Click on quote header
    fireEvent.click(screen.getByText('QUOTE'));
    expect(mockHandleSortChange).toHaveBeenCalledWith('text');

    // Click on author header
    fireEvent.click(screen.getByText('AUTHOR'));
    expect(mockHandleSortChange).toHaveBeenCalledWith('author');
  });

  it('calls onSelectQuote when a quote is clicked', () => {
    const { container } = render(
      <QuotesList
        quotes={mockQuotes}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
      />
    );

    // Find the first quote item using role and click it
    const quoteItems = container.querySelectorAll('[role="button"]');
    if (quoteItems.length > 0) {
      const firstQuoteItem = quoteItems[0];
      if (firstQuoteItem) {
        fireEvent.click(firstQuoteItem);
        expect(mockHandleSelectQuote).toHaveBeenCalledWith(mockQuotes[0]);
      } else {
        throw new Error('First quote item is undefined');
      }
    } else {
      throw new Error('No quote items with role="button" found');
    }
  });

  it('highlights search terms in text and author', () => {
    render(
      <QuotesList
        quotes={mockQuotes}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
        searchQuery="life"
      />
    );

    // Check if there are mark elements for highlighting
    const markElements = screen.getAllByRole('mark');
    expect(markElements.length).toBeGreaterThan(0);
  });

  it('shows the proper empty state when no quotes are available', () => {
    const { container } = render(
      <QuotesList
        quotes={[]}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
      />
    );

    // Using a more flexible approach to find text elements
    expect(container.textContent).toContain('No quotes found');
    expect(container.textContent).toContain(
      'Start building your collection of inspirational quotes'
    );
  });

  it('shows different empty state message when searching', () => {
    const { container } = render(
      <QuotesList
        quotes={[]}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
        searchQuery="nonexistent"
      />
    );

    // Using a more flexible approach to find text elements
    expect(container.textContent).toContain('No quotes found');
    expect(container.textContent).toContain('Try adjusting your search criteria or filters');
  });
});
