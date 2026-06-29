# Lift @misty-step/aesthetic contrast to WCAG AA (dim text + icons)

Priority: P1 · Status: shaped · Estimate: M

## Goal
Raise the kit's neutral foreground tokens so phaedrus.io passes WCAG 2.2 AA
contrast. Allie's dogfood run on PR #121 blocked on two contrast findings, both
rooted in `@misty-step/aesthetic` rather than this repo's markup.

## Findings (Allie verify, run 28397397097)
- 1.4.3 Contrast (Minimum) — deterministic axe, serious: the quote attribution
  `#q-attr` renders at 2.45:1 (`#a3a3a3` on `#fcfcfc`, 12px). AA needs 4.5:1.
- 1.4.11 Non-text Contrast — agentic, high confidence: the mode-toggle sun icon
  and the Lucide link icons (misty step, github, email) sit below 3:1 on white.

## Oracle
- [ ] The kit's dim/secondary text token meets 4.5:1 on the light surface and
      its dark equivalent, changed in `@misty-step/aesthetic` — not inlined here.
- [ ] Icon stroke/foreground meets 3:1 against the page background, both modes.
- [ ] A new `@misty-step/aesthetic` release is tagged and the jsdelivr pin in
      `index.html` is bumped to it.
- [ ] Re-running Allie verify on phaedrus.io clears 1.4.3 and 1.4.11.

## Notes
Design Law forbids inlining or forking kit styles here; the fix lives in the
package. Watch the colophon legibility tradeoff — darker dim text must still
read as "dim," not body weight. Pairs with [[009-colophon-pause-control]] as the
two halves of the Allie-blocked finding set.
