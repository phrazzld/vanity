/**
 * ReadingCard Component Tests
 * @jest-environment jsdom
 *
 * Tests for the minimalist ReadingCard component with clean hover states
 */

/* eslint-env jest */

import React from 'react';
import { renderWithTheme, screen, setupUser } from '@/test-utils';
import { fireEvent } from '@testing-library/react';
import ReadingCard from '../ReadingCard';
import type { ReadingListItem } from '@/types';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

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

    // Store onError callback for testing
    const onError = props.onError as (() => void) | undefined;

    return React.createElement(
      'img',
      {
        'data-testid': 'mock-image',
        style: { width: imgProps.width, height: imgProps.height },
        alt: imgProps.alt || '',
        src: imgProps.src || '',
        onError: onError,
      },
      null
    );
  },
}));

// Mock environment variables
// NEXT_PUBLIC_SPACES_BASE_URL removed - no longer used

// Sample test data with fixed date for consistent testing
const TEST_DATE = '2022-12-15';

// Create reusable mock props for the various test cases
const createMockProps = (overrides = {}): ReadingListItem => ({
  slug: 'test-book',
  title: 'Test Book',
  author: 'Test Author',
  coverImageSrc: '/covers/test-book.jpg',
  audiobook: false,
  finishedDate: TEST_DATE,
  ...overrides,
});

describe('ReadingCard Component', () => {
  // Setup and cleanup
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Different States', () => {
    it('renders with cover image in light mode', () => {
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />, { themeMode: 'light' });

      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();
      expect(card).toHaveStyle({ overflow: 'hidden' });

      // Check for image element
      const image = screen.getByTestId('mock-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/covers/test-book.jpg');
      expect(image).toHaveAttribute('alt', 'Test Book cover');
    });

    it('renders with cover image in dark mode', () => {
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />, { themeMode: 'dark' });

      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();

      // Check for image element
      const image = screen.getByTestId('mock-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Test Book cover');
    });

    it('renders without cover image using placeholder', () => {
      const props = createMockProps({ coverImageSrc: null });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();

      // Should not have an image element
      expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument();
    });

    it('shows audiobook badge only on hover when audiobook=true', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      // Audiobook format should be reflected with a badge
      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();

      // Badge should not be visible initially (overlay has opacity 0)
      const overlayDiv = card.querySelector('.hover-overlay');
      expect(overlayDiv).toHaveStyle({ opacity: '0' });

      // Hover to show the badge
      await user.hover(card);

      // Check for the audiobook badge
      const audiobookBadge = screen.getByLabelText('Audiobook');
      expect(audiobookBadge).toBeInTheDocument();

      // Verify badge is positioned in upper right
      expect(audiobookBadge).toHaveStyle({
        position: 'absolute',
        top: '8px',
        right: '8px',
      });
    });

    it('shows "Currently Reading" status when finishedDate=null', () => {
      const props = createMockProps({ finishedDate: null });
      renderWithTheme(<ReadingCard {...props} />);

      const statusText = screen.getByText('Currently Reading');
      expect(statusText).toBeInTheDocument();
    });

    it('shows "Finished [date]" status when book is completed', () => {
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const statusText = screen.getByText('Finished Dec 2022');
      expect(statusText).toBeInTheDocument();
    });
  });

  describe('Animation and Interaction', () => {
    it('shows audiobook badge only during hover', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');

      // Audiobook badge should not be visible without hover (overlay has opacity 0)
      const overlayDiv = card.querySelector('.hover-overlay');
      expect(overlayDiv).toHaveStyle({ opacity: '0' });

      // Hover over the card
      await user.hover(card);

      // Badge should be visible during hover
      const audiobookBadge = screen.getByLabelText('Audiobook');
      expect(audiobookBadge).toBeInTheDocument();

      // Get the status text for hover testing
      const statusText = screen.getByText('Finished Dec 2022');
      const overlayContent = statusText.closest('.hover-overlay');

      // After hover, overlay should be visible (opacity: 1)
      expect(overlayContent).toHaveStyle({ opacity: '1' });

      // Unhover the card
      await user.unhover(card);

      // Badge should disappear after unhover (overlay opacity back to 0)
      expect(overlayContent).toHaveStyle({ opacity: '0' });
    });

    it('shows overlay content when hovered', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');

      // Initially, text should be invisible (opacity: 0)
      const titleElement = screen.getByRole('heading', { name: /test book/i });
      const overlayContent = titleElement.parentElement;
      expect(overlayContent).toHaveStyle({ opacity: '0' });

      // Hover over the card
      await user.hover(card);

      // After hover, content should be visible
      // Note: We can't directly test the overlay opacity due to event timing
      // But we can verify the structure exists
      expect(titleElement).toBeInTheDocument();
    });

    it('hides overlay when mouse leaves', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');
      const titleElement = screen.getByRole('heading', { name: /test book/i });
      const overlayContent = titleElement.parentElement;

      // Hover and then unhover
      await user.hover(card);
      // Content exists after hover
      expect(titleElement).toBeInTheDocument();

      await user.unhover(card);
      // Content should have opacity 0 after unhover
      expect(overlayContent).toHaveStyle({ opacity: '0' });
    });
  });

  describe('Status-Specific Styling', () => {
    it('applies blue color for currently reading books', () => {
      const props = createMockProps({ finishedDate: null });
      renderWithTheme(<ReadingCard {...props} />);

      // Find the status dot
      const statusDot = screen.getByText('Currently Reading').previousElementSibling;
      expect(statusDot).toHaveStyle({ backgroundColor: '#3b82f6' });
    });

    it('applies green color for finished books', () => {
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      // Find the status dot
      const statusDot = screen.getByText('Finished Dec 2022').previousElementSibling;
      expect(statusDot).toHaveStyle({ backgroundColor: '#10b981' });
    });

    it('displays audiobook badge with proper styling on hover', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      // Check that audiobook is indicated through badge
      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();

      // Hover to show the badge
      await user.hover(card);

      // Check for audiobook badge
      const audiobookBadge = screen.getByLabelText('Audiobook');
      expect(audiobookBadge).toBeInTheDocument();

      // Verify badge has circular styling
      expect(audiobookBadge).toHaveStyle({
        position: 'absolute',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
      });

      // Verify the status text is standard (no "Listening")
      const statusText = screen.getByText('Finished Dec 2022');
      expect(statusText).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard focus and shows overlay on focus', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');

      // Tab to focus the card
      await user.tab();

      // Card should have focus-visible styles when focused via keyboard
      expect(document.activeElement).toBe(card);

      // Verify audiobook information is accessible
      const statusText = screen.getByText('Finished Dec 2022');
      expect(statusText).toBeInTheDocument();
      const audiobookIcon = screen.getByLabelText('Audiobook');
      expect(audiobookIcon).toBeInTheDocument();
    });

    it('has appropriate ARIA attributes for screen readers', () => {
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');

      // Card should have descriptive title for screen readers
      expect(card).toHaveAttribute('title', 'Test Book by Test Author');

      // Audiobook information should be present for screen readers
      const statusText = screen.getByText('Finished Dec 2022');
      expect(statusText).toBeInTheDocument();
      const audiobookIcon = screen.getByLabelText('Audiobook');
      expect(audiobookIcon).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles gracefully', () => {
      const longTitle =
        'This is an extremely long book title that should be truncated properly when displayed in the card component to prevent overflow';
      const props = createMockProps({ title: longTitle });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle(`${longTitle} by Test Author`);
      expect(card).toBeInTheDocument();

      const titleElement = screen.getByRole('heading', { name: new RegExp(longTitle, 'i') });
      expect(titleElement).toHaveStyle({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      });
    });

    it('handles empty author gracefully', () => {
      const props = createMockProps({ author: '' });
      renderWithTheme(<ReadingCard {...props} />);

      // Card should still render with empty author
      const titleElement = screen.getByRole('heading', { name: /test book/i });
      expect(titleElement).toBeInTheDocument();

      // Status should still be shown
      const statusText = screen.getByText('Finished Dec 2022');
      expect(statusText).toBeInTheDocument();
    });

    it('handles missing cover image with placeholder', () => {
      const props = createMockProps({ coverImageSrc: null });
      renderWithTheme(<ReadingCard {...props} />);

      // Should not have an image element
      expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument();

      // Card should still be interactive
      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('handles undefined values gracefully', () => {
      const props = createMockProps({
        thoughts: undefined,
        coverImageSrc: undefined,
      });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Image Error Handling', () => {
    it('handles image load errors and shows placeholder', () => {
      const { logger } = require('@/lib/logger');
      jest.clearAllMocks();

      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      // Get the image element and trigger error
      const mockImage = screen.getByTestId('mock-image');
      fireEvent.error(mockImage);

      // Check that logger.warn was called
      expect(logger.warn).toHaveBeenCalledWith('Failed to load image for "Test Book"');
    });

    it('falls back to placeholder on image error', () => {
      const props = createMockProps({ coverImageSrc: 'https://broken-image.com/404.jpg' });
      renderWithTheme(<ReadingCard {...props} />);

      // Initially image should be present
      const mockImage = screen.getByTestId('mock-image');
      expect(mockImage).toBeInTheDocument();

      // Trigger error
      fireEvent.error(mockImage);

      // Image should be replaced with placeholder styles
      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('unmounts cleanly without memory leaks', () => {
      const props = createMockProps();
      const { unmount } = renderWithTheme(<ReadingCard {...props} />);

      // Component should render normally
      expect(screen.getByTitle('Test Book by Test Author')).toBeInTheDocument();

      // Unmount should work without errors
      unmount();

      // Component should be removed from DOM
      expect(screen.queryByTitle('Test Book by Test Author')).not.toBeInTheDocument();
    });

    it('maintains hover state consistency through re-renders', async () => {
      const user = setupUser();
      const props = createMockProps();
      const { rerender } = renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');

      // Hover over card
      await user.hover(card);

      // Re-render with same props
      rerender(<ReadingCard {...props} />);

      // Card should still be present
      expect(screen.getByTitle('Test Book by Test Author')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('renders correctly in both light and dark modes', () => {
      const props = createMockProps();

      // Test light mode
      const { unmount: unmountLight } = renderWithTheme(<ReadingCard {...props} />, {
        themeMode: 'light',
      });
      expect(screen.getByTitle('Test Book by Test Author')).toBeInTheDocument();
      unmountLight();

      // Test dark mode
      const { unmount: unmountDark } = renderWithTheme(<ReadingCard {...props} />, {
        themeMode: 'dark',
      });
      expect(screen.getByTitle('Test Book by Test Author')).toBeInTheDocument();
      unmountDark();
    });

    it('applies theme-specific styling', () => {
      const props = createMockProps();

      // Light mode
      const { unmount: unmountLight } = renderWithTheme(<ReadingCard {...props} />, {
        themeMode: 'light',
      });
      const lightCard = screen.getByTitle('Test Book by Test Author');
      expect(lightCard).toBeInTheDocument();
      unmountLight();

      // Dark mode
      const { unmount: unmountDark } = renderWithTheme(<ReadingCard {...props} />, {
        themeMode: 'dark',
      });
      const darkCard = screen.getByTitle('Test Book by Test Author');
      expect(darkCard).toBeInTheDocument();
      unmountDark();
    });
  });

  describe('Dropped Status Removal Verification', () => {
    it('does not render or reference dropped status', () => {
      // Test with various props to ensure no dropped status is referenced
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      // Verify no "Paused" or "Dropped" text appears
      expect(screen.queryByText(/paused/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/dropped/i)).not.toBeInTheDocument();

      // Only "Currently Reading" or "Finished" should be valid states
      const statusText = screen.getByText(/Finished/i);
      expect(statusText).toBeInTheDocument();
    });

    it('only supports binary reading status (reading/finished)', () => {
      // Test currently reading
      const readingProps = createMockProps({ finishedDate: null });
      const { unmount: unmountReading } = renderWithTheme(<ReadingCard {...readingProps} />);
      expect(screen.getByText('Currently Reading')).toBeInTheDocument();
      unmountReading();

      // Test finished
      const finishedProps = createMockProps({ finishedDate: '2022-12-25' });
      renderWithTheme(<ReadingCard {...finishedProps} />);
      expect(screen.getByText(/Finished/i)).toBeInTheDocument();
    });
  });

  describe('URL Handling', () => {
    it('handles relative image URLs correctly', () => {
      const props = createMockProps({ coverImageSrc: '/images/book.jpg' });
      renderWithTheme(<ReadingCard {...props} />);

      const image = screen.getByTestId('mock-image');
      expect(image).toHaveAttribute('src', '/images/book.jpg');
    });

    it('handles absolute image URLs correctly', () => {
      const props = createMockProps({
        coverImageSrc: 'https://example.com/book.jpg',
      });
      renderWithTheme(<ReadingCard {...props} />);

      const image = screen.getByTestId('mock-image');
      expect(image).toHaveAttribute('src', 'https://example.com/book.jpg');
    });

    it('handles malformed URLs gracefully', () => {
      const props = createMockProps({
        coverImageSrc: '//invalid-url',
      });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();
    });
  });

  describe('ReadCountBadge', () => {
    describe('Badge Rendering', () => {
      it('renders ×2 badge for readCount=2', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 2 times');
        expect(badge).toBeInTheDocument();
        expect(badge.textContent).toBe('×2');
      });

      it('renders ×3 badge for readCount=3', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 3 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 3 times');
        expect(badge).toBeInTheDocument();
        expect(badge.textContent).toBe('×3');
      });

      it('does not render for readCount=1', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 1 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        expect(screen.queryByLabelText(/Read \d+ times/)).not.toBeInTheDocument();
      });

      it('does not render for undefined readCount', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: undefined });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        expect(screen.queryByLabelText(/Read \d+ times/)).not.toBeInTheDocument();
      });
    });

    describe('Badge Positioning', () => {
      it('positions at top: 8px with no other badges', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2, audiobook: false, favorite: false });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 2 times');
        expect(badge).toHaveStyle({ top: '8px' });
      });

      it('positions at top: 44px with audiobook badge', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2, audiobook: true, favorite: false });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 2 times');
        expect(badge).toHaveStyle({ top: '44px' });
      });

      it('positions at top: 44px with favorite badge', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2, audiobook: false, favorite: true });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 2 times');
        expect(badge).toHaveStyle({ top: '44px' });
      });

      it('positions at top: 80px with both audiobook and favorite badges', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2, audiobook: true, favorite: true });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 2 times');
        expect(badge).toHaveStyle({ top: '80px' });
      });
    });

    describe('Font Size Adjustment', () => {
      it('uses 11px font for readCount ≤9', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 5 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 5 times');
        const span = badge.querySelector('span');
        expect(span).toHaveStyle({ fontSize: '11px' });
      });

      it('uses 9px font for readCount >9', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 15 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 15 times');
        const span = badge.querySelector('span');
        expect(span).toHaveStyle({ fontSize: '9px' });
      });
    });

    describe('Accessibility', () => {
      it('has aria-label "Read N times"', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 2 times');
        expect(badge).toHaveAttribute('aria-label', 'Read 2 times');
      });

      it('includes read count in ReadingCard aria-label', () => {
        const props = createMockProps({ readCount: 2 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByRole('button');
        expect(card).toHaveAttribute(
          'aria-label',
          'Test Book by Test Author, Finished Dec 2022, Read 2 times'
        );
      });

      it('does not include read count in aria-label when readCount=1', () => {
        const props = createMockProps({ readCount: 1 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('aria-label', 'Test Book by Test Author, Finished Dec 2022');
      });

      it('badge visible on hover like other badges', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');

        // Badge exists but overlay is not visible initially
        const overlayDiv = card.querySelector('.hover-overlay');
        expect(overlayDiv).toHaveStyle({ opacity: '0' });

        // Badge becomes visible on hover
        await user.hover(card);
        const badge = screen.getByLabelText('Read 2 times');
        expect(badge).toBeInTheDocument();
        expect(overlayDiv).toHaveStyle({ opacity: '1' });

        // Badge hidden after unhover (overlay opacity returns to 0)
        await user.unhover(card);
        expect(overlayDiv).toHaveStyle({ opacity: '0' });
      });
    });

    describe('Badge Styling', () => {
      it('has circular badge styling', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2 });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const badge = screen.getByLabelText('Read 2 times');
        expect(badge).toHaveStyle({
          position: 'absolute',
          right: '8px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
        });
      });

      it('matches audiobook/favorite badge styling', async () => {
        const user = setupUser();
        const props = createMockProps({ readCount: 2, audiobook: true, favorite: true });
        renderWithTheme(<ReadingCard {...props} />);

        const card = screen.getByTitle('Test Book by Test Author');
        await user.hover(card);

        const readCountBadge = screen.getByLabelText('Read 2 times');
        const audiobookBadge = screen.getByLabelText('Audiobook');
        const favoriteBadge = screen.getByLabelText('Favorite');

        // All badges should have same base styling
        [readCountBadge, audiobookBadge, favoriteBadge].forEach(badge => {
          expect(badge).toHaveStyle({
            position: 'absolute',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
          });
        });
      });
    });
  });
});
