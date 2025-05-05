/**
 * SearchBar Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../SearchBar';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock the theme context to provide the required values
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnSearch.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with default props', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    // Clear button should not be visible when there is no text
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('shows clear button when there is text in the input', () => {
    render(<SearchBar onSearch={mockOnSearch} initialQuery="test query" />);

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('calls onSearch when clear button is clicked', () => {
    render(<SearchBar onSearch={mockOnSearch} initialQuery="test query" />);

    fireEvent.click(screen.getByLabelText('Clear search'));

    expect(mockOnSearch).toHaveBeenCalledWith('', {});
  });

  it('debounces search as you type', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={300} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });

    // Search should not be called immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Advance timers and check if search was called after debounce
    jest.advanceTimersByTime(300);
    expect(mockOnSearch).toHaveBeenCalledWith('test', {});
  });

  it('renders filter dropdowns when provided', () => {
    const filters = [
      {
        name: 'status',
        label: 'Status',
        options: [
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
    ];

    render(<SearchBar onSearch={mockOnSearch} filters={filters} />);

    // Check if filter dropdown exists
    const filterSelect = screen.getByLabelText('Status');
    expect(filterSelect).toBeInTheDocument();

    // Check if filter options are rendered
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('triggers search when filter changes', () => {
    const filters = [
      {
        name: 'status',
        label: 'Status',
        options: [
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
        ],
      },
    ];

    render(
      <SearchBar onSearch={mockOnSearch} filters={filters} initialQuery="test" debounceMs={0} />
    );

    // Change filter value
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'active' } });

    // Check if search was triggered with both query and filter
    expect(mockOnSearch).toHaveBeenCalledWith('test', { status: 'active' });
  });

  it('shows search button when searchAsYouType is false', () => {
    render(<SearchBar onSearch={mockOnSearch} searchAsYouType={false} />);

    expect(screen.getByLabelText('Submit search')).toBeInTheDocument();
  });

  it('triggers search on form submission when searchAsYouType is false', () => {
    render(<SearchBar onSearch={mockOnSearch} searchAsYouType={false} initialQuery="test query" />);

    // Get the form using DOM structure instead of role
    const form = screen.getByLabelText('Submit search').closest('form');
    fireEvent.submit(form);

    expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
  });
});
