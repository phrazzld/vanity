'use client'

import { QUOTES } from '@/app/quotes'
import { useEffect, useState } from 'react'

// six phases
type Phase =
  | 'typingQuote'
  | 'pauseAfterQuote'
  | 'typingAuthor'
  | 'pauseAfterAuthor'
  | 'erasingAuthor'
  | 'erasingQuote'

// tuning constants
const TYPING_SPEED = 25         // ms between typed chars
const ERASE_SPEED = 15          // ms between erasing chars
const PAUSE_AFTER_QUOTE = 1000  // pause once quote is fully typed
const PAUSE_AFTER_AUTHOR = 2000 // pause once author is fully typed
const CURSOR_BLINK_INTERVAL = 500

export default function TypewriterQuotes() {
  // pick a random starting quote
  const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * QUOTES.length))
  const [phase, setPhase] = useState<Phase>('typingQuote')

  // typed “partials”
  const [displayedQuote, setDisplayedQuote] = useState('')
  const [displayedAuthor, setDisplayedAuthor] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)

  // we do inline transformations: convert literal \n sequences
  const rawQuote = QUOTES[quoteIndex].text.replace(/\\n/g, '\n')
  const rawAuthor = QUOTES[quoteIndex].author.replace(/\\n/g, '\n') // just in case

  // ========== CURSOR BLINK ==========

  useEffect(() => {
    const blink = setInterval(() => {
      setCursorVisible(v => !v)
    }, CURSOR_BLINK_INTERVAL)
    return () => clearInterval(blink)
  }, [])

  // ========== MAIN TYPING/ERASING LOGIC ==========

  useEffect(() => {
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
          const nextIndex = Math.floor(Math.random() * QUOTES.length)
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
    quoteIndex
  ])

  // ========== DETERMINE WHERE THE CURSOR GOES ==========

  const isQuoteActive = [
    'typingQuote',
    'pauseAfterQuote',
    'erasingQuote'
  ].includes(phase)

  // ========== RENDER ==========

  return (
    <div
      style={{
        // anchor so large multi-line quotes don’t shift the page too wildly
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
