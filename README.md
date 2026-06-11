# vanity

Personal site for phaedrus.io. One file: `index.html`. No build step, no
JavaScript, no local stylesheet.

The design system is [`@misty-step/aesthetic`](https://github.com/misty-step/aesthetic),
imported from the CDN pinned to a release tag. The v1 language is TACET:
one text size, hierarchy by ink and weight, exactly one accent instance per
viewport, zero animation, a single 38em column.

## Development

```bash
open index.html        # or any static server
```

## Upgrading the design system

Bump the pinned tag in the jsdelivr `<link>` in `index.html`:

```
https://cdn.jsdelivr.net/gh/misty-step/aesthetic@v1.0.0/aesthetic.css
```

Page-level changes happen in `index.html` only and must stay inside the
law: no second accent, no animation, no new font sizes.

Dark mode follows `prefers-color-scheme`; there is no toggle.

## Deploy

Push to master. Vercel serves the directory statically (`vercel.json`).
