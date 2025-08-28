# TODO

## TypewriterQuotes Critical Fix - Simplification Required

**PROBLEM**: Current implementation stalls mid-quote and types too slowly (25ms = 40 chars/sec)  
**ROOT CAUSE**: Over-engineered 350+ line requestAnimationFrame system with complex state coordination  
**SOLUTION**: Simple setTimeout-based typing with clean phase separation

### Phase 1: Remove Complexity (Demolition)

- [x] **Delete requestAnimationFrame animation loop** from `TypewriterQuotes.tsx:239-350`
  - Remove `animate()` function and all RAF scheduling logic
  - This eliminates timing accumulator desync issues causing stalls
- [x] **Remove performance tracking infrastructure** from `TypewriterQuotes.tsx:50-87`
  - Delete `trackFramePerformance()` function
  - Delete `lastFrameTime`, `frameCount`, `FRAME_BUDGET` variables
  - Performance monitoring adds overhead without value for portfolio site

- [x] **Delete all refs used for state coordination** from `TypewriterQuotes.tsx:114-118`
  - Remove `quoteIndexRef`, `pausedRef`, `quotesRef`, `rawQuoteRef`, `rawAuthorRef`
  - Replace with simple React state - refs cause coordination failures

- [x] **Remove mouse hover pause handler** from `TypewriterQuotes.tsx:389-394`
  - Delete `onMouseEnter` and `onMouseLeave` event handlers
  - This feature causes `pausedRef` to get stuck, contributing to stalls

- [x] **Remove spacebar pause keyboard handler** from `TypewriterQuotes.tsx:218-228`
  - Delete entire keyboard useEffect and `handleKeyDown` function
  - Portfolio doesn't need game-like controls

- [x] **Strip cursor blinking logic** from `TypewriterQuotes.tsx:197-211`
  - Delete cursor visibility state and interval
  - Replace with CSS animation for simpler, more reliable cursor

### Phase 2: Implement Simple Timer-Based Typing

- [x] **Create minimal state structure** at component top

  ```typescript
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [phase, setPhase] = useState<'typing-quote' | 'showing-author' | 'waiting'>('typing-quote');
  const [displayedQuoteText, setDisplayedQuoteText] = useState('');
  const [displayedAuthorText, setDisplayedAuthorText] = useState('');
  ```

- [x] **Implement recursive character typing function** using setTimeout

  ```typescript
  const typeText = useCallback(
    (
      text: string,
      currentIndex: number,
      setText: (text: string) => void,
      onComplete: () => void
    ) => {
      if (currentIndex <= text.length) {
        setText(text.slice(0, currentIndex));
        setTimeout(() => typeText(text, currentIndex + 1, setText, onComplete), 8);
      } else {
        onComplete();
      }
    },
    []
  );
  ```

  - 8ms interval = 125 chars/sec (3x faster than current)
  - No accumulator, no RAF, just simple setTimeout chain

- [x] **Create phase-based animation controller** in single useEffect

  ```typescript
  useEffect(() => {
    const currentQuote = quotesData[currentQuoteIndex];

    switch (phase) {
      case 'typing-quote':
        typeText(currentQuote.text, 0, setDisplayedQuoteText, () => {
          setTimeout(() => setPhase('showing-author'), 1000);
        });
        break;

      case 'showing-author':
        typeText(`— ${currentQuote.author}`, 0, setDisplayedAuthorText, () => {
          setTimeout(() => setPhase('waiting'), 2000);
        });
        break;

      case 'waiting':
        setTimeout(() => {
          setCurrentQuoteIndex(i => (i + 1) % quotesData.length);
          setPhase('typing-quote');
          setDisplayedQuoteText('');
          setDisplayedAuthorText('');
        }, 500);
        break;
    }
  }, [phase, currentQuoteIndex]);
  ```

- [x] **Replace complex 7-phase state machine** with 3 simple phases
  - `typing-quote`: Types quote text character by character
  - `showing-author`: Types author text with em dash prefix
  - `waiting`: Brief pause before cycling to next quote
  - Delete old phases: `pauseAfterQuote`, `typingAuthor`, `pauseAfterAuthor`, `erasingAuthor`, `erasingQuote`

### Phase 3: Implement Phase-Based Rendering

- [x] **Create conditional rendering based on phase** in return statement

  ```typescript
  return (
    <div className="min-h-[15rem] flex flex-col justify-start">
      {(phase === 'typing-quote' || phase === 'showing-author' || phase === 'waiting') && (
        <div className="text-xl font-medium text-gray-900 dark:text-gray-100">
          {displayedQuoteText}
          {phase === 'typing-quote' && <span className="typewriter-cursor">|</span>}
        </div>
      )}

      {(phase === 'showing-author' || phase === 'waiting') && (
        <div className="text-base font-normal text-gray-600 dark:text-gray-400 mt-2">
          {displayedAuthorText}
          {phase === 'showing-author' && <span className="typewriter-cursor">|</span>}
        </div>
      )}
    </div>
  );
  ```

  - Clean separation of quote and author styling
  - Cursor only shows during active typing

- [x] **Add CSS animation for cursor blinking** in globals.css

  ```css
  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }

  .typewriter-cursor {
    animation: blink 1s infinite;
    color: currentColor;
  }
  ```

### Phase 4: Testing & Cleanup

- [x] **Update tests to match new setTimeout-based implementation**
  - Remove RAF mocking from `TypewriterQuotes.performance.test.tsx`
  - Update to mock setTimeout/clearTimeout instead
  - Remove performance tracking assertions

- [x] **Delete unused variables and imports**
  - Remove `TYPING_SPEED`, `ERASE_SPEED` constants (replace with inline 8ms)
  - Remove unused `useRef` import
  - Clean up any orphaned types/interfaces

- [x] **Test for stalling issues**
  - Verify animation never gets stuck mid-quote
  - Test with long quotes (300+ chars) and short quotes (<50 chars)
  - Confirm smooth transitions between phases

- [x] **Verify typing speed feels responsive**
  - Should complete average 100-char quote in ~1 second
  - Author should type quickly after quote
  - Total cycle time per quote: ~5 seconds (vs current ~8-10 seconds)

### Expected Result

- **Lines of code**: ~80 (down from 350+)
- **Typing speed**: 125 chars/sec (up from 40 chars/sec)
- **Reliability**: No stalling (simple logic = fewer failure points)
- **Maintainability**: Clear phase-based structure anyone can understand

## other ui/ux improvements

- [x] left-align footer content and homepage quote content
