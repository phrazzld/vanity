'use client'

/**
 * @file TypewriterQuotes component that displays quotes with a typewriter animation effect
 * @module components/TypewriterQuotes
 */

import React, { useEffect, useState, useRef } from 'react'
import type { Quote } from '@/types'

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
  | 'loading'

/**
 * Animation timing constants (in milliseconds)
 */
// Speed for typing characters (lower = faster)
const TYPING_SPEED = 25
// Speed for erasing characters (lower = faster)
const ERASE_SPEED = 15
// Time to pause after quote is fully typed
const PAUSE_AFTER_QUOTE = 1000
// Time to pause after author is fully typed 
const PAUSE_AFTER_AUTHOR = 2000
// How fast the cursor blinks
const CURSOR_BLINK_INTERVAL = 500
// How fast the cursor blinks during punctuation pauses (faster to indicate activity)
const PUNCTUATION_BLINK_INTERVAL = 300

/**
 * Punctuation pause durations (in milliseconds)
 * These values define how long to pause after each type of punctuation mark
 * to create a more natural reading rhythm that mimics human speech patterns.
 */
const PUNCTUATION_PAUSES = {
  '.': 600,  // Full stop/period
  '!': 600,  // Exclamation mark
  '?': 600,  // Question mark
  ',': 300,  // Comma
  ';': 450,  // Semicolon
  ':': 450,  // Colon
  // Add more punctuation marks if needed
}

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
  const [quotes, setQuotes] = useState<Quote[]>([])
  // Index of the currently displayed quote
  const [quoteIndex, setQuoteIndex] = useState(0)
  // Current animation phase
  const [phase, setPhase] = useState<Phase>('loading')

  // Current displayed text (partial strings that grow/shrink during animation)
  const [displayedQuote, setDisplayedQuote] = useState('')
  const [displayedAuthor, setDisplayedAuthor] = useState('')
  // Controls the blinking cursor appearance
  const [cursorVisible, setCursorVisible] = useState(true)
  
  // For dynamic text container sizing
  const [quoteHeight, setQuoteHeight] = useState(0)
  const [authorHeight, setAuthorHeight] = useState(0)
  const quoteSizerRef = useRef<HTMLDivElement>(null)
  const authorSizerRef = useRef<HTMLDivElement>(null)

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
        console.log('TypewriterQuotes: Fetching quotes from API...')
        const response = await fetch('/api/quotes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add cache busting to prevent stale data
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          // Force fetch even if response is in the cache
          cache: 'no-store'
        })
        
        console.log('TypewriterQuotes: API response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log(`TypewriterQuotes: Received ${data.length} quotes from API`)
        
        if (data.length === 0) {
          throw new Error('No quotes received from API')
        }
        
        setQuotes(data)
        
        // Initialize with a random quote after fetching
        const randomIndex = Math.floor(Math.random() * data.length)
        setQuoteIndex(randomIndex)
        setPhase('typingQuote')
      } catch (error) {
        console.error('TypewriterQuotes: Error fetching quotes:', error)
        // Fallback to a default quote if API fails
        setQuotes([{ id: 0, text: 'Error loading quotes from database. Please check console for details.', author: 'System' } as Quote])
        setPhase('typingQuote')
      }
    }

    fetchQuotes()
  }, [])

  /**
   * Get the current quote and prepare it for display
   * Safely handles empty states and replaces escape sequences with proper line breaks
   */
  const currentQuote = quotes[quoteIndex]
  const rawQuote = currentQuote ? currentQuote.text.replace(/\\n/g, '\n') : ''
  const rawAuthor = currentQuote && currentQuote.author 
    ? currentQuote.author.replace(/\\n/g, '\n') 
    : ''

  /**
   * Update container heights when quote changes
   * 
   * This effect calculates the proper height of the full text
   * and updates state to prevent layout shifts during typing
   */
  useEffect(() => {
    if (rawQuote && quoteSizerRef.current) {
      quoteSizerRef.current.textContent = rawQuote;
      setQuoteHeight(quoteSizerRef.current.clientHeight);
    }
    
    if (rawAuthor && authorSizerRef.current) {
      authorSizerRef.current.textContent = rawAuthor;
      setAuthorHeight(authorSizerRef.current.clientHeight);
    }
  }, [rawQuote, rawAuthor]);

  // Track whether we're currently in a punctuation pause
  const [inPunctuationPause, setInPunctuationPause] = useState(false)

  /**
   * Cursor blinking effect
   * 
   * Sets up an interval to toggle cursor visibility state
   * for the blinking text cursor animation.
   * Blinks faster during punctuation pauses to indicate activity.
   */
  useEffect(() => {
    // Setup blinking interval with appropriate speed
    const blinkInterval = inPunctuationPause 
      ? PUNCTUATION_BLINK_INTERVAL 
      : CURSOR_BLINK_INTERVAL
    
    const blink = setInterval(() => {
      setCursorVisible(v => !v)
    }, blinkInterval)
    
    // Clean up interval on unmount
    return () => clearInterval(blink)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inPunctuationPause])

  /**
   * Helper function to optimize consecutive punctuation
   * 
   * This creates a debounce effect for consecutive punctuation marks,
   * reducing the pause time when multiple punctuation marks appear together.
   * For example, in text like "Wait...what?" the three periods would have
   * a reduced combined delay rather than three full delays.
   * 
   * @param text The full text being analyzed
   * @param currentIndex The current position in the text
   * @returns The adjusted delay multiplier (0-1)
   */
  const getPunctuationDelayMultiplier = (text: string, currentIndex: number): number => {
    if (currentIndex === 0) return 1;
    
    // Check if previous character was also punctuation
    const prevChar = text[currentIndex - 1];
    const currentChar = text[currentIndex];
    
    const isPrevCharPunctuation = Object.keys(PUNCTUATION_PAUSES).includes(prevChar);
    const isCurrentCharPunctuation = Object.keys(PUNCTUATION_PAUSES).includes(currentChar);
    
    // If both current and previous characters are punctuation, reduce the delay
    if (isPrevCharPunctuation && isCurrentCharPunctuation) {
      // Use 0.3 (30%) of the normal pause for consecutive punctuation
      return 0.3;
    }
    
    return 1;
  };

  /**
   * Main typewriter animation effect
   * 
   * Handles the core logic for the typewriter animation:
   * - Types characters one by one for quote and author
   * - Manages pauses between phases
   * - Erases text before moving to next quote
   * - Selects a new random quote when cycle completes
   * - Optimizes pauses for punctuation marks
   * 
   * The effect runs whenever any of its dependencies change,
   * primarily when the phase or displayed text changes.
   */
  useEffect(() => {
    // Skip if still loading or no quotes available
    if (phase === 'loading' || quotes.length === 0) {
      return // Don't run typewriter logic until quotes are loaded
    }

    let timer: NodeJS.Timeout
    let animationFrameId: number

    switch (phase) {
      case 'typingQuote':
        if (displayedQuote.length < rawQuote.length) {
          // Get the current character that's being typed
          const currentChar = rawQuote[displayedQuote.length]
          
          // First, add the character to the displayed text at the normal speed
          const startTime = performance.now()
          const basicTypingDelay = TYPING_SPEED
          
          const basicTypingStep = (timestamp: number) => {
            const elapsed = timestamp - startTime
            
            if (elapsed >= basicTypingDelay) {
              // Time to update the text
              setDisplayedQuote(rawQuote.slice(0, displayedQuote.length + 1))
              
              // After rendering the character, check if it's a punctuation mark that needs a pause
              const isPunctuation = Object.keys(PUNCTUATION_PAUSES).includes(currentChar)
              
              if (isPunctuation && (currentChar === '.' || currentChar === '!' || 
                                   currentChar === '?' || currentChar === ';' || 
                                   currentChar === ':')) {
                // Get multiplier for consecutive punctuation (debounce effect)
                const multiplier = getPunctuationDelayMultiplier(rawQuote, displayedQuote.length)
                
                // Calculate the punctuation pause duration
                const punctuationDelay = PUNCTUATION_PAUSES[currentChar as keyof typeof PUNCTUATION_PAUSES] * multiplier
                
                // Set the pause state for visual indicator
                setInPunctuationPause(true)
                
                // Add additional delay after the punctuation
                setTimeout(() => {
                  // Reset punctuation pause state when the pause is done
                  setInPunctuationPause(false)
                }, punctuationDelay)
              }
            } else {
              // Not enough time has passed, continue the animation
              animationFrameId = requestAnimationFrame(basicTypingStep)
            }
          }
          
          animationFrameId = requestAnimationFrame(basicTypingStep)
        } else {
          // Quote is fully typed, pause before showing the author
          timer = setTimeout(() => {
            setPhase('pauseAfterQuote')
          }, PAUSE_AFTER_QUOTE)
        }
        break

      case 'pauseAfterQuote':
        // Brief pause after quote is displayed, then begin typing author
        timer = setTimeout(() => {
          setPhase('typingAuthor')
        }, 300)
        break

      case 'typingAuthor':
        if (displayedAuthor.length < rawAuthor.length) {
          // Get the current character that's being typed
          const currentChar = rawAuthor[displayedAuthor.length]
          
          // First, add the character to the displayed text at the normal speed
          const startTime = performance.now()
          const basicTypingDelay = TYPING_SPEED
          
          const basicTypingStep = (timestamp: number) => {
            const elapsed = timestamp - startTime
            
            if (elapsed >= basicTypingDelay) {
              // Time to update the text
              setDisplayedAuthor(rawAuthor.slice(0, displayedAuthor.length + 1))
              
              // After rendering the character, check if it's a comma (only pause for commas in author)
              const isComma = currentChar === ','
              
              if (isComma) {
                // Get multiplier for consecutive punctuation (debounce effect)
                const multiplier = getPunctuationDelayMultiplier(rawAuthor, displayedAuthor.length)
                
                // Calculate the punctuation pause duration
                const punctuationDelay = PUNCTUATION_PAUSES[currentChar as keyof typeof PUNCTUATION_PAUSES] * multiplier
                
                // Set the pause state for visual indicator
                setInPunctuationPause(true)
                
                // Add additional delay after the punctuation
                setTimeout(() => {
                  // Reset punctuation pause state when the pause is done
                  setInPunctuationPause(false)
                }, punctuationDelay)
              }
            } else {
              // Not enough time has passed, continue the animation
              animationFrameId = requestAnimationFrame(basicTypingStep)
            }
          }
          
          animationFrameId = requestAnimationFrame(basicTypingStep)
        } else {
          // Author is fully typed, pause for reading
          timer = setTimeout(() => {
            setPhase('pauseAfterAuthor')
          }, PAUSE_AFTER_AUTHOR)
        }
        break

      case 'pauseAfterAuthor':
        // Longer pause after author is displayed, then begin erasing
        timer = setTimeout(() => {
          setPhase('erasingAuthor')
        }, 500)
        break

      case 'erasingAuthor':
        if (displayedAuthor.length > 0) {
          // Erase author one character at a time from end
          timer = setTimeout(() => {
            setDisplayedAuthor(displayedAuthor.slice(0, -1))
          }, ERASE_SPEED)
        } else {
          // Author is fully erased, begin erasing the quote
          setPhase('erasingQuote')
        }
        break

      case 'erasingQuote':
        if (displayedQuote.length > 0) {
          // Erase quote one character at a time from end
          timer = setTimeout(() => {
            setDisplayedQuote(displayedQuote.slice(0, -1))
          }, ERASE_SPEED)
        } else {
          // Quote is fully erased, select a new random quote and start over
          const nextIndex = Math.floor(Math.random() * quotes.length)
          setQuoteIndex(nextIndex)
          setPhase('typingQuote')
        }
        break
    }

    // Clean up timer and animation frame on unmount or when dependencies change
    return () => {
      if (timer) clearTimeout(timer)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [
    phase,
    displayedQuote,
    displayedAuthor,
    rawQuote,
    rawAuthor,
    quoteIndex,
    quotes,
    inPunctuationPause
  ])

  /**
   * Determine which element should display the cursor
   * 
   * Based on current animation phase, determine whether the
   * cursor should be shown in the quote or author element
   */
  const isQuoteActive = [
    'typingQuote',
    'pauseAfterQuote',
    'erasingQuote'
  ].includes(phase)

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
    )
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
      {/* Invisible div containing full quote text to calculate proper height */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: '100%',
          fontSize: '1.25rem',
          fontWeight: 500,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          fontFamily: 'Inter, sans-serif',
        }}
        ref={quoteSizerRef}
      />

      {/* Quote text element with blinking cursor when active */}
      <div
        data-testid="quote-text"
        style={{
          fontSize: '1.25rem',
          fontWeight: 500,
          lineHeight: 1.6, // Comfortable reading for multi-line quotes
          whiteSpace: 'pre-wrap', // Preserve actual line breaks in text
          marginBottom: '0.75rem',
          fontFamily: 'Inter, sans-serif',
          minHeight: quoteHeight ? `${quoteHeight}px` : 'auto',
        }}
      >
        {displayedQuote}
        {/* Show cursor in quote element when quote is being manipulated */}
        {isQuoteActive && cursorVisible && (
          <span 
            style={{ 
              borderRight: inPunctuationPause ? '3px solid #444' : '2px solid #444', 
              marginLeft: '2px',
              transition: 'border-width 0.1s ease-in-out'
            }} 
          />
        )}
      </div>

      {/* Invisible div containing full author text to calculate proper height */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: '100%',
          fontSize: '1rem',
          fontWeight: 400,
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          fontFamily: 'Inter, sans-serif',
        }}
        ref={authorSizerRef}
      />

      {/* Author attribution with blinking cursor when active */}
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 400,
          color: '#666',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          fontFamily: 'Inter, sans-serif',
          minHeight: authorHeight ? `${authorHeight}px` : 'auto',
        }}
      >
        {displayedAuthor}
        {/* Show cursor in author element when author is being manipulated */}
        {!isQuoteActive && cursorVisible && (
          <span 
            style={{ 
              borderRight: inPunctuationPause ? '3px solid #444' : '2px solid #444', 
              marginLeft: '2px',
              transition: 'border-width 0.1s ease-in-out'
            }} 
          />
        )}
      </div>
    </div>
  )
}