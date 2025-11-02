/**
 * HamburgerButton Component Tests
 *
 * Tests for the animated hamburger menu button covering:
 * - Rendering in both states (closed/open)
 * - Click handler invocation
 * - Accessibility attributes
 * - Animation class application
 * - Touch target sizing
 */

import { render, screen, fireEvent } from '@testing-library/react';
import HamburgerButton from '../HamburgerButton';

describe('HamburgerButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render closed state by default', () => {
      render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should render open state when isOpen is true', () => {
      render(<HamburgerButton isOpen={true} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render three lines', () => {
      const { container } = render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const lines = container.querySelectorAll('span');
      expect(lines).toHaveLength(3);
    });
  });

  describe('Click behavior', () => {
    it('should call onClick when clicked', () => {
      render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when in open state', () => {
      render(<HamburgerButton isOpen={true} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct aria-label when closed', () => {
      render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByLabelText('Open navigation menu');
      expect(button).toBeInTheDocument();
    });

    it('should have correct aria-label when open', () => {
      render(<HamburgerButton isOpen={true} onClick={mockOnClick} />);

      const button = screen.getByLabelText('Close navigation menu');
      expect(button).toBeInTheDocument();
    });

    it('should have aria-expanded attribute', () => {
      const { rerender } = render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      rerender(<HamburgerButton isOpen={true} onClick={mockOnClick} />);

      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-controls attribute', () => {
      render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-controls', 'mobile-navigation');
    });

    it('should be a button element', () => {
      render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Animation classes', () => {
    it('should apply closed animation classes when isOpen is false', () => {
      const { container } = render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const lines = container.querySelectorAll('span');

      // Top line should translate up
      expect(lines[0]).toHaveClass('-translate-y-2');
      expect(lines[0]).not.toHaveClass('rotate-45');

      // Middle line should be visible
      expect(lines[1]).toHaveClass('opacity-100');
      expect(lines[1]).not.toHaveClass('opacity-0');

      // Bottom line should translate down
      expect(lines[2]).toHaveClass('translate-y-2');
      expect(lines[2]).not.toHaveClass('-rotate-45');
    });

    it('should apply open animation classes when isOpen is true', () => {
      const { container } = render(<HamburgerButton isOpen={true} onClick={mockOnClick} />);

      const lines = container.querySelectorAll('span');

      // Top line should rotate to form X
      expect(lines[0]).toHaveClass('rotate-45');
      expect(lines[0]).toHaveClass('translate-y-0');

      // Middle line should be hidden
      expect(lines[1]).toHaveClass('opacity-0');
      expect(lines[1]).not.toHaveClass('opacity-100');

      // Bottom line should rotate to form X
      expect(lines[2]).toHaveClass('-rotate-45');
      expect(lines[2]).toHaveClass('translate-y-0');
    });
  });

  describe('Touch target sizing', () => {
    it('should have minimum 44x44px touch target', () => {
      render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');

      // w-11 = 44px, h-11 = 44px (Tailwind)
      expect(button).toHaveClass('w-11');
      expect(button).toHaveClass('h-11');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to button', () => {
      render(
        <HamburgerButton isOpen={false} onClick={mockOnClick} className="custom-test-class" />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-test-class');
    });

    it('should preserve default classes when custom className is added', () => {
      render(
        <HamburgerButton isOpen={false} onClick={mockOnClick} className="custom-test-class" />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-test-class');
      expect(button).toHaveClass('flex');
      expect(button).toHaveClass('items-center');
    });
  });

  describe('Theme support', () => {
    it('should have dark mode classes', () => {
      render(<HamburgerButton isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');

      // Button hover state
      expect(button.className).toContain('dark:hover:bg-gray-800');

      // Lines should have dark mode color classes
      const lines = button.querySelectorAll('span');
      lines.forEach(line => {
        expect(line.className).toContain('dark:bg-gray-200');
      });
    });
  });
});
