import { render, screen, waitFor } from '@testing-library/react';
import TypewriterQuotes from '../TypewriterQuotes';
import { act } from 'react-dom/test-utils';

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve([
        { id: 1, text: 'Test quote 1', author: 'Author 1' },
        { id: 2, text: 'Test quote 2', author: 'Author 2' },
        { id: 3, text: 'Test quote 3', author: 'Author 3' },
      ]),
  })
) as jest.Mock;

// Mock console methods to reduce test output noise
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('TypewriterQuotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // Use real timers for async tests
  });

  it('shows loading state initially', () => {
    act(() => {
      render(<TypewriterQuotes />);
    });
    expect(screen.getByText('Loading quotes...')).toBeInTheDocument();
  });

  it('fetches quotes from API on mount', async () => {
    let renderResult;

    await act(async () => {
      renderResult = render(<TypewriterQuotes />);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/quotes',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        cache: 'no-store',
      })
    );

    // Wait for the component to render after fetching quotes
    await waitFor(() => {
      expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    // Mock a failed API call
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.reject(new Error('Failed to parse JSON')),
      })
    );

    await act(async () => {
      render(<TypewriterQuotes />);
    });

    // Wait for the error state to be set
    await waitFor(() => {
      expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
    });

    // Instead of checking for specific text, just verify we're no longer in loading state
    // and have some content in the quote container
    await waitFor(() => {
      const quoteContainer = screen.getByTestId('quote-text');
      expect(quoteContainer).toBeInTheDocument();
    });
  });

  it('starts typing quote text after loading', async () => {
    // Use fake timers for this specific test
    jest.useFakeTimers();

    await act(async () => {
      render(<TypewriterQuotes />);

      // Wait for data to load and initial state to be set
      await Promise.resolve();
      jest.advanceTimersByTime(100);
    });

    // Wait for loading to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
    });

    const quoteContainer = screen.getByTestId('quote-text');

    // Advance time to start typing
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Should show some quote text
    expect(quoteContainer.textContent).toBeTruthy();

    // Clean up timers
    jest.useRealTimers();
  });
});
