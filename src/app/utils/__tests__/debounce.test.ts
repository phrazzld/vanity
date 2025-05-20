/**
 * Tests for debounce utility functions
 */

import { debounce, useDebouncedSearch } from '../debounce';

describe('debounce utility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce function calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    // Call the debounced function multiple times
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Function should not be called immediately
    expect(mockFn).not.toHaveBeenCalled();

    // Advance timers
    jest.advanceTimersByTime(300);

    // Function should be called exactly once
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call the function with the correct arguments', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn('test', 123);

    // Advance timers
    jest.advanceTimersByTime(300);

    // Function should be called with the provided arguments
    expect(mockFn).toHaveBeenCalledWith('test', 123);
  });

  it('should reset the timer on subsequent calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();

    // Advance timers halfway
    jest.advanceTimersByTime(150);

    // Call again
    debouncedFn();

    // Advance timers halfway again
    jest.advanceTimersByTime(150);

    // Function should not be called yet (only 150ms since last call)
    expect(mockFn).not.toHaveBeenCalled();

    // Advance timers the remainder
    jest.advanceTimersByTime(150);

    // Function should be called exactly once
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should work with useDebouncedSearch helper', () => {
    const mockCallback = jest.fn();
    const debouncedSearch = useDebouncedSearch(mockCallback, 300);

    debouncedSearch('search term');

    // Function should not be called immediately
    expect(mockCallback).not.toHaveBeenCalled();

    // Advance timers
    jest.advanceTimersByTime(300);

    // Function should be called with the search term
    expect(mockCallback).toHaveBeenCalledWith('search term');
  });
});
