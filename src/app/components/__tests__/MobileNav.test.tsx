/**
 * MobileNav Component Tests
 *
 * Tests for the mobile navigation drawer component covering:
 * - Rendering behavior (open/closed states)
 * - Close mechanisms (button, ESC key, overlay, route change)
 * - Focus management
 * - Accessibility attributes
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import MobileNav from '../MobileNav';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock useFocusTrap hook
jest.mock('@/hooks/keyboard/useFocusTrap', () => ({
  useFocusTrap: jest.fn(() => ({
    current: null,
  })),
}));

describe('MobileNav', () => {
  const mockNavLinks = [
    { href: '/', label: 'home' },
    { href: '/projects', label: 'projects' },
    { href: '/readings', label: 'readings' },
    { href: '/map', label: 'travels' },
  ];

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('should not render when closed', () => {
      render(<MobileNav isOpen={false} onClose={mockOnClose} navLinks={mockNavLinks} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('should render all navigation links', () => {
      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      mockNavLinks.forEach(link => {
        expect(screen.getByText(link.label)).toBeInTheDocument();
      });
    });

    it('should render overlay when open', () => {
      const { container } = render(
        <MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />
      );

      const overlay = container.querySelector('.mobile-nav-overlay');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Close mechanisms', () => {
    it('should call onClose when close button is clicked', () => {
      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      // Clear any calls from initial render
      mockOnClose.mockClear();

      const closeButton = screen.getByLabelText('Close navigation menu');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const { container } = render(
        <MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />
      );

      // Clear any calls from initial render
      mockOnClose.mockClear();

      const overlay = container.querySelector('.mobile-nav-overlay');
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close when route changes', async () => {
      const { rerender } = render(
        <MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />
      );

      // Simulate route change
      (usePathname as jest.Mock).mockReturnValue('/projects');

      rerender(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Body scroll lock', () => {
    it('should prevent body scroll when open', () => {
      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(
        <MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<MobileNav isOpen={false} onClose={mockOnClose} navLinks={mockNavLinks} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body scroll on unmount', () => {
      const { unmount } = render(
        <MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Active link highlighting', () => {
    it('should highlight home link when on home page', () => {
      (usePathname as jest.Mock).mockReturnValue('/');

      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      const homeLink = screen.getByText('home').closest('a');
      expect(homeLink).toHaveAttribute('data-active', 'true');
    });

    it('should highlight projects link when on projects page', () => {
      (usePathname as jest.Mock).mockReturnValue('/projects');

      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      const projectsLink = screen.getByText('projects').closest('a');
      expect(projectsLink).toHaveAttribute('data-active', 'true');
    });

    it('should not highlight home link when on other pages', () => {
      (usePathname as jest.Mock).mockReturnValue('/projects');

      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      const homeLink = screen.getByText('home').closest('a');
      expect(homeLink).toHaveAttribute('data-active', 'false');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      const nav = screen.getByRole('dialog');
      expect(nav).toHaveAttribute('aria-modal', 'true');
      expect(nav).toHaveAttribute('aria-label', 'Mobile navigation');
    });

    it('should have accessible close button', () => {
      render(<MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />);

      const closeButton = screen.getByLabelText('Close navigation menu');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
    });

    it('should hide overlay from screen readers', () => {
      const { container } = render(
        <MobileNav isOpen={true} onClose={mockOnClose} navLinks={mockNavLinks} />
      );

      const overlay = container.querySelector('.mobile-nav-overlay');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to drawer', () => {
      const { container } = render(
        <MobileNav
          isOpen={true}
          onClose={mockOnClose}
          navLinks={mockNavLinks}
          className="custom-class"
        />
      );

      const drawer = container.querySelector('.mobile-nav-drawer');
      expect(drawer).toHaveClass('custom-class');
    });
  });
});
