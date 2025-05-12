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

// We'll mock at the container level instead of document level

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
    // Explicitly set visible styles for JSDOM
    button1.style.display = 'inline-block';
    button1.style.visibility = 'visible';
    button1.style.opacity = '1';

    button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    // Explicitly set visible styles for JSDOM
    button2.style.display = 'inline-block';
    button2.style.visibility = 'visible';
    button2.style.opacity = '1';

    hiddenButton = document.createElement('button');
    hiddenButton.textContent = 'Hidden Button';
    hiddenButton.style.display = 'none';

    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(hiddenButton);

    // Mock container's querySelectorAll instead of document's
    // This better simulates how getFocusableElements actually works
    jest.spyOn(container, 'querySelectorAll').mockImplementation(selector => {
      if (selector.includes('button') || selector.includes('[tabindex]')) {
        return [button1, button2, hiddenButton] as unknown as NodeListOf<HTMLElement>;
      }
      return [] as unknown as NodeListOf<HTMLElement>;
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
      // Use a new container with no elements for this test
      const emptyContainer = document.createElement('div');
      // Mock empty container's querySelectorAll to return empty
      jest
        .spyOn(emptyContainer, 'querySelectorAll')
        .mockReturnValue([] as unknown as NodeListOf<HTMLElement>);

      const result = focusFirstElement(emptyContainer);

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
      // Use a new container with no elements for this test
      const emptyContainer = document.createElement('div');
      // Mock empty container's querySelectorAll to return empty
      jest
        .spyOn(emptyContainer, 'querySelectorAll')
        .mockReturnValue([] as unknown as NodeListOf<HTMLElement>);

      const result = focusLastElement(emptyContainer);

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
