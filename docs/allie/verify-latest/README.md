# Allie `verify` snapshot — Vanity homepage

A committed snapshot of Allie's **host-agnostic consumer contract** run against
the Vanity homepage. This is the single-command path (`allie verify`) that the
[`allie` CI workflow](../../../.github/workflows/allie.yml) regenerates on every
pull request and uploads as the `allie-verify` artifact.

## Headline

- **Status: `blocked`** — release projection blocked on deterministic evidence.
- **1 deterministic WCAG failure** (`1.4.3 Contrast (Minimum)`): the quote
  attribution `#q-attr` renders at contrast **2.45** (`#a3a3a3` on `#fcfcfc`,
  12px) against the 4.5:1 AA threshold.
- WCAG matrix across all **55** success criteria: **29 pass · 3 fail · 10 needs
  review · 13 not applicable · 0 not tested**.
- **Every criterion is attempted automatically, and the judgment-heavy ones get
  a committed verdict.** 13 are auto-ruled `not_applicable` with reasons (no
  media, no forms, no draggable targets); deterministic/scripted checks settle
  the mechanical ones; and the criteria that need visual/contextual judgment are
  reviewed by an **agentic vision model** (`google/gemini-3.5-flash`) that
  renders a **committed pass/fail verdict marked with an asterisk** (`*`) — a
  reviewer judgment, with rationale, "for the human reviewer" guidance, and
  captured evidence (full page, focus montage, motion frames, focus/motion
  clips) inlined. Here that is **18 pass\* + 2 fail\*** (the AI caught both the
  low-contrast UI icons and an auto-playing typing animation with no pause
  control). The **10** criteria it genuinely cannot settle from a single static
  page — those needing scripted measurement (text spacing, resize, target size)
  or multiple pages (consistent navigation/identification, multiple ways) — stay
  `needs review` rather than be forced into a fabricated verdict. Open
  [`compliance-report.html`](compliance-report.html) for the per-criterion
  verdicts and inline screenshots/clips.

This is evidence visibility for accessibility engineering review. AI verdicts are
**advisory**: they read as committed pass\*/fail\* decisions with the evidence
attached, but they do not block a release — only deterministic and scripted
failures gate the check. Allie does not claim legal compliance or replace
expert/lived review.

## In this snapshot

- [`allie-report.md`](allie-report.md) — the verification summary.
- [`allie-report.html`](allie-report.html) — the same summary, rendered.
- [`compliance-report.html`](compliance-report.html) — the full WCAG 2.2 AA
  obligation drilldown.
- [`evidence.json`](evidence.json) — the machine-readable evidence packet.
- [`home.png`](home.png) — the homepage screenshot Allie captured.

## Reproduce locally

Allie is the public CLI at <https://github.com/adminifi-ai/allie>.

```sh
# from the Vanity repo root, with the homepage served on :4174
python3 -m http.server 4174 --bind 127.0.0.1 &
allie verify --manifest .allie/manifest.yml --out .allie/verify/latest --project-root .
```

The manifest ([`.allie/manifest.yml`](../../../.allie/manifest.yml)) is the only
host-specific input; the same command runs in CI and locally and emits the same
artifacts.
