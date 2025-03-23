/**
 * Adapted SearchBar Component Tests for React 19
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../SearchBar';

// Mock the theme context to provide the required values
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
  ThemeProvider: ({ children }) => <div>{children}</div>
}));

// Create a test component wrapper that will properly handle the onSearch callback
const TestSearchBar = ({ onSearch = jest.fn(), ...props }) => {
  return (
    <SearchBar
      onSearch={(query, filters) => {
        // This wrapper ensures the onSearch is properly called
        // and accessible in tests
        onSearch(query, filters);
      }}
      {...props}
    />
  );
};

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnSearch.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders correctly with default props', () => {
    render(<TestSearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    // Clear button should not be visible when there is no text
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('shows clear button when there is text in the input', () => {
    render(<TestSearchBar onSearch={mockOnSearch} initialQuery="test query" />);
    
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('renders filter dropdowns when provided', () => {
    const filters = [
      {
        name: 'status',
        label: 'Status',
        options: [
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]
      }
    ];

    render(<TestSearchBar onSearch={mockOnSearch} filters={filters} />);
    
    // Check if filter dropdown exists
    const filterSelect = screen.getByLabelText('Status');
    expect(filterSelect).toBeInTheDocument();
    
    // Check if filter options are rendered
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('shows search button when searchAsYouType is false', () => {
    render(<TestSearchBar onSearch={mockOnSearch} searchAsYouType={false} />);
    
    expect(screen.getByLabelText('Submit search')).toBeInTheDocument();
  });
});