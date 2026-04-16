# Extract projects to JSON + render from data

Priority: medium
Status: shipped
Estimate: S

## Goal
Replace the hand-edited block of 18 `<a class="project">` tags in `index.html` with a `projects.json` data file rendered by a small vanilla-JS function, so curation is a JSON edit and redesigns can re-template the grid without touching 18 card blocks.

## Non-Goals
- Any framework (React, Vue, Alpine, etc.). Plain `document.createElement` or template strings only.
- Introducing a build step or server-side rendering. Fetch JSON at runtime.
- Adding fields beyond current data + a small set of forward-looking ones (see Notes). Not a CMS.
- Lazy loading, pagination, filtering, tagging UI. The grid stays flat.

## Oracle
- [ ] `projects.json` exists at the repo root (or `/data/projects.json`) with one entry per project.
- [ ] Each entry has at minimum: `name`, `url`, `blurb`. Optional fields: `featured` (bool), `emphasis` (string — surfaces in Contractor/Lattice themes).
- [ ] `index.html` contains no individual project card markup — only a single `<div class="projects-grid">` container + the `featured` anchor.
- [ ] `script.js` fetches `projects.json` and renders cards into the container on load. Reveal-on-scroll still works on rendered cards.
- [ ] Reordering or editing a project requires only a JSON edit — no HTML change. Verified by adding a dummy project and confirming it appears.
- [ ] Build/deploy still works on Vercel (static JSON is served as expected; no CORS issue on same-origin fetch).
- [ ] Page renders correctly with JS disabled OR clearly degrades (acceptable for this repo — document which).

## Notes
Current state: `index.html:60–133` is 18 nearly-identical `<a>` blocks. Curation commits `8677235` and `b0dfabf` show bulk HTML surgery (26–76 line diffs) just to swap ordering/blurbs.

Forward-looking field candidates (don't add until needed):
- `themes: string[]` — which aesthetic theme emphasizes this project (e.g., a contractor theme might foreground agent infra; an editorial theme might foreground the classical/literary projects)
- `year`, `status` — if the site ever shows vintage or active/archived

Prereq for item 004 if themes re-order or re-style the grid — easier to iterate against data than against 18 hand-edited blocks.

## What Was Built (cycle 01KPBYGKNT41G4VS81PT2BYH8Z)
- `projects.json` now holds all 18 project entries as plain data with `name`, `url`, and `blurb`.
- `index.html` now ships a single `#projects-grid` container plus a clear `<noscript>` fallback instead of 18 hand-edited project cards.
- `script.js` now fetches `./projects.json`, renders cards with `document.createElement`, and registers each rendered card with the existing reveal observer.
- Local verification passed with headless Chrome: HTTP mode rendered 18 cards from JSON, and `file://` mode showed the explicit fallback message instead of a silent empty grid.
