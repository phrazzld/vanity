'use client';

import { useEffect, useState, useRef } from 'react';
import type { Quote } from '@/types';

function TypewriterQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [displayAuthor, setDisplayAuthor] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTypingAuthor, setIsTypingAuthor] = useState(false);

  // Track nested timers for cleanup
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load quotes once
  useEffect(() => {
    fetch('/data/quotes.json')
      .then(res => res.json())
      .then((data: Quote[]) => {
        setQuotes(data);
        setCurrentIndex(Math.floor(Math.random() * data.length));
      })
      .catch(err => console.error('Failed to load quotes:', err));
  }, []);

  // Simple typewriter effect
  useEffect(() => {
    if (quotes.length === 0) return;

    const quote = quotes[currentIndex];
    if (!quote) return;

    const fullText = quote.text || '';
    const fullAuthor = quote.author || '';

    const timer = setTimeout(
      () => {
        if (!isDeleting && !isTypingAuthor) {
          // Typing quote
          if (displayText.length < fullText.length) {
            setDisplayText(fullText.slice(0, displayText.length + 1));
          } else {
            pauseTimerRef.current = setTimeout(() => setIsTypingAuthor(true), 1500);
          }
        } else if (isTypingAuthor && !isDeleting) {
          // Typing author
          if (displayAuthor.length < fullAuthor.length) {
            setDisplayAuthor(fullAuthor.slice(0, displayAuthor.length + 1));
          } else {
            pauseTimerRef.current = setTimeout(() => setIsDeleting(true), 2500);
          }
        } else if (isDeleting) {
          // Erasing
          if (displayAuthor.length > 0) {
            setDisplayAuthor(displayAuthor.slice(0, -1));
          } else if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            // Move to next quote
            setIsDeleting(false);
            setIsTypingAuthor(false);
            setCurrentIndex(prev => {
              let next;
              do {
                next = Math.floor(Math.random() * quotes.length);
              } while (next === prev && quotes.length > 1);
              return next;
            });
          }
        }
      },
      isDeleting ? 8 : isTypingAuthor ? 30 : 30
    );

    return () => {
      clearTimeout(timer);
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, [quotes, currentIndex, displayText, displayAuthor, isDeleting, isTypingAuthor]);

  if (quotes.length === 0) {
    return <div className="text-center text-gray-400">Loading quotes...</div>;
  }

  return (
    <>
      <style jsx>{`
        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
        .cursor-blink {
          animation: blink 1s infinite;
        }
      `}</style>
      <div className="min-h-[200px] flex flex-col justify-start">
        <div className="max-w-4xl w-full">
          <p
            className="text-base md:text-lg text-gray-800 dark:text-gray-200 mb-2 font-light"
            data-testid="quote-text"
          >
            {displayText}
            {!isTypingAuthor && <span className="cursor-blink">|</span>}
          </p>
          {displayAuthor && (
            <p
              className="text-sm md:text-base text-gray-500 dark:text-gray-500"
              data-testid="author-text"
            >
              {displayAuthor}
              <span className="cursor-blink">|</span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default TypewriterQuotes;
