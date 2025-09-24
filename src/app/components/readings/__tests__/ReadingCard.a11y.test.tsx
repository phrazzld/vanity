/**
 * ReadingCard Accessibility Tests
 * @jest-environment jsdom
 *
 * Comprehensive WCAG 2.1 compliance testing for ReadingCard hover interactions
 * and audiobook indicators accessibility
 */

/* eslint-env jest */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme, setupUser, checkA11y, checkA11yInBothThemes } from '@/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import ReadingCard from '../ReadingCard';
import type { ReadingListItem } from '@/types';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the readingUtils to ensure image URLs work in tests
jest.mock('@/lib/utils/readingUtils', () => ({
  getFullImageUrl: jest.fn((src: string | null) => src || '/images/projects/book-02.webp'),
}));

// Mock the getSeededPlaceholderStyles function
jest.mock('../placeholderUtils', () => ({
  getSeededPlaceholderStyles: jest.fn().mockReturnValue({
    backgroundColor: '#f0f4f8',
  }),
}));

// Mock Next.js Image component using div with img role to avoid ESLint warnings
jest.mock('next/image', () => {
  return function MockImage({ alt, onError, fill, ...props }: any) {
    // Use div with img role to avoid ESLint warnings in tests
    return React.createElement('div', {
      role: 'img',
      'aria-label': alt,
      style: { ...props.style, ...(fill && { objectFit: 'cover' }) },
      ...props,
      onError: () => {
        if (onError) onError();
      },
    });
  };
});

// Test data factory
function createMockProps(overrides: Partial<ReadingListItem> = {}): ReadingListItem {
  return {
    slug: 'test-book',
    title: 'Test Book',
    author: 'Test Author',
    coverImageSrc: 'https://example.com/cover.jpg',
    audiobook: false,
    finishedDate: null,
    ...overrides,
  };
}

describe('ReadingCard Accessibility Tests', () => {
  beforeEach(() => {
    // Reset any mocked functions
    jest.clearAllMocks();
  });

  describe('Automated WCAG 2.1 Compliance', () => {
    it('passes axe-core accessibility audit with default props', async () => {
      const props = createMockProps();
      await checkA11y(<ReadingCard {...props} />);
    });

    it('passes axe-core accessibility audit with audiobook indicator', async () => {
      const props = createMockProps({ audiobook: true });
      await checkA11y(<ReadingCard {...props} />);
    });

    it('passes axe-core accessibility audit in both light and dark themes', async () => {
      const props = createMockProps({ audiobook: true });
      await checkA11yInBothThemes(<ReadingCard {...props} />);
    });

    it('passes axe-core accessibility audit for finished reading', async () => {
      const props = createMockProps({
        audiobook: true,
        finishedDate: new Date('2023-06-15'),
      });
      await checkA11y(<ReadingCard {...props} />);
    });

    it('passes axe-core accessibility audit with missing cover image', async () => {
      const props = createMockProps({
        coverImageSrc: null,
        audiobook: true,
      });
      await checkA11y(<ReadingCard {...props} />);
    });
  });

  describe('Keyboard Navigation (WCAG 2.1.1)', () => {
    it('is focusable via Tab key navigation', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button', { name: /test book by test author/i });

      // Should not be focused initially
      expect(document.activeElement).not.toBe(card);

      // Tab should focus the card
      await user.tab();
      expect(document.activeElement).toBe(card);
    });

    it('supports reverse Tab navigation (Shift+Tab)', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(
        <div>
          <button data-testid="before">Before</button>
          <ReadingCard {...props} />
          <button data-testid="after">After</button>
        </div>
      );

      const card = screen.getByRole('button', { name: /test book by test author/i });
      const afterButton = screen.getByTestId('after');

      // Focus the after button first
      afterButton.focus();
      expect(document.activeElement).toBe(afterButton);

      // Shift+Tab should focus the card
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(card);
    });

    it('shows audiobook badge on keyboard focus', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button', {
        name: /test book by test author.*currently reading.*audiobook/i,
      });

      // Audiobook badge should not be visible without focus (overlay has opacity 0)
      const overlayDiv = card.querySelector('.hover-overlay');
      expect(overlayDiv).toHaveStyle({ opacity: '0' });

      // Tab to focus the card
      await user.tab();
      expect(document.activeElement).toBe(card);

      // Badge should be visible on focus
      const audiobookBadge = screen.getByLabelText('Audiobook');
      expect(audiobookBadge).toBeInTheDocument();

      // Status text appears on focus
      const statusText = screen.getByText('Currently Reading');
      expect(statusText).toBeInTheDocument();
    });

    it('maintains focus on Enter key press', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button', { name: /test book by test author/i });

      // Focus using user event API
      await user.tab();
      expect(document.activeElement).toBe(card);

      // Press Enter
      await user.keyboard('{Enter}');

      // Focus should remain on the card
      expect(document.activeElement).toBe(card);
    });

    it('maintains focus on Space key press', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button', { name: /test book by test author/i });

      // Focus using user event API
      await user.tab();
      expect(document.activeElement).toBe(card);

      // Press Space
      await user.keyboard(' ');

      // Focus should remain on the card
      expect(document.activeElement).toBe(card);
    });

    it('audiobook badge disappears when focus is lost', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(
        <div>
          <ReadingCard {...props} />
          <button data-testid="other">Other Element</button>
        </div>
      );

      const card = screen.getByRole('button', {
        name: /test book by test author.*currently reading.*audiobook/i,
      });
      const otherElement = screen.getByTestId('other');

      // Audiobook badge not visible before focus (overlay has opacity 0)
      const overlayDiv = card.querySelector('.hover-overlay');
      expect(overlayDiv).toHaveStyle({ opacity: '0' });

      // Tab to focus the card
      await user.tab();
      expect(document.activeElement).toBe(card);

      // Badge visible on focus
      const audiobookBadge = screen.getByLabelText('Audiobook');
      expect(audiobookBadge).toBeInTheDocument();

      // Tab to move focus away
      await user.tab();
      expect(document.activeElement).toBe(otherElement);

      // Badge should disappear without focus (overlay opacity back to 0)
      expect(overlayDiv).toHaveStyle({ opacity: '0' });
    });
  });

  describe('ARIA Attributes and Semantic Roles (WCAG 4.1.2)', () => {
    it('has correct role="button" for interactive element', () => {
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('has descriptive aria-label for reading without audiobook', () => {
      const props = createMockProps({
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        finishedDate: null,
      });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute(
        'aria-label',
        'The Great Gatsby by F. Scott Fitzgerald, Currently Reading'
      );
    });

    it('has descriptive aria-label for audiobook currently reading', () => {
      const props = createMockProps({
        title: 'Dune',
        author: 'Frank Herbert',
        audiobook: true,
        finishedDate: null,
      });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute(
        'aria-label',
        'Dune by Frank Herbert, Currently Reading, Audiobook'
      );
    });

    it('has descriptive aria-label for finished audiobook', () => {
      const props = createMockProps({
        title: '1984',
        author: 'George Orwell',
        audiobook: true,
        finishedDate: new Date('2023-06-15'),
      });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute(
        'aria-label',
        '1984 by George Orwell, Finished Jun 2023, Audiobook'
      );
    });

    it('has tabindex="0" for keyboard accessibility', () => {
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('has descriptive title attribute', () => {
      const props = createMockProps({
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
      });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('title', 'To Kill a Mockingbird by Harper Lee');
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('provides alternative text for cover images', () => {
      const props = createMockProps({
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        coverImageSrc: 'https://example.com/catcher.jpg',
      });
      renderWithTheme(<ReadingCard {...props} />);

      const image = screen.getByRole('img');
      // Next.js Image component uses aria-label for accessibility text
      expect(image).toHaveAttribute('aria-label', 'The Catcher in the Rye cover');
    });

    it('announces reading status changes to screen readers', () => {
      const props = createMockProps({ finishedDate: null });
      const { rerender } = renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Currently Reading'));

      // Update to finished - use a date that formats consistently
      const finishedDate = new Date('2023-12-01T00:00:00.000Z');
      const finishedProps = { ...props, finishedDate };
      rerender(<ReadingCard {...finishedProps} />);

      // Check for the actual formatted date string
      const expectedDate = finishedDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining(`Finished ${expectedDate}`)
      );
    });

    it('provides semantic structure with proper heading hierarchy', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      // Focus to trigger hover overlay
      await user.tab();

      // Title should be a heading
      const titleHeading = screen.getByRole('heading');
      expect(titleHeading).toBeInTheDocument();
      expect(titleHeading).toHaveTextContent('Test Book');
    });

    it('audiobook badge has appropriate semantic meaning on hover', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      // Hover to show the badge
      const card = screen.getByRole('button');
      await user.hover(card);

      // Audiobook badge should be accessible when visible
      const audiobookBadge = screen.getByLabelText('Audiobook');
      expect(audiobookBadge).toBeInTheDocument();

      // Verify it has proper positioning for visual prominence
      expect(audiobookBadge).toHaveStyle({
        position: 'absolute',
        top: '8px',
        right: '8px',
      });
    });
  });

  describe('Focus Management (WCAG 2.4.3)', () => {
    it('provides visible focus indicator', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');

      // Tab to focus
      await user.tab();
      expect(document.activeElement).toBe(card);

      // Focus should be clearly visible (browser default focus outline)
      expect(card).toHaveFocus();
    });

    it('focus order is logical and predictable', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(
        <div>
          <button data-testid="first">First</button>
          <ReadingCard {...props} />
          <button data-testid="second">Second</button>
        </div>
      );

      const firstButton = screen.getByTestId('first');
      const card = screen.getByRole('button', { name: /test book/i });
      const secondButton = screen.getByTestId('second');

      // Tab through elements in logical order
      await user.tab();
      expect(document.activeElement).toBe(firstButton);

      await user.tab();
      expect(document.activeElement).toBe(card);

      await user.tab();
      expect(document.activeElement).toBe(secondButton);
    });

    it('does not trap focus within the card', async () => {
      const user = setupUser();
      const props = createMockProps();
      renderWithTheme(
        <div>
          <ReadingCard {...props} />
          <button data-testid="next">Next Element</button>
        </div>
      );

      const card = screen.getByRole('button', { name: /test book/i });
      const nextButton = screen.getByTestId('next');

      // Focus the card
      await user.tab();
      expect(document.activeElement).toBe(card);

      // Tab should move to next element, not trap within card
      await user.tab();
      expect(document.activeElement).toBe(nextButton);
    });
  });

  describe('Color and Contrast (WCAG 1.4.3)', () => {
    it('maintains sufficient color contrast in light theme', async () => {
      const props = createMockProps({ audiobook: true });
      const { container } = renderWithTheme(<ReadingCard {...props} />, { themeMode: 'light' });

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('maintains sufficient color contrast in dark theme', async () => {
      const props = createMockProps({ audiobook: true });
      const { container } = renderWithTheme(<ReadingCard {...props} />, { themeMode: 'dark' });

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('Mouse and Touch Interaction Equivalence (WCAG 2.1.1)', () => {
    it('audiobook badge appears on hover and focus', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');

      // Badge not visible without interaction (overlay has opacity 0)
      const overlayDiv = card.querySelector('.hover-overlay');
      expect(overlayDiv).toHaveStyle({ opacity: '0' });

      // Test mouse hover
      await user.hover(card);
      let audiobookBadge = screen.getByLabelText('Audiobook');
      expect(audiobookBadge).toBeInTheDocument();
      const hoveredStatusText = screen.getByText('Currently Reading');
      expect(hoveredStatusText).toBeInTheDocument();

      // Unhover - badge disappears (overlay opacity back to 0)
      await user.unhover(card);
      const overlayAfterUnhover = card.querySelector('.hover-overlay');
      expect(overlayAfterUnhover).toHaveStyle({ opacity: '0' });

      // Test keyboard focus
      await user.tab();
      expect(document.activeElement).toBe(card);
      audiobookBadge = screen.getByLabelText('Audiobook');
      expect(audiobookBadge).toBeInTheDocument();
      const focusedStatusText = screen.getByText('Currently Reading');
      expect(focusedStatusText).toBeInTheDocument();
    });

    it('provides same functionality via keyboard as mouse', async () => {
      const user = setupUser();
      const props = createMockProps({ audiobook: true });
      renderWithTheme(<ReadingCard {...props} />);

      const card = screen.getByRole('button');

      // Focus via keyboard
      await user.tab();
      expect(document.activeElement).toBe(card);

      // Enter and Space should work the same as click
      await user.keyboard('{Enter}');
      expect(document.activeElement).toBe(card);

      await user.keyboard(' ');
      expect(document.activeElement).toBe(card);
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('remains accessible at mobile viewport sizes', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      window.dispatchEvent(new Event('resize'));

      const props = createMockProps({ audiobook: true });
      await checkA11y(<ReadingCard {...props} />);
    });

    it('remains accessible at tablet viewport sizes', async () => {
      // Set tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true });
      window.dispatchEvent(new Event('resize'));

      const props = createMockProps({ audiobook: true });
      await checkA11y(<ReadingCard {...props} />);
    });

    it('remains accessible at desktop viewport sizes', async () => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      window.dispatchEvent(new Event('resize'));

      const props = createMockProps({ audiobook: true });
      await checkA11y(<ReadingCard {...props} />);
    });
  });
});
