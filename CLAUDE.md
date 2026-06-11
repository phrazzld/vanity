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
- Content stays tight: name, one-line bio, misty step link, github,
  email. Do not grow a projects list here; that lives on misty step.
- Exactly one accent instance (`.ae-accent`): the misty step link.
- One font size; hierarchy via the registers (`.ae-name`, `.ae-item`,
  `.ae-dim`). Motion only as the kit's built-in feedback.
- No meta copy about the design itself. No fabricated claims, no
  em-dashes.

## Deploy

Push to master. Vercel serves the directory statically (`vercel.json`).
