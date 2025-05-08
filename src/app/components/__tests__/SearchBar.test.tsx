/**
 * SearchBar Component Tests
 * 
 * This file demonstrates various testing patterns and best practices for testing
 * the SearchBar component, which is an interactive component with theme support,
 * debounced input handling, and multiple states.
 */

import { renderWithTheme, screen, waitFor, setupUser } from '@/test-utils';
import '@testing-library/jest-dom';
import SearchBar from '../SearchBar';
import type { FilterConfig } from '../SearchBar';

describe('SearchBar Component', () => {
  // Mock props and handlers
  const mockOnSearch = jest.fn();
  
  // Sample filter configuration for tests
  const sampleFilters: FilterConfig[] = [
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

  // Test setup and cleanup
  beforeEach(() => {
    jest.useFakeTimers();
    mockOnSearch.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Group related tests together
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      // Arrange
      renderWithTheme(<SearchBar onSearch={mockOnSearch} />);

      // Assert - check essential elements are present
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      
      // Clear button should not be visible when there is no text
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
      
      // Form should exist
      expect(screen.getByRole('textbox').closest('form')).toBeInTheDocument();
    });

    it('renders correctly with custom placeholder and initial query', () => {
      // Arrange
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          placeholder="Find something..." 
          initialQuery="initial search"
        />
      );

      // Assert
      expect(screen.getByPlaceholderText('Find something...')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveValue('initial search');
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('renders correctly in dark mode', () => {
      // Arrange
      renderWithTheme(<SearchBar onSearch={mockOnSearch} />, { themeMode: 'dark' });
      
      // Assert - verify theme provider and component rendered correctly
      expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'dark');
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      
      // Note: For more comprehensive theme testing, you could check if specific
      // theme-dependent styles are applied by using getComputedStyle
    });

    it('renders filter dropdowns when provided', () => {
      // Arrange
      renderWithTheme(<SearchBar onSearch={mockOnSearch} filters={sampleFilters} />);

      // Assert - check if filter dropdown exists
      const filterSelect = screen.getByLabelText('Status');
      expect(filterSelect).toBeInTheDocument();
      expect(filterSelect.tagName).toBe('SELECT');

      // Check if filter options are rendered
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('shows search button when searchAsYouType is false', () => {
      // Arrange
      renderWithTheme(<SearchBar onSearch={mockOnSearch} searchAsYouType={false} />);

      // Assert
      const searchButton = screen.getByLabelText('Submit search');
      expect(searchButton).toBeInTheDocument();
      expect(searchButton.tagName).toBe('BUTTON');
    });
  });

  describe('User Interactions', () => {
    it('shows clear button when there is text in the input', () => {
      // Arrange
      renderWithTheme(<SearchBar onSearch={mockOnSearch} initialQuery="test query" />);

      // Assert
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toBeVisible();
    });

    it('calls onSearch when clear button is clicked', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<SearchBar onSearch={mockOnSearch} initialQuery="test query" />);

      // Act
      await user.click(screen.getByLabelText('Clear search'));

      // Assert - search should be called with empty query
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('', {});
      
      // Input should be cleared
      expect(screen.getByRole('textbox')).toHaveValue('');
      
      // Clear button should now be hidden
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('debounces search as you type with searchAsYouType=true', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          debounceMs={300} 
          searchAsYouType={true}
        />
      );

      // Act - type in search box
      await user.type(screen.getByRole('textbox'), 'test');

      // Assert - search should not be called immediately
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - advance timers by less than debounce time
      jest.advanceTimersByTime(200);
      
      // Assert - search should still not be called
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Act - advance timers to complete debounce
      jest.advanceTimersByTime(100);
      
      // Assert - search should now be called
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('test', {});
    });

    it('triggers search when filter changes with filtersUpdateOnChange=true', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          filters={sampleFilters} 
          initialQuery="test" 
          debounceMs={0}
          filtersUpdateOnChange={true}
        />
      );

      // Act - change filter value
      await user.selectOptions(screen.getByLabelText('Status'), 'active');

      // Assert - search should be triggered with both query and filter
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('test', { status: 'active' });
    });

    it('does not trigger search when filter changes with filtersUpdateOnChange=false', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          filters={sampleFilters}
          initialQuery="test" 
          debounceMs={0}
          filtersUpdateOnChange={false}
          searchAsYouType={false}
        />
      );

      // Act - change filter value
      await user.selectOptions(screen.getByLabelText('Status'), 'active');

      // Assert - search should not be triggered
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('triggers search on form submission when searchAsYouType is false', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          searchAsYouType={false} 
          initialQuery="test query"
        />
      );

      // Act - click search button
      await user.click(screen.getByLabelText('Submit search'));

      // Assert - search should be triggered
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
    });
    
    it('submits form on Enter key when searchAsYouType is false', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          searchAsYouType={false} 
          initialQuery="test query"
        />
      );

      // Act - focus input and press Enter
      const input = screen.getByRole('textbox');
      input.focus();
      await user.keyboard('{Enter}');

      // Assert - search should be triggered
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
    });
  });

  describe('Complex Interactions', () => {
    it('combines text input and filter selection correctly', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          filters={sampleFilters}
          debounceMs={0}
          searchAsYouType={true}
          filtersUpdateOnChange={true}
        />
      );

      // Act 1 - type in search box
      await user.type(screen.getByRole('textbox'), 'test');
      
      // Assert 1
      expect(mockOnSearch).toHaveBeenCalledWith('test', { status: '' });
      
      // Act 2 - change filter
      await user.selectOptions(screen.getByLabelText('Status'), 'active');
      
      // Assert 2 - should call with both text and filter
      expect(mockOnSearch).toHaveBeenCalledWith('test', { status: 'active' });
      expect(mockOnSearch).toHaveBeenCalledTimes(2);
    });

    it('handles clearing search with active filters correctly', async () => {
      // Arrange - search with filter active
      const user = setupUser();
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          filters={sampleFilters}
          initialQuery="test query"
          searchAsYouType={true}
        />
      );
      
      // Setup active filter
      await user.selectOptions(screen.getByLabelText('Status'), 'active');
      mockOnSearch.mockClear(); // Clear previous calls
      
      // Act - clear search
      await user.click(screen.getByLabelText('Clear search'));
      
      // Assert - should call with empty query but maintain filter
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('', { status: 'active' });
    });

    it('properly debounces rapid typing', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          debounceMs={300}
          searchAsYouType={true}
        />
      );

      // Act - type rapidly
      const input = screen.getByRole('textbox');
      
      // Type first characters
      await user.type(input, 'test');
      
      // Advance timer partially
      jest.advanceTimersByTime(200);
      
      // Type more before debounce triggers
      await user.type(input, ' query');
      
      // Reset the timer by typing more (debounce should restart)
      jest.advanceTimersByTime(200);
      
      // Assert - search should not be called yet
      expect(mockOnSearch).not.toHaveBeenCalled();
      
      // Advance to complete debounce
      jest.advanceTimersByTime(300);
      
      // Assert - search should be called once with final value
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
    });

    it('applies different button styles based on variant prop', () => {
      // Arrange & Act - render with different button variants
      const { rerender } = renderWithTheme(
        <SearchBar 
          onSearch={mockOnSearch} 
          searchAsYouType={false} 
          buttonVariant="primary"
        />
      );
      
      // Get button element
      const primaryButton = screen.getByLabelText('Submit search');
      
      // Assert primary button has appropriate classes
      expect(primaryButton.className).toContain('bg-blue-600');
      expect(primaryButton.className).toContain('text-white');
      
      // Rerender with secondary variant
      rerender(
        <SearchBar 
          onSearch={mockOnSearch} 
          searchAsYouType={false} 
          buttonVariant="secondary"
        />
      );
      
      // Get updated button
      const secondaryButton = screen.getByLabelText('Submit search');
      
      // Assert secondary button has appropriate classes
      expect(secondaryButton.className).toContain('bg-white');
      expect(secondaryButton.className).toContain('border-gray-300');
    });
  });
});
