# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working
with code in this repository.

## Overview

Personal portfolio site. Static — one `index.html`, one page-local
stylesheet, two small scripts. No build, no framework, no data files:
the markup is the content, and view-source is documentation.

## Design law

The design system is [`@misty-step/aesthetic`](https://github.com/misty-step/aesthetic),
imported via jsDelivr pinned to a release tag in `index.html`. Never
inline or fork its styles here; change the package, tag a release, bump
the pin, and refresh the vendored `aesthetic.recipes.js` from the same
tag.

Rules for this site:

- One `.ae-screen`: the chrome (header bar, footer) never moves; the
  document scrolls inside the stage (`.ae-stage-scroll`).
- One font size; hierarchy via the registers (`.ae-strong`, `.ae-item`,
  `.ae-dim`, `.ae-h`). The 13px chrome register carries the bar links
  and the footer; 11px mono carries the plate caption. No new sizes.
- The steering block at the top of `site.css` is the only color this
  repo owns: the mint signature (`--ae-accent: #0e7a4d`,
  `--ae-accent-dark: #77f0b8`). `site.css` is otherwise layout-only —
  no colors, no font sizes, no radii.
- Accent spend: the lattice connections (generative) and the contact
  link (`.ae-accent`). Do not add more.
- The lattice canvas (`lattice.js`) is the page's one generative
  element. It reads `--ae-line` / `--ae-accent` from the live computed
  style at draw time, so light/dark needs no extra wiring. It answers
  the cursor; it never moves unprompted.
- Buttons are not links: everything on this page navigates, so
  everything is a link. No `.ae-button` without a real action.
- Light/dark defaults to the system; the `.ae-mode` toggle pins a
  choice to `localStorage` as `ae-mode` (boot script in `<head>`,
  behavior in the vendored recipes).

## Deploy

Push to master. Vercel serves the directory statically (`vercel.json`).
