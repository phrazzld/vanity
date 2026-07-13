# AGENTS.md

This file provides guidance to Codex and Claude Code (claude.ai/code) when
working with code in this repository.

## Overview

Personal site for phaedrus.io. Static HTML, CSS, and vanilla JavaScript. There
is no build step and no package manager dependency. One full-viewport screen,
no scrolling. The runtime surface is `index.html`, the generated quote pool in
`quotes.js`, and the lightweight Canary observer in `canary-observer.js` plus
`api/`.

Read `VISION.md` before changing the page scope, deployed content surface, or
the boundary between personal pointer page, local drafts, and Misty Step
portfolio material.

The production surface is intentionally small: one full-viewport page with the
name row, three links, and a quote colophon. Do not add a bio page, project
grid, theme picker, or scrolling content here unless the operator explicitly
asks for a redesign. Project and studio content belongs on Misty Step.

## Development

```bash
# Static preview
python3 -m http.server 4173

# Structural gate
node --test
```

Direct `file://` opens are acceptable for a quick layout check, but use HTTP
for delivery QA so root-relative assets such as `/canary-observer.js` load
normally. `python3 -m http.server` does not emulate the DigitalOcean sidecar;
API handler behavior is covered by `node --test`, or by `service/server.js`
when browser QA must include `/api/*`.

## Architecture

- `index.html` - The page structure, site glue CSS, theme toggle, and the
  colophon bootstrap that wires the typewriter and its pause/play control.
- `quotes.js` - Generated daybook quote pool consumed by the colophon.
- `colophon.js` - The quote typewriter runtime with a pausable state machine
  (WCAG 2.2.2). Loaded as a browser global and exported for node tests.
- `canary-observer.js` - Browser error observer. It must never break the page
  it observes.
- `api/canary-config.js` - portable handler that exposes only the public Canary
  ingest key.
- `api/health.js` - portable health handler for Canary key configuration.
- `service/server.js` - DigitalOcean sidecar serving both API handlers.
- `test/*.test.js` - Node test-runner coverage for the API and observer
  contracts.

## Design Law

The design system is [`@misty-step/aesthetic`](https://github.com/misty-step/aesthetic),
imported from the pinned jsdelivr tag in `index.html`. Do not inline or fork
the design system in this repo; change the package, tag a release, and bump
the CDN pin.

Rules for this site:

- The page remains one `.ae-screen`: everything fits the viewport on desktop
  and mobile. No page scrolling.
- Content stays tight: the name row (PHAEDRUS + the mode toggle), one link
  row, and the colophon. There is no bio (the operator writes any future copy
  himself). Do not grow a projects list here; that lives on Misty Step. No
  generated copy about the design itself.
- The link row is one species: 13px chrome register, lowercase words, Lucide
  icons leading (briefcase for misty step, github, mail). Email is
  phraznikov@gmail.com.
- The footer is the colophon: a typewriter cycling through the quotes
  collection (`quotes.js`, generated from the daybook). The footer quote area
  reserves enough height for the longest quote in the pool — the `.q-foot`
  min-height reserve is sized to the longest quote (~250 chars) so typing
  never moves the stage. If the generated quote pool grows and a longer quote
  lands, adjust the `.q-foot` reserve and the matching docs together. The
  attribution sits on its own line; reduced motion gets a full quote at rest.
  A chrome pause/play control in the colophon stops the typewriter on demand
  (WCAG 2.2.2); reduced motion keeps the quote at rest and hides the control.
  No copyright line.
- One font size; hierarchy via the registers (`.ae-name`, `.ae-lede`,
  `.ae-dim`). Motion only as the kit's built-in feedback plus the colophon
  typewriter.
- Left-aligned everything. No meta copy about the design itself. No
  fabricated claims, no em-dashes.
- Drafts and design explorations are local scratch by default. Keep `bio.md`
  and `explore/` out of the deployable Git surface unless explicitly promoted
  — do not publish or promote them without an explicit operator request.

## Deploy

Push to `master`. DigitalOcean serves the static directory and the Node
sidecar in `service/`; the checked-in App Platform spec is maintained in the
DigitalOcean migration workspace.

## CI

Run `./scripts/check.sh` before claiming done. The GitHub workflow calls the
same script; change the script first if the gate needs to change.
