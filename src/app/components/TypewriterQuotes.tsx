'use client';

/**
 * @file TypewriterQuotes component that displays quotes with a typewriter animation effect
 * @module components/TypewriterQuotes
 */

import { useEffect, useState, useRef, memo } from 'react';
import type { Quote } from '@/types';
import { logger } from '@/lib/logger';
import { getStaticQuotes } from '@/lib/static-data';

/**
 * Animation phases for the typewriter effect
 *
 * The phases are:
 * - loading: Initial state while quotes are being fetched
 * - typing-quote: Typing the quote text character by character
 * - showing-author: Typing the author text character by character
 * - waiting: Brief pause before cycling to next quote
 * - erasing-author: Erasing the author text character by character
 * - erasing-quote: Erasing the quote text character by character
 */
type Phase =
  | 'loading'
  | 'typing-quote'
  | 'showing-author'
  | 'waiting'
  | 'erasing-author'
  | 'erasing-quote';

function TypewriterQuotes() {
  // Store fetched quotes from the API
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Minimal state structure for simplified animation
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');

  // Character indices for robust animation without effect thrashing
  const [quoteCharIndex, setQuoteCharIndex] = useState(0);
  const [authorCharIndex, setAuthorCharIndex] = useState(0);

  // Refs for animation logic to avoid stale closures while keeping stable dependencies
  const quoteCharIndexRef = useRef(0);
  const authorCharIndexRef = useRef(0);

  // Cursor blink state
  const [cursorVisible, setCursorVisible] = useState(true);
  const cursorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Single RAF-driven loop for animation
  const rafIdRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const pauseUntilRef = useRef<number | null>(null);

  // Animation speeds and pauses
  const TYPING_DELAY = Math.round(16);
  // Keep original erase speed independent of typing speed
  const ERASE_DELAY = Math.max(1, Math.round(12 / 1.67));
  const PAUSE_AFTER_QUOTE = 1300; // ms
  const PAUSE_AFTER_AUTHOR = 2000; // ms
  const PAUSE_BEFORE_ERASE = 500; // ms

  /**
   * Load quotes from static data when the component mounts
   */
  useEffect(() => {
    const loadQuotes = () => {
      try {
        logger.info('Loading quotes for typewriter animation');

        const staticQuotes = getStaticQuotes();

        logger.debug(`Quotes loaded from static data: ${staticQuotes.length} quotes`);

        if (!Array.isArray(staticQuotes)) {
          throw new Error('Invalid quotes data format: expected an array');
        }

        logger.info(`Successfully loaded ${staticQuotes.length} quotes for typewriter`);

        if (staticQuotes.length === 0) {
          throw new Error('No quotes available in static data');
        }

        setQuotes(staticQuotes);

        const randomIndex = Math.floor(Math.random() * staticQuotes.length);
        setCurrentQuoteIndex(randomIndex);

        // Reset refs when starting animation
        quoteCharIndexRef.current = 0;
        authorCharIndexRef.current = 0;
        setPhase('typing-quote');
      } catch (error) {
        logger.error(
          `Error loading quotes: ${error instanceof Error ? error.message : String(error)}`
        );
        const fallbackQuote: Quote = {
          id: 0,
          text: 'Error loading quotes. Please check console for details.',
          author: 'System',
        };
        setQuotes([fallbackQuote]);

        // Reset refs when starting with fallback quote
        quoteCharIndexRef.current = 0;
        authorCharIndexRef.current = 0;
        setPhase('typing-quote');
      }
    };

    loadQuotes();
  }, []);

  // Phase-based animation controller (single RAF loop)
  useEffect(() => {
    if (phase === 'loading' || quotes.length === 0) return;

    const current = quotes[currentQuoteIndex];
    if (!current) return;

    const quoteLen = current.text?.length ?? 0;
    const authorLen = (current.author ?? '').length;

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      switch (phase) {
        case 'typing-quote': {
          const steps = Math.floor(dt / TYPING_DELAY);
          if (steps > 0 && quoteCharIndexRef.current < quoteLen) {
            const newIndex = Math.min(quoteCharIndexRef.current + steps, quoteLen);
            quoteCharIndexRef.current = newIndex;
            setQuoteCharIndex(newIndex);
          }
          if (quoteCharIndexRef.current >= quoteLen) {
            if (pauseUntilRef.current == null) pauseUntilRef.current = ts + PAUSE_AFTER_QUOTE;
            if (ts >= pauseUntilRef.current) {
              pauseUntilRef.current = null;
              setPhase('showing-author');
            }
          }
          break;
        }
        case 'showing-author': {
          if (authorLen === 0) {
            if (pauseUntilRef.current == null) pauseUntilRef.current = ts + PAUSE_AFTER_AUTHOR;
            if (ts >= pauseUntilRef.current) {
              pauseUntilRef.current = null;
              setPhase('waiting');
            }
            break;
          }
          const steps = Math.floor(dt / TYPING_DELAY);
          if (steps > 0 && authorCharIndexRef.current < authorLen) {
            const newIndex = Math.min(authorCharIndexRef.current + steps, authorLen);
            authorCharIndexRef.current = newIndex;
            setAuthorCharIndex(newIndex);
          }
          if (authorCharIndexRef.current >= authorLen) {
            if (pauseUntilRef.current == null) pauseUntilRef.current = ts + PAUSE_AFTER_AUTHOR;
            if (ts >= pauseUntilRef.current) {
              pauseUntilRef.current = null;
              setPhase('waiting');
            }
          }
          break;
        }
        case 'waiting': {
          if (pauseUntilRef.current == null) pauseUntilRef.current = ts + PAUSE_BEFORE_ERASE;
          if (ts >= pauseUntilRef.current) {
            pauseUntilRef.current = null;
            setPhase('erasing-author');
          }
          break;
        }
        case 'erasing-author': {
          const steps = Math.floor(dt / ERASE_DELAY);
          if (steps > 0 && authorCharIndexRef.current > 0) {
            const newIndex = Math.max(authorCharIndexRef.current - steps, 0);
            authorCharIndexRef.current = newIndex;
            setAuthorCharIndex(newIndex);
          }
          if (authorCharIndexRef.current <= 0) {
            setPhase('erasing-quote');
          }
          break;
        }
        case 'erasing-quote': {
          const steps = Math.floor(dt / ERASE_DELAY);
          if (steps > 0 && quoteCharIndexRef.current > 0) {
            const newIndex = Math.max(quoteCharIndexRef.current - steps, 0);
            quoteCharIndexRef.current = newIndex;
            setQuoteCharIndex(newIndex);
          }
          if (quoteCharIndexRef.current <= 0) {
            // Select random quote avoiding immediate repetition
            setCurrentQuoteIndex(prevIndex => {
              if (quotes.length <= 1) return prevIndex;

              let newIndex;
              do {
                newIndex = Math.floor(Math.random() * quotes.length);
              } while (newIndex === prevIndex);

              return newIndex;
            });
            // Reset both refs and state for next quote
            quoteCharIndexRef.current = 0;
            authorCharIndexRef.current = 0;
            setAuthorCharIndex(0);
            setQuoteCharIndex(0);
            setPhase('typing-quote');
          }
          break;
        }
      }

      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    // Start RAF loop
    rafIdRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current != null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTsRef.current = null;
      pauseUntilRef.current = null;
    };
  }, [phase, quotes, currentQuoteIndex]); // FIXED: Removed changing character indices from dependencies

  // Cursor blink interval
  useEffect(() => {
    cursorIntervalRef.current = setInterval(() => setCursorVisible(v => !v), 500);
    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, []);

  // Clear any active timers/raf on unmount (safety)
  useEffect(() => {
    return () => {
      if (rafIdRef.current != null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, []);

  /**
   * Show loading state while quotes are being fetched
   */
  if (quotes.length === 0) {
    return <div className="min-h-[15rem] flex items-center justify-start">Loading quotes...</div>;
  }

  // Get current quote for rendering
  const current = quotes[currentQuoteIndex];
  if (!current) {
    return <div className="min-h-[15rem] flex items-center justify-start">No quotes available</div>;
  }

  // Compute display text based on current animation state
  const displayedQuoteText = current.text?.slice(0, quoteCharIndex) ?? '';
  const displayedAuthorText = (current.author ?? '').slice(0, authorCharIndex);

  // Determine cursor visibility for different phases
  const showQuoteCursor = phase === 'typing-quote' || phase === 'erasing-quote';
  const showAuthorCursor = phase === 'showing-author' || phase === 'erasing-author';
  const showAuthor =
    phase === 'showing-author' || phase === 'waiting' || phase === 'erasing-author';

  /**
   * Render the quote and author with typewriter animation
   */
  return (
    <div className="min-h-[15rem] flex flex-col justify-start" aria-live="polite">
      {/* Quote text - always shown (loading state handled above) */}
      <div
        className="text-xl font-medium text-gray-900 dark:text-gray-100 quote-text-display"
        data-testid="quote-text"
      >
        {displayedQuoteText}
        {showQuoteCursor && <span className={cursorVisible ? '' : 'opacity-0'}>|</span>}
      </div>

      {/* Author text - shown when animation state indicates */}
      {showAuthor && (
        <div className="text-base font-normal text-gray-600 dark:text-gray-400 mt-2">
          {displayedAuthorText}
          {showAuthorCursor && <span className={cursorVisible ? '' : 'opacity-0'}>|</span>}
        </div>
      )}
    </div>
  );
}

// Wrap in React.memo to prevent re-renders when parent changes
// Since TypewriterQuotes has no props, it should never re-render from parent updates
export default memo(TypewriterQuotes);
