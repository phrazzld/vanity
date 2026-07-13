# Give the colophon typewriter a pause/stop control (WCAG 2.2.2)

Priority: P1 · Status: shipped · Estimate: S

## Goal
Satisfy WCAG 2.2 AA 2.2.2 (Pause, Stop, Hide) for the auto-typing quote
colophon, which currently starts automatically and runs continuously with no
in-page control. Allie blocked PR #121 on this (agentic, high confidence,
run 28397397097).

## Oracle
- [x] A visible, keyboard-reachable control pauses/stops the typewriter, OR a
      recorded determination that the existing `prefers-reduced-motion`
      static-quote fallback satisfies 2.2.2 and the Allie check is annotated to
      match.
- [x] The control fits the design law: one screen, no scroll, no decoration,
      chrome register, no new font sizes, one accent instance preserved.
- [ ] Re-running Allie verify clears 2.2.2.
- [x] `./scripts/check.sh` passes.

## Notes
The typewriter is a deliberate feature (CLAUDE.md Design Law). Minimal options:
a small pause glyph in the colophon, pausing on hover/focus, or treating
reduced-motion as the "stopped" state. 2.2.2 strictly wants an explicit control;
reduced-motion alone is a contested mitigation. Pairs with
[[008-a11y-kit-contrast]].

## What Was Built
- Branch: `doomscrum/impl-give-the-colophon-typewriter-a-pause-stop-control-wcag-2-2-2-687be905f1`
- Extracted the typewriter into `colophon.js` as a UMD module exporting
  `createTypewriter` (browser global `window.createTypewriter` + CommonJS for
  node tests). The runtime exposes `start`, `setPaused`, and `isPaused`.
- Added a chrome pause/play `<button>` (`#q-toggle`) in the colophon's
  attribution row: 12px (reuses the attribution register), `--ae-ink-faint`
  chrome color (no new accent), Lucide `i-pause`/`i-play` symbols leading a
  lowercase "pause"/"play" label, `aria-pressed` + `aria-label` swap on toggle,
  `:focus-visible` outline for keyboard reach.
- Pause clears the pending typewriter timer and freezes the on-screen text;
  resume reactivates the loop from the same step. State transitions are
  idempotent (no-op when already in the requested state).
- Reduced motion keeps the existing static-quote fallback and hides the
  control via `@media (prefers-reduced-motion: reduce)`.
- Tests: `test/colophon.test.js` (6 cases) covers typing, pause freeze + zero
  pending timers, resume reactivation, hold-state preservation, idempotent
  transitions, and an HTML contract check that the control is keyboard-
  reachable, wired to `createTypewriter`, and hidden under reduced motion.
- `./scripts/check.sh` passes (21/21 tests).
- Allie verify re-run is operator-gated (needs the Allie runner + an
  `OPENROUTER_API_KEY`); the deterministic oracle is satisfied. Re-running
  Allie verify on a deployed page is the remaining acceptance item.

## Residual risk
- The Allie manifest pins `reduced_motion: reduce`, so the Allie flow sees the
  static fallback (control hidden). A non-reduced-motion capture is needed to
  exercise the control in Allie's browser. If Allie's 2.2.2 check keys on the
  presence of a mechanism rather than interaction, the control's existence and
  keyboard reach should clear it; otherwise the flow config may need a
  non-reduced-motion state added.
