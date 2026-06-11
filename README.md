# vanity

Personal site for phaedrus.io: one full-viewport screen, no scrolling.
Name, bio, and three links. The design system is
[`@misty-step/aesthetic`](https://github.com/misty-step/aesthetic),
imported from the CDN pinned to a release tag.

## Development

```bash
open index.html        # or any static server
```

## Conventions

- Everything lives in `index.html`. The only JavaScript is the ~20-line
  light/dark toggle (defaults to the system preference, persists to
  `localStorage` as `ae-mode`).
- Stay inside the system: one accent instance (the misty step link), no
  page scrolling, no new font sizes, no decoration.
- To upgrade the design system, bump the pinned tag in the jsdelivr
  `<link>`.

## Deploy

Push to master. Vercel serves the directory statically (`vercel.json`).
