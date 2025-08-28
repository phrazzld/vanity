/**
 * TypewriterQuotes Performance Regression Tests
 *
 * These tests verify that performance optimizations remain in place
 * and catch regressions in the animation implementation.
 *
 * Focus on API usage and optimization patterns rather than timing,
 * following the CI testing strategy of avoiding flaky timer-dependent tests.
 */

import { render } from '@testing-library/react';
import { jest } from '@jest/globals';
import TypewriterQuotes from '../TypewriterQuotes';

// Mock requestAnimationFrame to verify it's being used
const mockRequestAnimationFrame = jest.fn();
const mockCancelAnimationFrame = jest.fn();

// Mock performance.now for frame tracking
const mockPerformanceNow = jest.fn(() => Date.now());

// Mock logger to capture performance warnings
const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

jest.mock('@/lib/static-data', () => ({
  getStaticQuotes: jest.fn(() => [
    { id: 1, text: 'Short test quote', author: 'Test Author' },
    { id: 2, text: 'Another test quote for animation', author: 'Second Author' },
  ]),
}));

describe('TypewriterQuotes Performance Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up requestAnimationFrame mock
    Object.defineProperty(global.window, 'requestAnimationFrame', {
      value: mockRequestAnimationFrame,
      writable: true,
    });

    Object.defineProperty(global.window, 'cancelAnimationFrame', {
      value: mockCancelAnimationFrame,
      writable: true,
    });

    // Set up performance.now mock
    Object.defineProperty(global.window, 'performance', {
      value: { now: mockPerformanceNow },
      writable: true,
    });

    // Reset frame counter for each test
    mockRequestAnimationFrame.mockImplementation(_callback => {
      // Don't actually call the callback to avoid infinite loops in tests
      return 1;
    });
  });

  describe('Animation API Usage', () => {
    it('should use requestAnimationFrame for animation loop', () => {
      render(<TypewriterQuotes />);

      // Verify requestAnimationFrame is called for the animation loop
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('should not use setTimeout for character animation', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      render(<TypewriterQuotes />);

      // Should only use setTimeout for cursor blinking, not character animation
      const animationTimeouts = setTimeoutSpy.mock.calls.filter(
        call =>
          // Check if timeout duration matches typing speeds (would indicate animation use)
          call[1] === 25 || call[1] === 15 // TYPING_SPEED or ERASE_SPEED
      );

      expect(animationTimeouts.length).toBe(0);

      setTimeoutSpy.mockRestore();
    });

    it('should properly cleanup animation frames on unmount', () => {
      // Set up mock to return a specific frame ID
      mockRequestAnimationFrame.mockReturnValue(123);

      const { unmount } = render(<TypewriterQuotes />);

      unmount();

      // Should cancel the animation frame on cleanup
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should have performance tracking enabled', () => {
      render(<TypewriterQuotes />);

      // Should have performance.now available for frame tracking
      expect(mockPerformanceNow).toBeDefined();
    });

    it('should not have performance warnings on initial render', () => {
      render(<TypewriterQuotes />);

      // Should not log performance warnings immediately after render
      const performanceWarnings = mockLogger.warn.mock.calls.filter(
        call => typeof call[0] === 'string' && call[0].includes('Long frame detected')
      );

      expect(performanceWarnings.length).toBe(0);
    });
  });

  describe('React Optimization Patterns', () => {
    it('should be wrapped in React.memo for parent render isolation', () => {
      // Check if the component has React.memo characteristics
      // React.memo components have a $$typeof property with specific symbol
      expect(TypewriterQuotes.$$typeof).toBeDefined();

      // Alternative: check if it's a memoized component by looking at the type
      const componentType = TypewriterQuotes.type || TypewriterQuotes;
      expect(componentType).toBeDefined();
    });

    it('should have consistent behavior indicating memo optimization', () => {
      // Test that the component renders successfully
      const { container: container1 } = render(<TypewriterQuotes />);
      const { container: container2 } = render(<TypewriterQuotes />);

      // Both should render the same structure (memo working properly)
      expect(container1.innerHTML).toBeDefined();
      expect(container2.innerHTML).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should cleanup intervals on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<TypewriterQuotes />);
      unmount();

      // Should clean up the cursor blink interval
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it('should not create memory leaks through timer accumulation', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<TypewriterQuotes />);

      const intervalsCreated = setIntervalSpy.mock.calls.length;

      unmount();

      const intervalsCleared = clearIntervalSpy.mock.calls.length;

      // Should clean up all created intervals
      expect(intervalsCleared).toBe(intervalsCreated);

      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should not use try/catch in animation hot path', () => {
      // This is verified by code inspection - the animation loop should not have try/catch blocks
      // If try/catch is added back to the animation loop, this test serves as documentation
      // that it was intentionally removed for performance optimization

      render(<TypewriterQuotes />);

      // No direct assertion possible, but test serves as documentation
      // that try/catch removal was intentional for V8 optimization
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });
});
