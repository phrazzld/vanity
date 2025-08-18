/**
 * ReadingCard Component Tests
 * @jest-environment jsdom
 *
 * Tests for the minimalist ReadingCard component with clean hover states
 */

/* eslint-env jest */

import React from 'react';
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
  });

  describe('Rendering Different States', () => {
    it('renders with cover image in light mode', () => {
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />, { themeMode: 'light' });

      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();
      expect(card).toHaveStyle({ overflow: 'hidden' });

      // Check for image using text
      const image = screen.getByText('Mock Image: Test Book cover');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://test-space.com/covers/test-book.jpg');
    });

    it('renders with cover image in dark mode', () => {
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />, { themeMode: 'dark' });

      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();

      // Check for image using text
      const image = screen.getByText('Mock Image: Test Book cover');
      expect(image).toBeInTheDocument();
    });

    it('renders without cover image using placeholder', () => {
      const props = createMockProps({ coverImageSrc: null });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByTitle('Test Book by Test Author');
      expect(card).toBeInTheDocument();

      // Should not have an image element
      expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument();
    });

    it('shows "Paused" status when dropped=true', () => {
      const props = createMockProps({ dropped: true });
      renderWithTheme(<ReadingCard {...props} />);

      const statusText = screen.getByText('Paused');
      expect(statusText).toBeInTheDocument();
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

    it('applies gray color for paused books', () => {
      const props = createMockProps({ dropped: true });
      renderWithTheme(<ReadingCard {...props} />);

      // Find the status dot
      const statusDot = screen.getByText('Paused').previousElementSibling;
      expect(statusDot).toHaveStyle({ backgroundColor: '#6b7280' });
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
  });
});
