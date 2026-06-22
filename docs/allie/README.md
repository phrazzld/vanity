# Allie Dogfood Evidence

**Canonical path:** the host-agnostic [`allie verify`](verify-latest/) command is
the single entry point, and the [`allie` CI workflow](../../.github/workflows/allie.yml)
runs it against the homepage on every pull request — see
[`verify-latest/`](verify-latest/) for the committed snapshot and headline result.

The sections below are an earlier exploratory run using Allie's lower-level
`map` / `run` / `review` / `report` subcommands (the agentic map path), kept for
reference.

---

Generated from `.allie/manifest.yml` against the local Vanity static preview on
`http://127.0.0.1:4174`.

- Status: `fail`
- Deterministic finding: `wcag22-aa:1.4.3-contrast-minimum`
- Agent map pass: OpenCode advisory run timed out after reading context; the
  deterministic map was kept and the transcript is in
  `map/opencode-map-transcript.txt`.

- Product map: `map/surface-map.html`
- WCAG evidence report: `report/compliance-report.html`
- Raw evidence packet: `run/evidence.json`
- Browser evidence report: `run/report.html`

Allie reports evidence status, confidence, residual review needs, and linked
artifacts. It does not claim legal compliance.

Commands:

```sh
cargo run --locked --manifest-path /Users/phaedrus/Development/allie/Cargo.toml -- map --manifest .allie/manifest.yml --project-root . --out docs/allie/map --agent opencode
cargo run --locked --manifest-path /Users/phaedrus/Development/allie/Cargo.toml -- run --manifest .allie/manifest.yml --out docs/allie/run
cargo run --locked --manifest-path /Users/phaedrus/Development/allie/Cargo.toml -- review --packet docs/allie/run/evidence.json --out docs/allie/review
cargo run --locked --manifest-path /Users/phaedrus/Development/allie/Cargo.toml -- report --map docs/allie/map/product-map.json --packet docs/allie/review/evidence-reviewed.json --out docs/allie/report
```
