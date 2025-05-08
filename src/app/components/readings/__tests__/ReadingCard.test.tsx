/**
 * ReadingCard Component Tests
 * 
 * This file demonstrates testing patterns for a complex UI component with:
 * - Interactive animations and hover states
 * - Theme context integration
 * - Accessibility attributes
 * - Different status rendering based on props
 * - Image handling with fallbacks
 * - Responsive behavior
 * - Touch device detection
 */

import { renderWithTheme, screen, setupUser } from '@/test-utils';
import ReadingCard from '../ReadingCard';
import type { ReadingListItem } from '@/types';

// Mock the getSeededPlaceholderStyles function
jest.mock('../placeholderUtils', () => ({
  getSeededPlaceholderStyles: jest.fn().mockReturnValue({
    backgroundColor: '#f0f4f8',
    backgroundImage: 'linear-gradient(135deg, #e0e8f0 25%, transparent 25%)',
  }),
}));

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // Convert boolean to string for attributes like "fill"
    const imgProps = Object.keys(props).reduce((acc, key) => {
      if (typeof props[key] === 'boolean') {
        acc[key] = props[key].toString();
      } else {
        acc[key] = props[key];
      }
      return acc;
    }, {});
    
    return React.createElement(
      'div',
      {
        'data-testid': 'mock-image',
        style: { width: imgProps.width, height: imgProps.height },
        alt: imgProps.alt || '',
        src: imgProps.src || '',
      },
      `Mock Image: ${imgProps.alt || ''}`
    );
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SPACES_BASE_URL = 'https://test-space.com';

// Sample test data with fixed date for consistent testing
const TEST_DATE = '2022-12-15';

// Create reusable mock props for the various test cases
const createMockProps = (overrides = {}): ReadingListItem => ({
  slug: 'test-book',
  title: 'Test Book',
  author: 'Test Author',
  coverImageSrc: '/covers/test-book.jpg',
  dropped: false,
  finishedDate: TEST_DATE,
  ...overrides,
});

describe('ReadingCard Component', () => {
  // Setup and cleanup
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.navigator.maxTouchPoints for touch device detection
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0, // Default to non-touch device
    });
    
    // Mock matchMedia for testing media queries
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  describe('Rendering Different States', () => {
    it('renders with cover image in light mode', () => {
      // Arrange & Act
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Assert
      const card = screen.getByTitle('Test Book');
      expect(card).toBeInTheDocument();
      
      // Check image is rendered with correct src
      const image = screen.getByTestId('mock-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://test-space.com/covers/test-book.jpg');
    });

    it('renders with cover image in dark mode', () => {
      // Arrange & Act
      renderWithTheme(<ReadingCard {...createMockProps()} />, { themeMode: 'dark' });

      // Assert - verify theme context
      expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'dark');
      
      // Card and cover should render
      const card = screen.getByTitle('Test Book');
      expect(card).toBeInTheDocument();
      expect(screen.getByTestId('mock-image')).toBeInTheDocument();
    });

    it('renders without cover image using placeholder', () => {
      // Arrange & Act
      renderWithTheme(<ReadingCard {...createMockProps({ coverImageSrc: null })} />);

      // Assert
      const card = screen.getByTitle('Test Book');
      expect(card).toBeInTheDocument();

      // No image should be rendered
      expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument();
      
      // Card should still render with proper dimensions
      expect(card).toHaveStyle('aspectRatio: 2 / 3');
    });

    it('shows "Reading paused" status when dropped=true', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps({ dropped: true })} />);

      // Act - simulate hover to reveal status
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - verify status text
      expect(screen.getByText('Reading paused')).toBeInTheDocument();
      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    });

    it('shows "Currently reading" status when finishedDate=null', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps({ finishedDate: null })} />);

      // Act - simulate hover
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - verify status text
      expect(screen.getByText('Currently reading')).toBeInTheDocument();
    });

    it('shows "Finished [date]" status when book is completed', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Act - simulate hover
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - verify date is formatted properly (Dec 2022)
      expect(screen.getByText('Finished Dec 2022')).toBeInTheDocument();
    });
  });

  describe('Animation and Interaction', () => {
    it('shows book metadata when hovered', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Initial state - title and author should not be visible
      expect(screen.queryByTestId('book-title')).not.toBeVisible();
      expect(screen.queryByTestId('book-author')).not.toBeVisible();

      // Act - hover the card
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - metadata should be revealed
      const bookTitle = screen.getByTestId('book-title');
      expect(bookTitle).toBeVisible();
      expect(bookTitle).toHaveTextContent('Test Book');

      const bookAuthor = screen.getByTestId('book-author');
      expect(bookAuthor).toBeVisible();
      expect(bookAuthor).toHaveTextContent('Test Author');
    });
    
    it('applies ribbon unfurl animation when mouse enters', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Get the card element
      const card = screen.getByTitle('Test Book');

      // Get the ribbon container before hover
      const ribbonContainer = screen.getByTestId('ribbon-container');
      
      // Initial state checks
      expect(ribbonContainer).toHaveStyle('opacity: 0');
      expect(ribbonContainer).toHaveStyle('visibility: hidden');
      expect(ribbonContainer).toHaveStyle('transform: translateY(15px) scale(0.98)');
      expect(ribbonContainer).toHaveStyle('minHeight: 0');

      // Act - hover the card
      await user.hover(card);

      // Assert - verify animation styles
      expect(ribbonContainer).toHaveStyle('opacity: 1');
      expect(ribbonContainer).toHaveStyle('visibility: visible');
      expect(ribbonContainer).toHaveStyle('transform: translateY(0) scale(1)');
      expect(ribbonContainer).toHaveStyle('minHeight: 100px'); // Expanded state

      // Card itself should transform
      expect(card).toHaveStyle('transform: translateY(-4px) scale(1.01)');
      
      // Status information should be visible
      expect(screen.getByTestId('status-icon')).toBeVisible();
      expect(screen.getByTestId('status-text')).toBeVisible();
    });

    it('collapses ribbon when mouse leaves', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Get the card element
      const card = screen.getByTitle('Test Book');

      // Act - hover then unhover
      await user.hover(card);
      await user.unhover(card);

      // Assert - check ribbon container
      const ribbonContainer = screen.getByTestId('ribbon-container');
      expect(ribbonContainer).toHaveStyle('opacity: 0');
      expect(ribbonContainer).toHaveStyle('transform: translateY(15px) scale(0.98)');

      // Card animation should reset
      expect(card).toHaveStyle('transform: translateY(0) scale(1)');
    });
    
    it('handles touch devices differently by detecting maxTouchPoints', async () => {
      // Arrange - mock a touch device
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 2 });
      
      const user = setupUser();
      const { rerender } = renderWithTheme(<ReadingCard {...createMockProps()} />);
      
      // Need to rerender after changing navigator properties
      rerender(<ReadingCard {...createMockProps()} />);
      
      // Act - simulate touch
      const card = screen.getByTitle('Test Book');
      await user.hover(card); // Using hover as a stand-in for touch

      // Touch devices should show info on "touch" (hover in our simulation)
      expect(screen.getByTestId('ribbon-container')).toHaveStyle('opacity: 1');
      
      // Metadata should be visible
      expect(screen.getByTestId('book-title')).toBeVisible();
      expect(screen.getByTestId('book-author')).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('provides appropriate ARIA labels with book details', () => {
      // Arrange & Act
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Assert - check aria-label on the main container
      const card = screen.getByTitle('Test Book');
      expect(card).toHaveAttribute(
        'aria-label',
        'Book: Test Book by Test Author, Status: Finished on Dec 2022'
      );
    });
    
    it('provides appropriate ARIA labels for currently reading books', () => {
      // Arrange & Act - render currently reading card
      renderWithTheme(<ReadingCard {...createMockProps({ finishedDate: null })} />);

      // Assert
      const card = screen.getByTitle('Test Book');
      expect(card).toHaveAttribute(
        'aria-label',
        'Book: Test Book by Test Author, Status: Currently Reading'
      );
    });
    
    it('provides appropriate ARIA labels for paused books', () => {
      // Arrange & Act - render paused reading card
      renderWithTheme(<ReadingCard {...createMockProps({ dropped: true })} />);

      // Assert
      const card = screen.getByTitle('Test Book');
      expect(card).toHaveAttribute(
        'aria-label',
        'Book: Test Book by Test Author, Status: Reading Paused'
      );
    });

    it('sets aria-hidden on ribbon when not hovered', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Get the ribbon container
      const ribbonContainer = screen.getByTestId('ribbon-container');
      
      // Initial state (not hovered)
      expect(ribbonContainer).toHaveAttribute('aria-hidden', 'true');
      
      // Act - hover the card
      const card = screen.getByTitle('Test Book');
      await user.hover(card);
      
      // Assert - ribbon should no longer be hidden
      expect(ribbonContainer).toHaveAttribute('aria-hidden', 'false');
      
      // Act - unhover
      await user.unhover(card);
      
      // Assert - ribbon should be hidden again
      expect(ribbonContainer).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Status-Specific Styling', () => {
    it('applies "currently reading" specific styles', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps({ finishedDate: null })} />);

      // Act - hover to reveal the status
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - status icon and text should have reading-specific styling
      const statusText = screen.getByText('Currently reading');
      
      // Currently reading status should have the subtle left line
      const statusContainer = statusText.closest('.reading-status');
      expect(statusContainer).toHaveStyle('paddingLeft: 7px');
      expect(statusContainer).toHaveStyle('borderLeft: 2px solid rgba(255, 255, 255, 0.35)');
    });

    it('applies "finished" specific styles', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Act - hover to reveal the status
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - finished status should have specific styling
      const statusText = screen.getByText(/Finished/);
      expect(statusText).toBeInTheDocument();
      
      // The status icon for finished books should use the finished icon component
      const statusIcon = screen.getByTestId('status-icon').querySelector('svg');
      expect(statusIcon).toBeInTheDocument();
    });

    it('applies "paused" specific styles', async () => {
      // Arrange
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps({ dropped: true })} />);

      // Act - hover to reveal the status
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - paused books have specific styling
      const statusText = screen.getByText('Reading paused');
      expect(statusText).toBeInTheDocument();
      
      // The container for paused status has lower opacity
      const statusContainer = statusText.closest('.reading-status');
      // Note: can't easily test the reduced opacity as its conditional to the hover state
      expect(statusContainer).toHaveClass('paused-status');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles gracefully', async () => {
      // Arrange - book with extremely long title
      const longTitle = 'This is an extremely long book title that would normally wrap or overflow in normal circumstances but should be handled gracefully by the component';
      const user = setupUser();
      
      renderWithTheme(<ReadingCard {...createMockProps({ title: longTitle })} />);

      // Act - hover to reveal title
      const card = screen.getByTitle(longTitle);
      await user.hover(card);

      // Assert - title should be contained in the ribbon (not overflow the container)
      const titleElement = screen.getByTestId('book-title');
      expect(titleElement).toBeInTheDocument();
      
      // Title has ellipsis style for overflow
      expect(titleElement).toHaveStyle('overflow: hidden');
      expect(titleElement).toHaveStyle('textOverflow: ellipsis');
      expect(titleElement).toHaveStyle('display: -webkit-box');
      expect(titleElement).toHaveStyle('WebkitLineClamp: 3');
    });

    it('handles empty author gracefully', async () => {
      // Arrange - book with no author
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps({ author: '' })} />);

      // Act - hover to reveal details
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - author element should still exist but be empty
      const authorElement = screen.getByTestId('book-author');
      expect(authorElement).toBeInTheDocument();
      expect(authorElement.textContent).toBe('');
    });
  });
});
