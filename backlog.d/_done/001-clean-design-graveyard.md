# Clean design graveyard, fix stale CLAUDE.md

Priority: high
Status: shipped
Estimate: S

## Goal
Delete unused exploration directories and fix stale project documentation so the repo matches reality before any design-system work lands.

## Non-Goals
- Preserving any proposal or experiment "for history" — git history is the archive.
- Refactoring any production code in this pass.

## Oracle
- [ ] `experiments/`, `.design-catalogue/`, `.polish-sessions/` are deleted from the working tree.
- [ ] `CLAUDE.md` "Design System" section lists the actual fonts in use (Cormorant Garamond + Crimson Pro) — not the stale Playfair/Inter/JetBrains Mono trio.
- [ ] `CLAUDE.md` "Architecture" section still describes three-file structure accurately after cleanup.
- [ ] `git status` clean after commit; no stray `.DS_Store` reintroduced.

## Notes
Context from grooming investigation (2026-04-15):
- `.design-catalogue/proposals/` contains 17 static HTML snapshots; no decision framework produced a pick.
- `experiments/hero-variations/` has 9 variations across round1–round3 (morphing-grid, liquid-scroll, particle-field, split-screen, glitch-terminal, coral-editorial, copper-spotlight, velocity-scroll, twilight-film, wire-reveal, magnetic-physics). Only coral-editorial ever merged.
- `.polish-sessions/2026-01-07-*/` and `2026-01-08-*/` are empty screenshot directories — session artifacts with no content.
- CLAUDE.md was written when fonts were Playfair/Inter/JetBrains Mono; current `index.html:10` loads Cormorant Garamond + Crimson Pro.

This unblocks item 002 (design tokens) and item 004 (theme system) by removing mental clutter — every future redesign keeps accreting these if we don't reset now.

## What Was Built (cycle 01KPBNJXP8ZNPSK1P5VQDJEASH)
- Branch: flywheel/001-clean-design-graveyard
- Evidence: backlog.d/_cycles/01KPBNJXP8ZNPSK1P5VQDJEASH/evidence/
