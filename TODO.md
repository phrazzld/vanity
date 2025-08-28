# TODO

## TypewriterQuotes Performance Fix

### 1. Profile

- [ ] Chrome DevTools Performance tab: 10s trace during animation
- [x] Log frame times: `performance.now()` delta between renders
- [ ] Identify: GC pauses, long tasks >16ms

### 2. Fix

- [x] Replace setTimeout with requestAnimationFrame
- [x] Move state to refs (stop re-render cascade)
- [x] Wrap in React.memo
- [x] Remove try/catch from hot path

### 3. Verify

- [x] 60fps stable, no frame drops
- [x] Performance test in CI

## other ui/ux improvements

- [x] left-align footer content and homepage quote content
