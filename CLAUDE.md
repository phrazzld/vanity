# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site. Pure HTML, CSS, and vanilla JavaScript—no build step, no dependencies.

## Development

```bash
# Option 1: Open directly
open index.html

# Option 2: Local server with live reload
npx serve .
```

## Architecture

Three files, single responsibility each:

- `index.html` — Single-page structure with semantic sections (hero, projects, services, contact)
- `styles.css` — CSS custom properties for theming; light/dark via `[data-theme="dark"]`
- `script.js` — Theme toggle (localStorage), smooth scroll, reveal-on-scroll, scroll progress bar, lattice canvas animation in hero + contact

## Design System

CSS variables defined in `:root` and overridden in `[data-theme="dark"]`:
- Colors: `--bg`, `--bg-alt`, `--text`, `--text-dim`, `--accent`, `--accent-rgb`, `--accent-hover`, `--border`
- Lattice tokens (consumed by CSS and by `script.js` via `getComputedStyle`): `--grid-size-px`, `--node-radius`, `--node-color`, `--connection-radius`, `--lattice-line-alpha-max`, `--lattice-crosshair-alpha`, `--lattice-glow`, `--lattice-glow-alpha`
- Typography: Cormorant Garamond (display) + Crimson Pro (body), loaded from Google Fonts in `index.html`

CSS is the single source of truth for all visual constants. `script.js` reads tokens at runtime; no hardcoded color values. To change the lattice color, edit `--accent` / `--accent-rgb`; to change lattice behavior, edit the `--lattice-*` tokens. `.featured::before`, `.project::before`, `#services::before`, and the `.grid-bg` utility share one radial-gradient pattern — consumers scope `--grid-size-px` and `--node-radius` locally for size variants.

## Deploy

Push to main. Static hosting (Vercel/Netlify/GitHub Pages) serves automatically.
