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
- WCAG matrix: **9 pass · 1 fail · 44 needs-review · 1 not-tested**; 46
  review-needed obligations surfaced for human follow-up.

This is evidence visibility for accessibility engineering review — not a legal
compliance guarantee, and not an autonomous replacement for expert review.

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
