import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../../src/app/components/SearchBar';
import { ThemeProvider } from '../../src/app/context/ThemeContext';

// Wrapper to provide required context
const renderWithContext = (component: React.ReactNode) => {
  return render(<ThemeProvider initialDarkMode={false}>{component}</ThemeProvider>);
};

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input and button', () => {
    renderWithContext(<SearchBar onSearch={mockOnSearch} searchAsYouType={false} />);

    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit search/i })).toBeInTheDocument();
  });

  test('triggers search only when button is clicked', async () => {
    renderWithContext(<SearchBar onSearch={mockOnSearch} searchAsYouType={false} />);

    const searchInput = screen.getByRole('textbox', { name: /search/i });
    const searchButton = screen.getByRole('button', { name: /submit search/i });

    // Type in search field
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Search should not be triggered on typing
    await waitFor(() => {
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    // Click search button
    fireEvent.click(searchButton);

    // Search should be triggered after button click
    expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  test('triggers search as user types when searchAsYouType is true', async () => {
    jest.useFakeTimers();

    renderWithContext(
      <SearchBar onSearch={mockOnSearch} searchAsYouType={true} debounceMs={300} />
    );

    const searchInput = screen.getByRole('textbox', { name: /search/i });

    // Type in search field
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Fast forward debounce time
    jest.advanceTimersByTime(300);

    // Search should be triggered after debounce
    expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
    expect(mockOnSearch).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  test('clear button resets search input', () => {
    renderWithContext(<SearchBar onSearch={mockOnSearch} searchAsYouType={false} />);

    const searchInput = screen.getByRole('textbox', { name: /search/i });

    // Type in search field
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Clear button should appear
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();

    // Click clear button
    fireEvent.click(clearButton);

    // Input should be cleared
    expect(searchInput).toHaveValue('');
  });

  test('renders filter dropdowns when provided', () => {
    const filters = [
      {
        name: 'status',
        label: 'Status',
        options: [
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
        defaultValue: 'all',
      },
    ];

    renderWithContext(
      <SearchBar onSearch={mockOnSearch} searchAsYouType={false} filters={filters} />
    );

    // Filter dropdown should be in the document
    const filterDropdown = screen.getByRole('combobox', { name: /status/i });
    expect(filterDropdown).toBeInTheDocument();

    // Should have 3 options
    expect(screen.getAllByRole('option').length).toBe(3);
  });

  test('submits both query and filters when search button is clicked', () => {
    const filters = [
      {
        name: 'status',
        label: 'Status',
        options: [
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
        defaultValue: 'all',
      },
    ];

    renderWithContext(
      <SearchBar onSearch={mockOnSearch} searchAsYouType={false} filters={filters} />
    );

    const searchInput = screen.getByRole('textbox', { name: /search/i });
    const filterDropdown = screen.getByRole('combobox', { name: /status/i });
    const searchButton = screen.getByRole('button', { name: /submit search/i });

    // Set search query and filter
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.change(filterDropdown, { target: { value: 'active' } });

    // Click search button
    fireEvent.click(searchButton);

    // Search should be triggered with both query and filter
    expect(mockOnSearch).toHaveBeenCalledWith('test query', { status: 'active' });
  });

  test('visual indicator shows when there are unsearched changes', () => {
    renderWithContext(
      <SearchBar onSearch={mockOnSearch} initialQuery="initial" searchAsYouType={false} />
    );

    const searchInput = screen.getByRole('textbox', { name: /search/i });

    // Initially no visual indicator (since initialQuery matches submittedQuery)
    expect(screen.queryByText('', { selector: '.animate-ping' })).not.toBeInTheDocument();

    // Change search input
    fireEvent.change(searchInput, { target: { value: 'changed query' } });

    // Visual indicator should now be visible
    expect(screen.queryByText('', { selector: '.animate-ping' })).toBeInTheDocument();

    // Submit search
    const searchButton = screen.getByRole('button', { name: /submit search/i });
    fireEvent.click(searchButton);

    // Visual indicator should disappear
    expect(screen.queryByText('', { selector: '.animate-ping' })).not.toBeInTheDocument();
  });
});
