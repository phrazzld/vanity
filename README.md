# vanity

Personal portfolio site. Pure HTML, CSS, and vanilla JavaScript — no
build step, no framework. The design system is
[`@misty-step/aesthetic`](https://github.com/misty-step/aesthetic),
linked from the CDN pinned to a release tag; everything this repo owns
is one page, one small stylesheet, and two small scripts.

## Development

```bash
python3 -m http.server   # or any static server, or open index.html
```

## Structure

```
index.html            # the whole page: one screen, the document scrolls in the stage
site.css              # the steering block (the mint signature) + layout-only glue
lattice.js            # the one generative element: a cursor-coupled node grid
aesthetic.recipes.js  # vendored kit behavior (mode toggle, et al.)
```

## Conventions

- Stay inside the system: one font size (the 13px chrome register and
  the 11px mono plate caption are the kit's own exceptions), hierarchy
  via the nine registers, radius 0, motion as feedback only.
- The steering block at the top of `site.css` is the only color this
  repo defines. The accent is spent twice: the lattice connections
  (generative) and the contact link. Everything else is ink.
- The lattice reads `--ae-line` / `--ae-accent` from the live computed
  style at draw time, so it follows the mode toggle with no extra
  wiring. It answers the cursor; it never moves unprompted.
- To upgrade the design system, bump the pinned tag in `index.html`
  and refresh `aesthetic.recipes.js` from the same tag.

## Deploy

Push to master. Vercel serves the directory statically (`vercel.json`).
