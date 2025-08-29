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

  // Cursor blink state
  const [cursorVisible, setCursorVisible] = useState(true);
  const cursorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Single RAF-driven loop for animation
  const rafIdRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const pauseUntilRef = useRef<number | null>(null);

  // Animation speeds and pauses
  const TYPING_DELAY = 12; // ms per character
  // Deletion should be 67% faster than typing => lower delay (higher speed)
  const ERASE_DELAY = Math.max(1, Math.round(TYPING_DELAY / 1.67));
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
          if (steps > 0 && quoteCharIndex < quoteLen) {
            setQuoteCharIndex(i => Math.min(i + steps, quoteLen));
          }
          if (quoteCharIndex >= quoteLen) {
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
          if (steps > 0 && authorCharIndex < authorLen) {
            setAuthorCharIndex(i => Math.min(i + steps, authorLen));
          }
          if (authorCharIndex >= authorLen) {
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
          if (steps > 0 && authorCharIndex > 0) {
            setAuthorCharIndex(i => Math.max(i - steps, 0));
          }
          if (authorCharIndex <= 0) {
            setPhase('erasing-quote');
          }
          break;
        }
        case 'erasing-quote': {
          const steps = Math.floor(dt / ERASE_DELAY);
          if (steps > 0 && quoteCharIndex > 0) {
            setQuoteCharIndex(i => Math.max(i - steps, 0));
          }
          if (quoteCharIndex <= 0) {
            setCurrentQuoteIndex(i => (i + 1) % quotes.length);
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
  }, [phase, quotes, currentQuoteIndex, quoteCharIndex, authorCharIndex]);

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
  if (phase === 'loading') {
    return (
      <div
        style={{
          minHeight: '15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        Loading quotes...
      </div>
    );
  }

  /**
   * Render the quote and author with typewriter animation
   * Clean phase-based rendering with conditional display
   */
  const current = quotes[currentQuoteIndex];
  const displayedQuoteText = current?.text?.slice(0, quoteCharIndex) ?? '';
  const displayedAuthorText = (current?.author ?? '').slice(0, authorCharIndex);
  return (
    <div className="min-h-[15rem] flex flex-col justify-start" aria-live="polite">
      {/* Quote text - always shown (loading state handled above) */}
      <div
        className="text-xl font-medium text-gray-900 dark:text-gray-100"
        data-testid="quote-text"
      >
        {displayedQuoteText}
        {(phase === 'typing-quote' || phase === 'erasing-quote') && (
          <span className={cursorVisible ? '' : 'opacity-0'}>|</span>
        )}
      </div>

      {/* Author text - shown after quote is typed and during erasing */}
      {(phase === 'showing-author' ||
        phase === 'waiting' ||
        phase === 'erasing-author' ||
        phase === 'erasing-quote') && (
        <div className="text-base font-normal text-gray-600 dark:text-gray-400 mt-2">
          {displayedAuthorText}
          {(phase === 'showing-author' || phase === 'erasing-author') && (
            <span className={cursorVisible ? '' : 'opacity-0'}>|</span>
          )}
        </div>
      )}
    </div>
  );
}

// Wrap in React.memo to prevent re-renders when parent changes
// Since TypewriterQuotes has no props, it should never re-render from parent updates
export default memo(TypewriterQuotes);
