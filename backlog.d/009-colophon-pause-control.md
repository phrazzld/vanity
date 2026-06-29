# Give the colophon typewriter a pause/stop control (WCAG 2.2.2)

Priority: P1 · Status: shaped · Estimate: S

## Goal
Satisfy WCAG 2.2 AA 2.2.2 (Pause, Stop, Hide) for the auto-typing quote
colophon, which currently starts automatically and runs continuously with no
in-page control. Allie blocked PR #121 on this (agentic, high confidence,
run 28397397097).

## Oracle
- [ ] A visible, keyboard-reachable control pauses/stops the typewriter, OR a
      recorded determination that the existing `prefers-reduced-motion`
      static-quote fallback satisfies 2.2.2 and the Allie check is annotated to
      match.
- [ ] The control fits the design law: one screen, no scroll, no decoration,
      chrome register, no new font sizes, one accent instance preserved.
- [ ] Re-running Allie verify clears 2.2.2.
- [ ] `./scripts/check.sh` passes.

## Notes
The typewriter is a deliberate feature (CLAUDE.md Design Law). Minimal options:
a small pause glyph in the colophon, pausing on hover/focus, or treating
reduced-motion as the "stopped" state. 2.2.2 strictly wants an explicit control;
reduced-motion alone is a contested mitigation. Pairs with
[[008-a11y-kit-contrast]].
