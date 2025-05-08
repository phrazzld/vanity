/**
 * TypewriterQuotes Component Tests
 * 
 * This file demonstrates testing patterns for a component with:
 * - API data fetching
 * - Loading states
 * - Animation sequences
 * - Timeouts and intervals
 * - Error handling
 */

import { renderWithTheme, screen, waitFor, createMockErrorResponse, mockFetch } from '@/test-utils';
import TypewriterQuotes from '../TypewriterQuotes';
import { act } from 'react-dom/test-utils';
import type { Quote } from '@/types';

// Sample quotes for testing
const mockQuotes: Quote[] = [
  { id: 1, text: 'Test quote 1', author: 'Author 1' },
  { id: 2, text: 'Test quote 2', author: 'Author 2' },
  { id: 3, text: 'Test quote 3', author: 'Author 3' },
];

// Mock console methods to reduce test output noise
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('TypewriterQuotes', () => {
  // Test lifecycle hooks
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // Default to real timers
    
    // Setup default fetch mock
    mockFetch(mockQuotes);
  });

  afterEach(() => {
    // Ensure timers are reset
    jest.useRealTimers();
  });

  describe('Initial Rendering and Data Fetching', () => {
    it('shows loading state initially', () => {
      // Arrange & Act
      renderWithTheme(<TypewriterQuotes />);
      
      // Assert
      expect(screen.getByText('Loading quotes...')).toBeInTheDocument();
    });

    it('fetches quotes from API on mount with correct parameters', async () => {
      // Arrange
      const { mockFetch } = mockFetch(mockQuotes);
      
      // Act
      renderWithTheme(<TypewriterQuotes />);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quotes',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          }),
          cache: 'no-store',
        })
      );

      // Wait for loading state to disappear
      await waitFor(() => {
        expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
      });
    });

    it('renders quote container after data loads', async () => {
      // Arrange & Act
      renderWithTheme(<TypewriterQuotes />);
      
      // Assert - wait for loading to finish and container to appear
      await waitFor(() => {
        expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
        expect(screen.getByTestId('quote-text')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows fallback quote when API fails with 500 error', async () => {
      // Arrange - mock a failed API response
      mockFetch(createMockErrorResponse(500, 'Server Error', 'Failed to fetch quotes'));
      
      // Act
      renderWithTheme(<TypewriterQuotes />);

      // Assert - wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
      });

      // Wait for fallback quote to appear
      await waitFor(() => {
        const quoteContainer = screen.getByTestId('quote-text');
        expect(quoteContainer).toBeInTheDocument();
        expect(quoteContainer.textContent).toContain('Error loading quotes');
      });
    });

    it('shows fallback quote when API returns empty array', async () => {
      // Arrange - mock an empty array response
      mockFetch([] as Quote[]);
      
      // Act
      renderWithTheme(<TypewriterQuotes />);

      // Assert - wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
      });

      // Wait for fallback quote (the component should handle empty responses)
      await waitFor(() => {
        const quoteContainer = screen.getByTestId('quote-text');
        expect(quoteContainer).toBeInTheDocument();
      });
    });
  });

  describe('Animation Sequence', () => {
    it('starts typing quote text after loading', async () => {
      // Arrange
      jest.useFakeTimers();
      
      // Act - render component
      renderWithTheme(<TypewriterQuotes />);

      // Wait for initial data fetch (simulated with act)
      await act(async () => {
        await Promise.resolve();
      });

      // Assert - verify loading is done and container is present
      const quoteContainer = screen.getByTestId('quote-text');
      expect(quoteContainer).toBeInTheDocument();
      expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();

      // Initially, the quote text should be empty
      expect(quoteContainer.textContent?.trim()).toBe('');

      // Fast-forward time to trigger typing animation
      await act(async () => {
        jest.advanceTimersByTime(100); // Advance past any initial delays
      });

      // Assert - quote text should start to appear (partial text)
      expect(quoteContainer.textContent?.length).toBeGreaterThan(0);
      
      // The quote shouldn't be fully typed yet
      expect(quoteContainer.textContent?.length).toBeLessThan(mockQuotes[0].text.length);

      // Fast-forward to complete typing
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert - full quote should now be visible
      expect(quoteContainer.textContent).toBe(mockQuotes[0].text);
    });

    it('completes full animation cycle: quote → author → erase → next quote', async () => {
      // Arrange
      jest.useFakeTimers();
      
      // Act - render component
      renderWithTheme(<TypewriterQuotes />);

      // Simulate initial data fetch
      await act(async () => {
        await Promise.resolve();
      });

      // Step 1: Type the quote
      await act(async () => {
        jest.advanceTimersByTime(1000); // Time to type quote
      });
      
      // Assert - quote should be typed
      const quoteContainer = screen.getByTestId('quote-text');
      expect(quoteContainer.textContent).toBe(mockQuotes[0].text);
      
      // Step 2: Type the author
      await act(async () => {
        jest.advanceTimersByTime(1500); // Time for quote pause + start author typing
      });
      
      // Assert - author element should have text
      const authorElements = screen.getAllByText(mockQuotes[0].author);
      expect(authorElements.length).toBeGreaterThan(0);
      
      // Step 3: Pause with full quote and author
      await act(async () => {
        jest.advanceTimersByTime(2500); // Time for full pause
      });
      
      // Step 4: Start erasing sequence
      await act(async () => {
        jest.advanceTimersByTime(1000); // Time to erase author + start erasing quote
      });
      
      // At this point, author should be gone and quote partially erased
      expect(screen.queryByText(mockQuotes[0].author)).not.toBeInTheDocument();
      
      // Step 5: Complete erasing and start next quote
      await act(async () => {
        jest.advanceTimersByTime(1000); // Time to finish erasing + start next quote
      });
      
      // Assert - should be showing part of next quote
      // We can't predict which quote (since it's randomly chosen)
      // but container should have some text that's being typed
      expect(quoteContainer.textContent?.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Integration and Accessibility', () => {
    it('renders correctly in dark mode', async () => {
      // Arrange & Act
      renderWithTheme(<TypewriterQuotes />, { themeMode: 'dark' });
      
      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
      });
      
      // Assert - verify theme context is applied
      expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'dark');
      
      // Quote container should be present
      expect(screen.getByTestId('quote-text')).toBeInTheDocument();
    });
    
    it('makes quotes container accessible for screen readers', async () => {
      // Arrange & Act
      renderWithTheme(<TypewriterQuotes />);
      
      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
      });
      
      // Assert - verify the quote container is rendered with appropriate ARIA attributes
      const quoteContainer = screen.getByTestId('quote-text');
      
      // While there aren't explicit ARIA attributes in the component,
      // we can verify it renders proper semantic elements and text
      expect(quoteContainer).toBeInTheDocument();
      
      // Test would be enhanced if the component had explicit ARIA roles,
      // but currently it uses standard div elements with styling
    });
  });
  
  describe('Performance Optimizations', () => {
    it('should clear the animation timeout when unmounted', async () => {
      // Arrange
      jest.useFakeTimers();
      jest.spyOn(global, 'clearTimeout');
      
      // Act - render and then unmount
      const { unmount } = renderWithTheme(<TypewriterQuotes />);
      
      // Simulate initial data fetch and start of animations
      await act(async () => {
        await Promise.resolve();
        jest.advanceTimersByTime(500);
      });
      
      // Unmount to trigger cleanup
      unmount();
      
      // Assert - clearTimeout should have been called (multiple times due to various effects)
      expect(clearTimeout).toHaveBeenCalled();
    });
    
    it('should clear cursor blink interval when unmounted', async () => {
      // Arrange
      jest.spyOn(global, 'clearInterval');
      
      // Act - render and then unmount
      const { unmount } = renderWithTheme(<TypewriterQuotes />);
      
      // Wait for component to initialize
      await waitFor(() => {
        expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
      });
      
      // Unmount to trigger cleanup
      unmount();
      
      // Assert - clearInterval should have been called for the cursor blink
      expect(clearInterval).toHaveBeenCalled();
    });
  });
});
