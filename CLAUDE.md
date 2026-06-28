# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal site for phaedrus.io. One file: `index.html`. One full-viewport
screen, no scrolling. The only JavaScript is the small light/dark toggle
(system default, persisted as `ae-mode` in localStorage).

## Design Law

The design system is [`@misty-step/aesthetic`](https://github.com/misty-step/aesthetic),
imported via jsdelivr pinned to a release tag in `index.html`. Never inline
or fork its styles here; change the package, tag a release, bump the pin.

Rules for this site:

- The page is one `.ae-screen`: everything fits the viewport, desktop and
  mobile. No scrolling.
- Content stays tight: the name row (PHAEDRUS + the mode toggle), one
  link row, and the colophon. There is no bio (the operator writes any
  future copy himself). Do not grow a projects list here; that lives on
  misty step.
- The link row is one species: 13px chrome register, lowercase words,
  Lucide icons leading (briefcase for misty step, github, mail). Email
  is phraznikov@gmail.com.
- The footer is the colophon: a typewriter cycling through the quotes
  collection (`quotes.js`, generated from the daybook, capped at 200
  characters). Its height is reserved so typing never moves the stage;
  the attribution sits on its own line; reduced motion gets a full
  quote at rest. No copyright line.
- One font size; hierarchy via the registers (`.ae-name`, `.ae-lede`,
  `.ae-dim`). Motion only as the kit's built-in feedback plus the
  colophon typewriter.
- Left-aligned everything. No meta copy about the design itself. No
  fabricated claims, no em-dashes.

## Deploy

Push to master. Vercel serves the directory statically (`vercel.json`).

## CI

Run `./scripts/check.sh` before claiming done. The GitHub workflow calls the
same script; change the script first if the gate needs to change.
