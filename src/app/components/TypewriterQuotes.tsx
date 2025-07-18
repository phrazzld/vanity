'use client';

/**
 * @file TypewriterQuotes component that displays quotes with a typewriter animation effect
 * @module components/TypewriterQuotes
 */

import { useEffect, useState } from 'react';
import type { Quote } from '@/types';
import { logger, createLogContext } from '@/lib/logger';

/**
 * Represents the current animation phase of the typewriter effect
 *
 * @typedef {'typingQuote' | 'pauseAfterQuote' | 'typingAuthor' | 'pauseAfterAuthor' | 'erasingAuthor' | 'erasingQuote' | 'loading'} Phase
 *
 * The phases are:
 * - loading: Initial state while quotes are being fetched
 * - typingQuote: Typing the quote text character by character
 * - pauseAfterQuote: Brief pause after quote is fully typed
 * - typingAuthor: Typing the author name character by character
 * - pauseAfterAuthor: Longer pause after author is fully typed
 * - erasingAuthor: Erasing the author name character by character
 * - erasingQuote: Erasing the quote text character by character
 */
type Phase =
  | 'typingQuote'
  | 'pauseAfterQuote'
  | 'typingAuthor'
  | 'pauseAfterAuthor'
  | 'erasingAuthor'
  | 'erasingQuote'
  | 'loading';

/**
 * Animation timing constants (in milliseconds)
 */
// Speed for typing characters (lower = faster)
const TYPING_SPEED = 25;
// Speed for erasing characters (lower = faster)
const ERASE_SPEED = 15;
// Time to pause after quote is fully typed
const PAUSE_AFTER_QUOTE = 1000;
// Time to pause after author is fully typed
const PAUSE_AFTER_AUTHOR = 2000;
// How fast the cursor blinks
const CURSOR_BLINK_INTERVAL = 500;

/**
 * TypewriterQuotes component
 *
 * Displays random quotes from the database with a typewriter animation effect.
 * The component cycles through quotes in these steps:
 * 1. Type the quote text character by character
 * 2. Type the author's name
 * 3. Pause to allow reading
 * 4. Erase the author and quote
 * 5. Select a new random quote and repeat
 *
 * @returns {JSX.Element} The animated quotes component
 */
export default function TypewriterQuotes() {
  // Store fetched quotes from the API
  const [quotes, setQuotes] = useState<Quote[]>([]);
  // Index of the currently displayed quote
  const [quoteIndex, setQuoteIndex] = useState(0);
  // Current animation phase
  const [phase, setPhase] = useState<Phase>('loading');

  // Current displayed text (partial strings that grow/shrink during animation)
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [displayedAuthor, setDisplayedAuthor] = useState('');
  // Controls the blinking cursor appearance
  const [cursorVisible, setCursorVisible] = useState(true);

  /**
   * Fetch quotes from the API when the component mounts
   *
   * This effect:
   * 1. Makes a request to the quotes API with cache-busting headers
   * 2. Processes the response and updates the quotes state
   * 3. Randomly selects the first quote to display
   * 4. Provides a fallback quote if the API call fails
   */
  useEffect(() => {
    /**
     * Fetches quotes from the API and handles the response
     * @async
     */
    const fetchQuotes = async () => {
      try {
        logger.info(
          'Fetching quotes for typewriter animation',
          createLogContext('components/TypewriterQuotes', 'fetchQuotes')
        );
        const response = await fetch('/api/quotes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add cache busting to prevent stale data
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
          // Force fetch even if response is in the cache
          cache: 'no-store',
        });

        logger.debug(
          'Quotes API response received',
          createLogContext('components/TypewriterQuotes', 'fetchQuotes', {
            response_status: response.status,
          })
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
        }

        // Cast response data to Quote[] with validation
        const data = (await response.json()) as Quote[];

        // Validate the response data
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected an array of quotes');
        }
        logger.info(
          'Successfully fetched quotes for typewriter',
          createLogContext('components/TypewriterQuotes', 'fetchQuotes', {
            quotes_count: data.length,
          })
        );

        if (data.length === 0) {
          throw new Error('No quotes received from API');
        }

        setQuotes(data);

        // Initialize with a random quote after fetching
        const randomIndex = Math.floor(Math.random() * data.length);
        setQuoteIndex(randomIndex);
        setPhase('typingQuote');
      } catch (error) {
        logger.error(
          'Error fetching quotes for typewriter animation',
          createLogContext('components/TypewriterQuotes', 'fetchQuotes', {
            error_type: error instanceof Error ? error.constructor.name : 'Unknown',
          }),
          error instanceof Error ? error : new Error(String(error))
        );
        // Fallback to a default quote if API fails
        // Use a properly typed fallback quote
        const fallbackQuote: Quote = {
          id: 0,
          text: 'Error loading quotes from database. Please check console for details.',
          author: 'System',
        };
        setQuotes([fallbackQuote]);
        setPhase('typingQuote');
      }
    };

    fetchQuotes();
  }, []);

  /**
   * Get the current quote and prepare it for display
   * Safely handles empty states and replaces escape sequences with proper line breaks
   */
  const currentQuote = quotes[quoteIndex];
  const rawQuote = currentQuote ? currentQuote.text.replace(/\\n/g, '\n') : '';
  const rawAuthor =
    currentQuote && currentQuote.author ? currentQuote.author.replace(/\\n/g, '\n') : '';

  /**
   * Cursor blinking effect
   *
   * Sets up an interval to toggle cursor visibility state
   * for the blinking text cursor animation
   */
  useEffect(() => {
    // Setup blinking interval
    // Use ReturnType<typeof globalThis.setInterval> for proper type safety
    const blink: ReturnType<typeof globalThis.setInterval> = globalThis.setInterval(() => {
      setCursorVisible(v => !v);
    }, CURSOR_BLINK_INTERVAL);

    // Clean up interval on unmount
    return () => {
      try {
        // Use globalThis which is more reliable in both browser and test environments
        globalThis.clearInterval(blink);
      } catch (e) {
        // Silently fail in test environments where this might not be available
        logger.warn(
          'Failed to clear animation interval',
          createLogContext('components/TypewriterQuotes', 'cleanupBlink', {
            error_type: e instanceof Error ? e.constructor.name : 'Unknown',
          })
        );
      }
    };
  }, []);

  /**
   * Main typewriter animation effect
   *
   * Handles the core logic for the typewriter animation:
   * - Types characters one by one for quote and author
   * - Manages pauses between phases
   * - Erases text before moving to next quote
   * - Selects a new random quote when cycle completes
   *
   * The effect runs whenever any of its dependencies change,
   * primarily when the phase or displayed text changes.
   */
  useEffect(() => {
    // Skip if still loading or no quotes available
    if (phase === 'loading' || quotes.length === 0) {
      return; // Don't run typewriter logic until quotes are loaded
    }

    // Use ReturnType<typeof globalThis.setTimeout> to handle both browser and Node environments
    let timer: ReturnType<typeof globalThis.setTimeout>;

    switch (phase) {
      case 'typingQuote':
        if (displayedQuote.length < rawQuote.length) {
          // Add one character at a time to the displayed quote
          timer = globalThis.setTimeout(() => {
            setDisplayedQuote(rawQuote.slice(0, displayedQuote.length + 1));
          }, TYPING_SPEED);
        } else {
          // Quote is fully typed, pause before showing the author
          timer = globalThis.setTimeout(() => {
            setPhase('pauseAfterQuote');
          }, PAUSE_AFTER_QUOTE);
        }
        break;

      case 'pauseAfterQuote':
        // Brief pause after quote is displayed, then begin typing author
        timer = globalThis.setTimeout(() => {
          setPhase('typingAuthor');
        }, 300);
        break;

      case 'typingAuthor':
        if (displayedAuthor.length < rawAuthor.length) {
          // Add one character at a time to the displayed author
          timer = globalThis.setTimeout(() => {
            setDisplayedAuthor(rawAuthor.slice(0, displayedAuthor.length + 1));
          }, TYPING_SPEED);
        } else {
          // Author is fully typed, pause for reading
          timer = globalThis.setTimeout(() => {
            setPhase('pauseAfterAuthor');
          }, PAUSE_AFTER_AUTHOR);
        }
        break;

      case 'pauseAfterAuthor':
        // Longer pause after author is displayed, then begin erasing
        timer = globalThis.setTimeout(() => {
          setPhase('erasingAuthor');
        }, 500);
        break;

      case 'erasingAuthor':
        if (displayedAuthor.length > 0) {
          // Erase author one character at a time from end
          timer = globalThis.setTimeout(() => {
            setDisplayedAuthor(displayedAuthor.slice(0, -1));
          }, ERASE_SPEED);
        } else {
          // Author is fully erased, begin erasing the quote
          setPhase('erasingQuote');
        }
        break;

      case 'erasingQuote':
        if (displayedQuote.length > 0) {
          // Erase quote one character at a time from end
          timer = globalThis.setTimeout(() => {
            setDisplayedQuote(displayedQuote.slice(0, -1));
          }, ERASE_SPEED);
        } else {
          // Quote is fully erased, select a new random quote and start over
          const nextIndex = Math.floor(Math.random() * quotes.length);
          setQuoteIndex(nextIndex);
          setPhase('typingQuote');
        }
        break;
    }

    // Clean up timer on unmount or when dependencies change
    return () => {
      if (timer) {
        try {
          // Use globalThis which is more reliable in both browser and test environments
          globalThis.clearTimeout(timer);
        } catch (e) {
          // Silently fail in test environments where this might not be available
          logger.warn(
            'Failed to clear animation timeout',
            createLogContext('components/TypewriterQuotes', 'cleanupTimer', {
              error_type: e instanceof Error ? e.constructor.name : 'Unknown',
            })
          );
        }
      }
    };
  }, [phase, displayedQuote, displayedAuthor, rawQuote, rawAuthor, quoteIndex, quotes]);

  /**
   * Determine which element should display the cursor
   *
   * Based on current animation phase, determine whether the
   * cursor should be shown in the quote or author element
   */
  const isQuoteActive = ['typingQuote', 'pauseAfterQuote', 'erasingQuote'].includes(phase);

  /**
   * Show loading state while quotes are being fetched
   */
  if (phase === 'loading') {
    return (
      <div
        style={{
          margin: '2rem auto 0 auto',
          width: '90%',
          maxWidth: '700px',
          minHeight: '15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading quotes...
      </div>
    );
  }

  /**
   * Render the quote and author with typewriter animation
   *
   * @returns {JSX.Element} The rendered component with quote and author text
   */
  return (
    <div
      style={{
        // Fixed container size ensures quotes don't shift page layout
        margin: '2rem auto 0 auto',
        width: '90%',
        maxWidth: '700px',
        minHeight: '15rem', // Consistent height for all quote sizes
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      {/* Quote text element with blinking cursor when active */}
      <div
        data-testid="quote-text"
        style={{
          fontSize: '1.25rem',
          fontWeight: 500, // Original font weight
          lineHeight: 1.6, // Comfortable reading for multi-line quotes
          whiteSpace: 'pre-wrap', // Preserve actual line breaks in text
          marginBottom: '0.75rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {displayedQuote}
        {/* Show cursor in quote element when quote is being manipulated */}
        {isQuoteActive && cursorVisible && (
          <span style={{ borderRight: '2px solid #444', marginLeft: '2px' }} />
        )}
      </div>

      {/* Author attribution with blinking cursor when active */}
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 400,
          color: '#666',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {displayedAuthor}
        {/* Show cursor in author element when author is being manipulated */}
        {!isQuoteActive && cursorVisible && (
          <span style={{ borderRight: '2px solid #444', marginLeft: '2px' }} />
        )}
      </div>
    </div>
  );
}
