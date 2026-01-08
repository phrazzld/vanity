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
- `styles.css` — CSS custom properties for theming; light/dark mode via `[data-theme="dark"]`
- `script.js` — Theme toggle with localStorage persistence, smooth scroll for anchors

## Design System

CSS variables defined in `:root` and overridden in `[data-theme="dark"]`:
- Colors: `--color-bg`, `--color-text`, `--color-accent`, `--color-border`
- Typography: Playfair Display (headings), Inter (body), JetBrains Mono (code/tags)
- Spacing scale: `--space-xs` through `--space-3xl`

## Deploy

Push to main. Static hosting (Vercel/Netlify/GitHub Pages) serves automatically.
