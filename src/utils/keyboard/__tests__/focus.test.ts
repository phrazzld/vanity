/**
 * Tests for focus management utilities
 */
import {
  getFocusableElements,
  isVisible,
  focusFirstElement,
  focusLastElement,
  restoreFocus,
} from '../focus';

// Mock document methods
document.querySelector = jest.fn();
document.querySelectorAll = jest.fn();

describe('Focus utilities', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let hiddenButton: HTMLButtonElement;

  beforeEach(() => {
    // Set up test DOM
    container = document.createElement('div');

    button1 = document.createElement('button');
    button1.textContent = 'Button 1';

    button2 = document.createElement('button');
    button2.textContent = 'Button 2';

    hiddenButton = document.createElement('button');
    hiddenButton.textContent = 'Hidden Button';
    hiddenButton.style.display = 'none';

    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(hiddenButton);

    // Mock querySelectorAll to return our elements
    (document.querySelectorAll as jest.Mock).mockImplementation(selector => {
      if (selector.includes('button')) {
        return [button1, button2, hiddenButton];
      }
      return [];
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('isVisible', () => {
    it('should return true for visible elements', () => {
      expect(isVisible(button1)).toBe(true);
      expect(isVisible(button2)).toBe(true);
    });

    it('should return false for hidden elements', () => {
      expect(isVisible(hiddenButton)).toBe(false);
    });
  });

  describe('getFocusableElements', () => {
    it('should return only visible focusable elements', () => {
      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(2);
      expect(elements).toContain(button1);
      expect(elements).toContain(button2);
      expect(elements).not.toContain(hiddenButton);
    });
  });

  describe('focusFirstElement', () => {
    it('should focus the first focusable element', () => {
      button1.focus = jest.fn();

      const result = focusFirstElement(container);

      expect(result).toBe(true);
      expect(button1.focus).toHaveBeenCalledWith(
        expect.objectContaining({
          preventScroll: true,
        })
      );
    });

    it('should return false if no focusable elements exist', () => {
      (document.querySelectorAll as jest.Mock).mockReturnValue([]);

      const result = focusFirstElement(container);

      expect(result).toBe(false);
    });
  });

  describe('focusLastElement', () => {
    it('should focus the last focusable element', () => {
      button2.focus = jest.fn();

      const result = focusLastElement(container);

      expect(result).toBe(true);
      expect(button2.focus).toHaveBeenCalledWith(
        expect.objectContaining({
          preventScroll: true,
        })
      );
    });

    it('should return false if no focusable elements exist', () => {
      (document.querySelectorAll as jest.Mock).mockReturnValue([]);

      const result = focusLastElement(container);

      expect(result).toBe(false);
    });
  });

  describe('restoreFocus', () => {
    it('should focus the element if it exists', () => {
      const element = document.createElement('button');
      element.focus = jest.fn();

      restoreFocus(element);

      expect(element.focus).toHaveBeenCalledWith(
        expect.objectContaining({
          preventScroll: true,
        })
      );
    });

    it('should not throw if element is null', () => {
      expect(() => {
        restoreFocus(null);
      }).not.toThrow();
    });
  });
});
