/**
 * SearchBar Component Tests
 */

import { renderWithTheme, screen, waitFor, setupUser } from '@/test-utils';
import '@testing-library/jest-dom';
import SearchBar from '../SearchBar';

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
    renderWithTheme(<SearchBar onSearch={mockOnSearch} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    // Clear button should not be visible when there is no text
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('renders correctly in dark mode', () => {
    renderWithTheme(<SearchBar onSearch={mockOnSearch} />, { themeMode: 'dark' });
    
    // Verify the theme provider is rendering with dark mode
    expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows clear button when there is text in the input', () => {
    renderWithTheme(<SearchBar onSearch={mockOnSearch} initialQuery="test query" />);

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('calls onSearch when clear button is clicked', async () => {
    const user = setupUser();
    renderWithTheme(<SearchBar onSearch={mockOnSearch} initialQuery="test query" />);

    await user.click(screen.getByLabelText('Clear search'));

    expect(mockOnSearch).toHaveBeenCalledWith('', {});
  });

  it('debounces search as you type', async () => {
    const user = setupUser();
    renderWithTheme(<SearchBar onSearch={mockOnSearch} debounceMs={300} />);

    await user.type(screen.getByRole('textbox'), 'test');

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

    renderWithTheme(<SearchBar onSearch={mockOnSearch} filters={filters} />);

    // Check if filter dropdown exists
    const filterSelect = screen.getByLabelText('Status');
    expect(filterSelect).toBeInTheDocument();

    // Check if filter options are rendered
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('triggers search when filter changes', async () => {
    const user = setupUser();
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

    renderWithTheme(
      <SearchBar onSearch={mockOnSearch} filters={filters} initialQuery="test" debounceMs={0} />
    );

    // Change filter value
    await user.selectOptions(screen.getByLabelText('Status'), 'active');

    // Check if search was triggered with both query and filter
    expect(mockOnSearch).toHaveBeenCalledWith('test', { status: 'active' });
  });

  it('shows search button when searchAsYouType is false', () => {
    renderWithTheme(<SearchBar onSearch={mockOnSearch} searchAsYouType={false} />);

    expect(screen.getByLabelText('Submit search')).toBeInTheDocument();
  });

  it('triggers search on form submission when searchAsYouType is false', async () => {
    const user = setupUser();
    renderWithTheme(<SearchBar onSearch={mockOnSearch} searchAsYouType={false} initialQuery="test query" />);

    // Get the form using DOM structure instead of role
    const form = screen.getByLabelText('Submit search').closest('form');
    await user.click(screen.getByLabelText('Submit search'));

    expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
  });
});
