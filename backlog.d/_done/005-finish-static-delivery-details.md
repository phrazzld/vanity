# Finish the static delivery details

Priority: P2 · Status: ready · Estimate: S

## Goal

Close the gaps a first-time visitor's browser notices: missing favicon,
no social card, and an unpinned-integrity CDN stylesheet.

## Oracle

- [ ] `https://phaedrus.io/favicon.ico` (or an SVG icon link) returns
      200; no 404 in the console on load. (It 404s today.)
- [ ] Open Graph + Twitter meta render a sensible card (title,
      description) in a card validator.
- [ ] The jsdelivr `<link>` for aesthetic.css carries an `integrity`
      hash (SRI) matching the pinned tag, and the page still renders.

## Notes

**Why (first-time-visitor lens):** the page is one screen of restraint;
a 404 and a blank share card are the only blemishes. SRI is viable on
the pinned jsdelivr file (immutable per tag), not on the Google Fonts
css2 endpoint (UA-dependent), so scope SRI to the kit link only. A
quiet glyph favicon (single ink "P") stays inside the system.
