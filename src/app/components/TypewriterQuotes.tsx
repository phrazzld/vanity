'use client'

/**
 * @file TypewriterQuotes component that displays quotes with a typewriter animation effect
 * @module components/TypewriterQuotes
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'
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
  
  // Track whether we're currently in a punctuation pause
  const [inPunctuationPause, setInPunctuationPause] = useState(false)
  
  // Track the typing interval
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Track active timeouts
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  
  // Helper function to safely set a timeout and track it for cleanup
  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(callback, delay)
    timeoutsRef.current.push(timeoutId)
    return timeoutId
  }, [])
  
  // Helper function to safely clear all tracked timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

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
      quoteSizerRef.current.textContent = rawQuote
      setQuoteHeight(quoteSizerRef.current.clientHeight)
    }
    
    if (rawAuthor && authorSizerRef.current) {
      authorSizerRef.current.textContent = rawAuthor
      setAuthorHeight(authorSizerRef.current.clientHeight)
    }
  }, [rawQuote, rawAuthor])

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
  const getPunctuationDelayMultiplier = useCallback((text: string, currentIndex: number): number => {
    if (currentIndex === 0) return 1
    
    // Check if previous character was also punctuation
    const prevChar = text[currentIndex - 1]
    const currentChar = text[currentIndex]
    
    const isPrevCharPunctuation = Object.keys(PUNCTUATION_PAUSES).includes(prevChar)
    const isCurrentCharPunctuation = Object.keys(PUNCTUATION_PAUSES).includes(currentChar)
    
    // If both current and previous characters are punctuation, reduce the delay
    if (isPrevCharPunctuation && isCurrentCharPunctuation) {
      // Use 0.3 (30%) of the normal pause for consecutive punctuation
      return 0.3
    }
    
    return 1
  }, [])

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
  }, [inPunctuationPause])

  /**
   * Types a single character in the quote text,
   * and applies appropriate punctuation pauses
   * 
   * This function always references the latest state values 
   * directly rather than through dependencies.
   */
  const typeNextQuoteCharacter = useCallback(() => {
    // Use functional updates to always work with the latest state
    setDisplayedQuote(currentDisplayedQuote => {
      // Check if we're done
      if (currentDisplayedQuote.length >= rawQuote.length) {
        // We've finished typing the quote
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
        
        // Move to the next phase after a short pause
        safeSetTimeout(() => {
          setPhase('pauseAfterQuote')
        }, PAUSE_AFTER_QUOTE)
        
        return currentDisplayedQuote; // No change needed
      }
      
      // Add the next character
      const nextChar = rawQuote[currentDisplayedQuote.length]
      const newDisplayedQuote = currentDisplayedQuote + nextChar
      
      // Check if we should pause after this character
      const isPunctuation = Object.keys(PUNCTUATION_PAUSES).includes(nextChar)
      const shouldPauseAfter = isPunctuation && (
        nextChar === '.' || nextChar === '!' || nextChar === '?' || 
        nextChar === ';' || nextChar === ':'
      )
      
      // If this is a punctuation mark we should pause after
      if (shouldPauseAfter) {
        // Get multiplier for consecutive punctuation
        const multiplier = getPunctuationDelayMultiplier(rawQuote, currentDisplayedQuote.length)
        
        // Calculate punctuation pause duration
        const punctuationDelay = PUNCTUATION_PAUSES[nextChar as keyof typeof PUNCTUATION_PAUSES] * multiplier
        
        // Set the pause indicator
        setInPunctuationPause(true)
        
        // Pause typing during the punctuation pause
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
        
        // Schedule resuming typing after the pause
        safeSetTimeout(() => {
          setInPunctuationPause(false)
          typingIntervalRef.current = setInterval(typeNextQuoteCharacter, TYPING_SPEED)
        }, punctuationDelay)
      }
      
      return newDisplayedQuote;
    });
  // Only depend on the immutable helper functions
  }, [getPunctuationDelayMultiplier, safeSetTimeout, rawQuote])

  /**
   * Types a single character in the author text,
   * and applies appropriate punctuation pauses
   * 
   * This function always references the latest state values 
   * directly rather than through dependencies.
   */
  const typeNextAuthorCharacter = useCallback(() => {
    // Use functional updates to always work with the latest state
    setDisplayedAuthor(currentDisplayedAuthor => {
      // Check if we're done
      if (currentDisplayedAuthor.length >= rawAuthor.length) {
        // We've finished typing the author
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
        
        // Move to the next phase after a short pause
        safeSetTimeout(() => {
          setPhase('pauseAfterAuthor')
        }, PAUSE_AFTER_AUTHOR)
        
        return currentDisplayedAuthor; // No change needed
      }
      
      // Add the next character
      const nextChar = rawAuthor[currentDisplayedAuthor.length]
      const newDisplayedAuthor = currentDisplayedAuthor + nextChar
      
      // For author text, we only pause after commas
      const isComma = nextChar === ','
      
      // If this is a comma, add a pause
      if (isComma) {
        // Get multiplier for consecutive punctuation
        const multiplier = getPunctuationDelayMultiplier(rawAuthor, currentDisplayedAuthor.length)
        
        // Calculate punctuation pause duration 
        const commaDelay = PUNCTUATION_PAUSES[nextChar as keyof typeof PUNCTUATION_PAUSES] * multiplier
        
        // Set the pause indicator
        setInPunctuationPause(true)
        
        // Pause typing during the punctuation pause
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
        
        // Schedule resuming typing after the pause
        safeSetTimeout(() => {
          setInPunctuationPause(false)
          typingIntervalRef.current = setInterval(typeNextAuthorCharacter, TYPING_SPEED)
        }, commaDelay)
      }
      
      return newDisplayedAuthor;
    });
  // Only depend on the immutable helper functions
  }, [getPunctuationDelayMultiplier, safeSetTimeout, rawAuthor])

  /**
   * Main animation effect
   * 
   * Handles the core logic for the typewriter animation based on the current phase.
   * This effect manages phase transitions and typewriter animation.
   * 
   * IMPORTANT: This effect only runs when the phase changes, not on every character update.
   */
  useEffect(() => {
    // Skip if still loading or no quotes available
    if (phase === 'loading' || quotes.length === 0) {
      return
    }
    
    // Clean up existing intervals and timers when phase changes
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }
    
    clearAllTimeouts()
    
    // Phase-specific logic
    switch (phase) {
      case 'typingQuote':
        // Reset displayed quote if needed
        if (displayedQuote.length === 0) {
          // Start typing the quote character by character
          typingIntervalRef.current = setInterval(typeNextQuoteCharacter, TYPING_SPEED)
        } else if (displayedQuote.length >= rawQuote.length) {
          // Already fully typed, move to next phase
          safeSetTimeout(() => {
            setPhase('pauseAfterQuote')
          }, PAUSE_AFTER_QUOTE)
        } else {
          // Resume typing from current position
          typingIntervalRef.current = setInterval(typeNextQuoteCharacter, TYPING_SPEED)
        }
        break
        
      case 'pauseAfterQuote':
        // Brief pause after quote is fully typed before showing author
        safeSetTimeout(() => {
          setPhase('typingAuthor')
        }, 300)
        break
        
      case 'typingAuthor':
        // Reset displayed author if needed
        if (displayedAuthor.length === 0) {
          // Start typing the author character by character
          typingIntervalRef.current = setInterval(typeNextAuthorCharacter, TYPING_SPEED)
        } else if (displayedAuthor.length >= rawAuthor.length) {
          // Already fully typed, move to next phase
          safeSetTimeout(() => {
            setPhase('pauseAfterAuthor')
          }, PAUSE_AFTER_AUTHOR)
        } else {
          // Resume typing from current position
          typingIntervalRef.current = setInterval(typeNextAuthorCharacter, TYPING_SPEED)
        }
        break
        
      case 'pauseAfterAuthor':
        // Longer pause after author is fully typed for reading time
        safeSetTimeout(() => {
          setPhase('erasingAuthor')
        }, 500)
        break
        
      case 'erasingAuthor':
        // Handle erasing author with recursive timeouts
        const eraseAuthor = () => {
          if (displayedAuthor.length > 0) {
            setDisplayedAuthor(prev => prev.slice(0, -1))
            safeSetTimeout(eraseAuthor, ERASE_SPEED)
          } else {
            setPhase('erasingQuote')
          }
        }
        
        // Start the erasing process
        safeSetTimeout(eraseAuthor, ERASE_SPEED)
        break
        
      case 'erasingQuote':
        // Handle erasing quote with recursive timeouts
        const eraseQuote = () => {
          if (displayedQuote.length > 0) {
            setDisplayedQuote(prev => prev.slice(0, -1))
            safeSetTimeout(eraseQuote, ERASE_SPEED)
          } else {
            // Quote is fully erased, select a new random quote and start over
            const nextIndex = Math.floor(Math.random() * quotes.length)
            setQuoteIndex(nextIndex)
            setPhase('typingQuote')
          }
        }
        
        // Start the erasing process
        safeSetTimeout(eraseQuote, ERASE_SPEED)
        break
    }
    
    // Cleanup function to clear any timers when component unmounts or phase changes
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
      clearAllTimeouts()
    }
  }, [
    phase, 
    quotes, 
    // Removed displayedQuote and displayedAuthor from dependencies
    // to prevent re-running this effect on every character update
    rawQuote, 
    rawAuthor,
    typeNextQuoteCharacter,
    typeNextAuthorCharacter,
    clearAllTimeouts,
    safeSetTimeout
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