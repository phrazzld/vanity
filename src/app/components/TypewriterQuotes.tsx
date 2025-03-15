'use client'

import { useEffect, useState } from 'react'

type QuoteType = {
  id: number
  text: string
  author: string | null
}

// six phases
type Phase =
  | 'typingQuote'
  | 'pauseAfterQuote'
  | 'typingAuthor'
  | 'pauseAfterAuthor'
  | 'erasingAuthor'
  | 'erasingQuote'
  | 'loading'

// tuning constants
const TYPING_SPEED = 25         // ms between typed chars
const ERASE_SPEED = 15          // ms between erasing chars
const PAUSE_AFTER_QUOTE = 1000  // pause once quote is fully typed
const PAUSE_AFTER_AUTHOR = 2000 // pause once author is fully typed
const CURSOR_BLINK_INTERVAL = 500

export default function TypewriterQuotes() {
  const [quotes, setQuotes] = useState<QuoteType[]>([])
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('loading')

  // typed "partials"
  const [displayedQuote, setDisplayedQuote] = useState('')
  const [displayedAuthor, setDisplayedAuthor] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)

  // Fetch quotes from API
  useEffect(() => {
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
        setQuotes([{ id: 0, text: 'Error loading quotes from database. Please check console for details.', author: 'System' }])
        setPhase('typingQuote')
      }
    }

    fetchQuotes()
  }, [])

  // Get the current quote and author (safely)
  const currentQuote = quotes[quoteIndex]
  const rawQuote = currentQuote ? currentQuote.text.replace(/\\n/g, '\n') : ''
  const rawAuthor = currentQuote && currentQuote.author 
    ? currentQuote.author.replace(/\\n/g, '\n') 
    : ''

  // ========== CURSOR BLINK ==========

  useEffect(() => {
    const blink = setInterval(() => {
      setCursorVisible(v => !v)
    }, CURSOR_BLINK_INTERVAL)
    return () => clearInterval(blink)
  }, [])

  // ========== MAIN TYPING/ERASING LOGIC ==========

  useEffect(() => {
    if (phase === 'loading' || quotes.length === 0) {
      return // Don't run typewriter logic until quotes are loaded
    }

    let timer: NodeJS.Timeout

    switch (phase) {
      case 'typingQuote':
        if (displayedQuote.length < rawQuote.length) {
          timer = setTimeout(() => {
            setDisplayedQuote(rawQuote.slice(0, displayedQuote.length + 1))
          }, TYPING_SPEED)
        } else {
          // fully typed quote
          timer = setTimeout(() => {
            setPhase('pauseAfterQuote')
          }, PAUSE_AFTER_QUOTE)
        }
        break

      case 'pauseAfterQuote':
        // short gap, then type author
        timer = setTimeout(() => {
          setPhase('typingAuthor')
        }, 300)
        break

      case 'typingAuthor':
        if (displayedAuthor.length < rawAuthor.length) {
          timer = setTimeout(() => {
            setDisplayedAuthor(rawAuthor.slice(0, displayedAuthor.length + 1))
          }, TYPING_SPEED)
        } else {
          // fully typed author
          timer = setTimeout(() => {
            setPhase('pauseAfterAuthor')
          }, PAUSE_AFTER_AUTHOR)
        }
        break

      case 'pauseAfterAuthor':
        // short gap, then erase author
        timer = setTimeout(() => {
          setPhase('erasingAuthor')
        }, 500)
        break

      case 'erasingAuthor':
        if (displayedAuthor.length > 0) {
          timer = setTimeout(() => {
            setDisplayedAuthor(displayedAuthor.slice(0, -1))
          }, ERASE_SPEED)
        } else {
          // done erasing author, move on to quote
          setPhase('erasingQuote')
        }
        break

      case 'erasingQuote':
        if (displayedQuote.length > 0) {
          timer = setTimeout(() => {
            setDisplayedQuote(displayedQuote.slice(0, -1))
          }, ERASE_SPEED)
        } else {
          // done erasing everything, pick next random quote
          const nextIndex = Math.floor(Math.random() * quotes.length)
          setQuoteIndex(nextIndex)
          setPhase('typingQuote')
        }
        break
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [
    phase,
    displayedQuote,
    displayedAuthor,
    rawQuote,
    rawAuthor,
    quoteIndex,
    quotes
  ])

  // ========== DETERMINE WHERE THE CURSOR GOES ==========

  const isQuoteActive = [
    'typingQuote',
    'pauseAfterQuote',
    'erasingQuote'
  ].includes(phase)

  // Show loading state if no quotes available
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

  // ========== RENDER ==========

  return (
    <div
      style={{
        // anchor so large multi-line quotes don't shift the page too wildly
        margin: '2rem auto 0 auto',
        width: '90%',
        maxWidth: '700px',
        minHeight: '15rem', // more height for big quotes
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      {/* quote text */}
      <div
        data-testid="quote-text"
        style={{
          fontSize: '1.25rem',
          fontWeight: 500,
          lineHeight: 1.6, // comfortable reading for multi-line
          whiteSpace: 'pre-wrap', // preserve actual line breaks
          marginBottom: '0.75rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {displayedQuote}
        {isQuoteActive && cursorVisible && (
          <span style={{ borderRight: '2px solid #444', marginLeft: '2px' }} />
        )}
      </div>

      {/* author text */}
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
        {!isQuoteActive && cursorVisible && (
          <span style={{ borderRight: '2px solid #444', marginLeft: '2px' }} />
        )}
      </div>
    </div>
  )
}