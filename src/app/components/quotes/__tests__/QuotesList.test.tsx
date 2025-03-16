/**
 * Tests for QuotesList Component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuotesList from '../QuotesList';

// Mock ThemeContext because it's used in the component
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('QuotesList Component', () => {
  const mockQuotes = [
    {
      id: 1,
      text: 'The way to get started is to quit talking and begin doing.',
      author: 'Walt Disney'
    },
    {
      id: 2,
      text: 'Life is what happens when you\'re busy making other plans.',
      author: 'John Lennon'
    },
    {
      id: 3,
      text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
      author: null
    }
  ];

  const mockSort = { field: 'text', order: 'asc' as const };
  const mockHandleSortChange = jest.fn();
  const mockHandleSelectQuote = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the list of quotes correctly', () => {
    render(
      <QuotesList
        quotes={mockQuotes}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
      />
    );

    // Check if all quote text snippets are rendered (could be truncated)
    expect(screen.getByText(/The way to get started/)).toBeInTheDocument();
    expect(screen.getByText(/Life is what happens/)).toBeInTheDocument();
    expect(screen.getByText(/The greatest glory/)).toBeInTheDocument();
    
    // Check if authors are rendered
    expect(screen.getByText('Walt Disney')).toBeInTheDocument();
    expect(screen.getByText('John Lennon')).toBeInTheDocument();
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
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
    render(
      <QuotesList
        quotes={mockQuotes}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
      />
    );

    // Click on a quote
    fireEvent.click(screen.getByText(/The way to get started/));
    expect(mockHandleSelectQuote).toHaveBeenCalledWith(mockQuotes[0]);
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
    render(
      <QuotesList
        quotes={[]}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
      />
    );

    expect(screen.getByText('No quotes found')).toBeInTheDocument();
    expect(screen.getByText('Start building your collection of inspirational quotes')).toBeInTheDocument();
  });

  it('shows different empty state message when searching', () => {
    render(
      <QuotesList
        quotes={[]}
        sort={mockSort}
        onSortChange={mockHandleSortChange}
        onSelectQuote={mockHandleSelectQuote}
        searchQuery="nonexistent"
      />
    );

    expect(screen.getByText('No quotes found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria or filters')).toBeInTheDocument();
  });
});