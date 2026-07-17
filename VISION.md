# vanity Vision

Status: Canonical root vision for `phaedrus.io`. Revise only when the personal
site intentionally changes from pointer page to a different product surface.

## What vanity Is

`vanity` is the personal site for `phaedrus.io`: one full-viewport screen with a
name, three links, and a quote colophon. It exists to be a clean pointer, not a
portfolio, archive, blog, or studio site.

The page should give a visitor enough orientation to continue elsewhere and
then get out of the way. Its restraint is the product. Misty Step carries the
company and project portfolio; Daybook carries private notes; local drafts stay
local until deliberately promoted.

## North Star

A tiny page with discipline: no scrolling, no decoration creep, no explanatory
sprawl, one accent instance, and a quote colophon that feels alive without
becoming the reason the site exists.

## What Must Stay True

- `index.html` owns the page structure, glue CSS, light/dark toggle, and quote
  typewriter runtime.
- `quotes.js` is generated from the Daybook quote pool. It should not become a
  hand-maintained content dump.
- `canary-observer.js` and `api/` provide lightweight telemetry support. They
  must never make the static page fragile.
- The design system is `@misty-step/aesthetic`, imported from the pinned CDN
  release tag. Change the package and tag, then bump the pin.
- Delivery QA uses HTTP when root-relative assets or API routes matter;
  `file://` is layout-only.

## What vanity Refuses

- Page scrolling.
- New font sizes, decorative extras, theme sprawl, or a project grid.
- Bio, archive, reading list, or explore surfaces unless the operator
  explicitly promotes them into the deployed product.
- Package-manager or build-step complexity for a page that should remain static.
- Telemetry becoming more important than the page it observes.

## Current Bets

1. Keep the deployed surface to name, ghost portrait, links, and colophon.
2. Preserve enough quote reserve that the generated pool does not cause layout
   shift.
3. Treat `explore/` work as backlog or scratch until promoted.
4. Use `node --test` as the structural gate for even small changes.

## Where The Depth Lives

- `AGENTS.md` is the operating contract for agents and repo changes.
- `index.html`, `quotes.js`, `canary-observer.js`, and `api/` are the actual
  production surface.
- Powder tracks possible future work; it is not a license to expand the
  page by default.
