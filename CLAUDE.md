# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal site for phaedrus.io. One file: `index.html`. No build step, no
JavaScript, no runtime dependencies beyond two stylesheet links (Geist
fonts, design system). Open `index.html` or serve the directory; what you
see is the site.

## Design Law

The design system is [`@misty-step/aesthetic`](https://github.com/misty-step/aesthetic),
imported via jsdelivr pinned to a release tag in `index.html`. Never inline
or fork its styles here; to change the system, change the package and bump
the pinned tag.

Every change to `index.html` must stay inside the law:

- One font size everywhere. The headline is heavier, never larger.
- Hierarchy only via the kit registers: `.ae-name`, `.ae-h`, `.ae-item`,
  `.ae-dim` (three inks by three weights).
- Exactly one accent instance per viewport (`.ae-accent`); on this site
  it is the contact link. Do not add a second.
- Zero animation. The kit kills all transitions and animations globally.
- One column (`.ae-page`, max 38em). No rules, no cards, no boxes.
- Real content only: no fabricated metrics, no em-dashes in copy.

Dark mode follows `prefers-color-scheme`; there is no toggle and no
client-side script.

## Deploy

Push to master. Vercel serves the directory statically (`vercel.json`).
