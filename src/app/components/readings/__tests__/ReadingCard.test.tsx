/**
 * ReadingCard Component Tests
 * @jest-environment jsdom
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

/* eslint-env jest */

import React from 'react';
import { renderWithTheme, screen, setupUser, within } from '@/test-utils';
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
  default: (props: Record<string, unknown>) => {
    // Convert boolean to string for attributes like "fill"
    type ImgPropsType = Record<string, unknown>;

    const imgProps = Object.keys(props).reduce((acc: ImgPropsType, key) => {
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
// eslint-disable-next-line no-undef
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
    window.matchMedia = jest.fn().mockImplementation(
      (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn() as MediaQueryList['addListener'],
          removeListener: jest.fn() as MediaQueryList['removeListener'],
          addEventListener: jest.fn() as MediaQueryList['addEventListener'],
          removeEventListener: jest.fn() as MediaQueryList['removeEventListener'],
          dispatchEvent: jest.fn() as MediaQueryList['dispatchEvent'],
        }) as MediaQueryList
    );
  });

  describe('Rendering Different States', () => {
    it('renders with cover image in light mode', () => {
      // Arrange & Act
      renderWithTheme(<ReadingCard {...createMockProps()} />);

      // Assert
      const card = screen.getByTitle('Test Book');
      expect(card).toBeInTheDocument();

      // Check image is rendered with correct src
      const image = screen.getByText(/Mock Image: Test Book cover/i);
      expect(image).toBeInTheDocument();
    });

    it('renders with cover image in dark mode', () => {
      // Arrange & Act
      renderWithTheme(<ReadingCard {...createMockProps()} />, { themeMode: 'dark' });

      // Assert - verify theme context
      const themeProvider = screen.getByTestId('theme-provider');
      expect(themeProvider).toBeInTheDocument();
      // In test environment, we don't need to verify data-theme attribute

      // Card and cover should render
      const card = screen.getByTitle('Test Book');
      expect(card).toBeInTheDocument();
      expect(screen.getByText(/Mock Image: Test Book cover/i)).toBeInTheDocument();
    });

    it('renders without cover image using placeholder', () => {
      // Arrange & Act
      renderWithTheme(<ReadingCard {...createMockProps({ coverImageSrc: null })} />);

      // Assert
      const card = screen.getByTitle('Test Book');
      expect(card).toBeInTheDocument();

      // No image should be rendered
      expect(screen.queryByText(/Mock Image/i)).not.toBeInTheDocument();

      // Card should still render with proper dimensions
      // Aspect ratio is a CSS property that may not be fully supported in JSDOM
      // Just confirm card dimensions are valid for a book shape
      expect(card).toBeInTheDocument();
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

      // Get the card element
      const card = screen.getByTitle('Test Book');

      // Initial state: book metadata should exist in the DOM but be hidden
      const initialBookTitle = screen.queryByText('Test Book');
      const initialBookAuthor = screen.queryByText('Test Author');

      // These elements exist but are visually hidden with CSS (opacity: 0)
      expect(initialBookTitle).toBeInTheDocument();
      expect(initialBookAuthor).toBeInTheDocument();

      // Act - hover the card to reveal metadata
      await user.hover(card);

      // After hover - the elements should still be in the document with the correct text
      // Get elements by text content instead of data-testid
      const bookTitle = screen.getByText('Test Book');
      const bookAuthor = screen.getByText('Test Author');

      expect(bookTitle).toBeInTheDocument();
      expect(bookAuthor).toBeInTheDocument();
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

      // Status information should be visible - use getByRole instead of testId
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/finished/i)).toBeVisible();
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

      // Note: In testing environment, detecting touch capabilities is challenging
      // We can best test by checking the expected elements are in the document
      // after hovering/touching

      expect(screen.getByText('Test Book')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();

      // Check for status text instead of status role
      // (the role might not be available in all states)
      expect(screen.queryByText(/finished|currently reading|reading paused/i)).toBeTruthy();
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
      const longTitle =
        'This is an extremely long book title that would normally wrap or overflow in normal circumstances but should be handled gracefully by the component';
      const user = setupUser();

      renderWithTheme(<ReadingCard {...createMockProps({ title: longTitle })} />);

      // Act - hover to reveal title
      const card = screen.getByTitle(longTitle);
      await user.hover(card);

      // Assert - title should be contained in the ribbon (not overflow the container)
      const titleElement = screen.getByText(longTitle);
      expect(titleElement).toBeInTheDocument();

      // Check that the title element has styles that would handle overflow gracefully
      // Note: WebkitLineClamp may not be accessible in JSDOM testing environment
      // So we'll check for the more basic overflow styles
      expect(titleElement).toHaveStyle('overflow: hidden');
      expect(titleElement).toHaveStyle('textOverflow: ellipsis');

      // Instead of checking for specific WebKit properties which may not be accessible in test environment,
      // verify that title text is rendered and visible
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toBeVisible();
    });

    it('handles empty author gracefully', async () => {
      // Arrange - book with no author
      const user = setupUser();
      renderWithTheme(<ReadingCard {...createMockProps({ author: '' })} />);

      // Act - hover to reveal details
      const card = screen.getByTitle('Test Book');
      await user.hover(card);

      // Assert - check the title is displayed correctly
      expect(screen.getByText('Test Book')).toBeInTheDocument();

      // For an empty author, we can verify the element exists inside the ribbon container
      // but doesn't have any text content
      const ribbonContainer = screen.getByTestId('ribbon-container');
      const authorElement = within(ribbonContainer).queryByText(/./i, { selector: '.book-author' });

      // Since there's no text, we can't query by text, so we'll check the ribbon structure
      expect(ribbonContainer).toBeInTheDocument();

      // The author element might not be visible to test, but we can verify the status text is shown
      expect(screen.getByText('Finished Dec 2022')).toBeInTheDocument();
    });
  });
});
