# Reading list: now-reading on the home, paginated archive, live JSON sync

Priority: medium
Status: shaped
Estimate: L

## Goal
Surface the daybook reading list on phaedrus.io: the books currently being read
appear as a quiet gesture on the home screen, and the full "have read" history
lives on a new paginated `/reading` page — both fed live from a published JSON
snapshot of the canonical reading log, without coupling the static site to the
daybook vault.

## Non-Goals
- No bookshelf, grid, or list on the home screen. The home gains one tight
  "now reading" block and nothing else; the design law (one `.ae-screen`, no
  scroll) is otherwise untouched.
- No scrolling anywhere. The `/reading` archive paginates; it does not scroll.
- No publishing of private note content. Only title, author, year, finished
  date, and favorite flag leave the vault — never note prose, slugs, covers,
  descriptions, or vault paths.
- No committed `reading.js` data snapshot in this repo (the quotes model). The
  operator chose live fetch; data lives off-repo and is fetched at runtime.
- No re-implementation of the reading-log parser. The exporter reuses
  whetstone's existing, tested `loadLibrary`.
- No public exposure of whetstone itself (it is Tailscale-private and stays so).

## Constraints (invariants that must survive)
- **Nothing on the home ever moves.** The "now reading" block reserves its
  vertical space (min-height) so the late-arriving fetch never shifts the
  colophon — the same discipline `.q-foot` uses for the longest quote.
- **The page never breaks on bad/missing data.** Mirror the canary-observer
  ethos and the colophon's "no QUOTES → collapse" behavior: a failed or empty
  fetch renders nothing (home) or a quiet empty state (`/reading`), never an
  error, never a broken layout.
- **`@misty-step/aesthetic` is not forked.** Both surfaces use the pinned kit
  (`aesthetic@v2.2.1`) and its registers (`.ae-name`, `.ae-lede`, `.ae-dim`).
  Site glue stays thin, in `index.html` / `reading.html`.
- **Left-aligned, lowercase chrome register, Lucide icons, no em-dashes, no
  meta copy about the design.** Reading copy obeys the existing voice law.
- **The canonical source is `~/Documents/daybook/resources/reading-log.md`**
  (the Obsidian-synced vault — same vault `quotes.js` is generated from). The
  `~/Development/atlas/...` checkout is a dev mirror and can lag; do not treat
  it as canonical for published data.

## Repo Anchors
Follow these patterns; do not invent new ones.
- `index.html` — the page shell, site-glue CSS, theme toggle, and the colophon
  typewriter runtime. The `.q-foot` reserved-height + "no QUOTES → collapse"
  logic (lines ~63–98, ~151–157) is the exact pattern the "now reading" block
  copies for space reservation and graceful degradation.
- `quotes.js` — the precedent for "data generated from the daybook, consumed by
  the page." `reading.js` is its sibling, except the data is fetched live
  rather than inlined.
- `test/quotes.test.js` — the structural-gate pattern (`node --test`): load the
  module, assert the data contract and the documented footer reserve. The new
  `test/reading.test.js` mirrors it.
- `canary-observer.js` — the "must never break the page it observes" contract.
  The reading render module inherits this: defensive, never throws.
- `backlog.d/_done/003-projects-data-driven.md` — prior art for a data-driven
  surface on this site (read before building for conventions).
- `~/.../daybook/tools/whetstone/src/library.ts` + `src/types.ts` — the
  **existing tested parser** (`loadLibrary` → `ReadingLibrary` with `current`,
  `finished`, `stats`, `timeline`). The exporter is a thin projection over this.
- `~/.../daybook/tools/whetstone/src/app.ts` — shows `loadLibrary` already wired
  and serialized via `context.json(...)`; the exporter mirrors that call.
- `~/.../daybook/tools/whetstone/src/config.ts` — path resolution
  (`resources/reading-log.md`, `VAULT_ROOT` override) the exporter reuses.

## Alternatives (considered, how each fails)
| Option | Verdict | Why |
|---|---|---|
| Committed `reading.js` snapshot (quotes model) | rejected | Operator chose live fetch — freshness without a vanity commit per reading update, and full decoupling. |
| Full/scrolling shelf on the home or a scrolling archive | rejected | Violates the one-screen, no-scroll design law. Pagination is the law-compliant way to show a long history. |
| Link out to Hardcover / StoryGraph | rejected | Cedes the aesthetic and sends visitors to a generic book-social app. (Remains the daybook's *optional* public mirror per the SoT doc — not this site's surface.) |
| Re-implement the log parser in vanity | rejected | whetstone's `loadLibrary` already parses every edge case (wikilinks, favorites, year tables, abandoned/shelved) and is covered by `library.test.ts`. Reuse it. |
| Fold "now reading" into the colophon typewriter | rejected | Too easy to miss; conflates two ideas in one slot; gives no browsable "have read." |
| Lazy path — just link the existing whetstone dashboard | blocked | whetstone is Tailscale-private; it cannot be linked publicly. |

## Design (chosen shape)
Three surfaces, one off-repo contract.

**1. JSON contract (the load-bearing interface — pin a golden fixture).**
A lean, public projection of `ReadingLibrary`. No private fields.
```json
{
  "updatedAt": "2026-06-24T12:00:00Z",
  "current":  [{ "title": "Moby-Dick", "author": "Herman Melville", "favorite": false }],
  "finished": [{ "title": "Gilgamesh", "author": "Stephen Mitchell (tr.)", "year": 2026, "finishedAt": "2026-04-25", "favorite": true }],
  "stats":    { "totalFinished": 380, "thisYear": 38, "sinceYear": 2010 }
}
```
- `current` ← `library.current` (reading-position order): title, displayAuthor, favorite.
- `finished` ← `library.finished` (reverse-chron): title, displayAuthor, year, finishedAt, favorite.
- `stats` ← `library.stats` (finishedCount, finishedThisYear) + earliest timeline year.
- Vanity parses **defensively**: render only known fields, tolerate missing/extra keys.

**2. Producer lane (daybook / whetstone — separate repo).**
- New thin entrypoint (e.g. `tools/whetstone/scripts/export-reading.ts`):
  `loadLibrary(config…)` → project to the contract → write/emit `reading.json`.
  Run against the canonical vault: `VAULT_ROOT=~/Documents/daybook`.
- Publish to a **public GitHub Gist under `phrazzld`** (raw URL serves
  `access-control-allow-origin: *`, so it is browser-fetchable). `bun run
  publish:reading` does export + `gh gist edit`.
- Cadence: an automated job on the already-always-on whetstone box (launchd,
  alongside `com.daybook.whetstone.plist`) runs export+publish daily, so the
  public JSON stays fresh with zero operator effort. Manual publish always
  available.
- Contract test: golden-fixture assertion that the exporter output matches the
  schema, plus `bunx tsc --noEmit`.

**3. Consumer lane (vanity / this repo).**
- `reading.js` — a small shared module (sibling to `quotes.js`): `fetch()` the
  Gist raw URL once, expose parsed `{ current, finished, stats }`, and provide
  defensive render helpers. Never throws.
- `index.html` — a "now reading" block below the link row (above the colophon):
  `.ae-dim` heading "now reading", then the current titles (middot-separated,
  wrapping), with a trailing link to `/reading`. The block reserves min-height
  for the expected line count so the colophon never shifts; empty/failed fetch
  collapses the reserve to zero (exactly like the no-QUOTES path).
- `reading.html` — a new `.ae-screen` page: same kit + shell, a back-to-home
  affordance, the stats line ("≈380 books since 2010 · 38 in 2026"), then the
  finished list **paginated** reverse-chron (title — author, year, ⭐ for
  favorites; subtle divider when the year changes). Prev/next pager sized so
  each page fills one viewport with no scrollbar (responsive page size: more
  rows on desktop, fewer on mobile). Keyboard accessible (←/→ + focusable
  controls), reduced-motion friendly. Failed fetch → quiet empty state + link
  home. Registered in `vercel.json` static routing as needed.

Data/control flow:
`reading-log.md → loadLibrary → reading.json → Gist (CORS *) → fetch() → home block + paginated /reading`.

## Oracle (executable definition of done)
Producer (daybook, in the whetstone dir): `bun test && bunx tsc --noEmit`
Consumer (vanity): `node --test`  +  `python3 -m http.server 4173` browser walk.

- [ ] `test/reading.test.js` passes under `node --test`: render module loads a
      fixture `reading.json`; asserts (a) "now reading" renders expected titles,
      (b) empty `current` and malformed/absent JSON each render nothing without
      throwing, (c) pagination yields `ceil(M / pageSize)` pages with correct
      bounds, (d) the fixture validates against the pinned JSON schema.
- [ ] All existing vanity tests still pass (`node --test` green overall).
- [ ] Home QA (HTTP, desktop + mobile widths): "now reading" shows the current
      titles; the colophon position is **byte-identical** before and after the
      fetch resolves (no layout shift); with the fetch blocked/offline the block
      collapses and the home looks intentional.
- [ ] `/reading` QA: archive paginates reverse-chron; **no scrollbar** at common
      desktop and mobile viewports; prev/next + keyboard nav work; favorites
      marked; year dividers correct; reduced-motion has no animation jank; a
      blocked fetch shows the quiet empty state, not an error.
- [ ] Producer: `bun run export:reading` (with `VAULT_ROOT=~/Documents/daybook`)
      emits JSON that validates against the schema; whetstone golden-fixture
      contract test + `tsc --noEmit` pass.
- [ ] Published Gist raw URL returns the JSON with `access-control-allow-origin: *`
      (verified: `curl -sI <raw-url> | grep -i access-control`).
- [ ] No private fields (note prose, slugs, covers, descriptions, vault paths)
      appear anywhere in the published JSON.
- [ ] `git status` clean after commit; design law intact (home still one screen,
      no scroll; `/reading` paginated, no scroll).

## Verification harness
- Claim: "reading data appears on the site, stays current, and never breaks or
  shifts the page."
- Falsifier: any layout shift on the home when the fetch resolves; any scrollbar
  on `/reading`; any thrown error or broken render when the fetch fails or
  returns malformed JSON; any private field in the published JSON.
- Driver: `node --test` (vanity contracts) + `python3 -m http.server 4173`
  browser walk with the fetch both succeeding and blocked; `bun test` +
  `tsc --noEmit` (producer); `curl -I` on the published URL (CORS).
- Grader: the Oracle checkboxes above + the pinned JSON-schema fixture.
- Evidence: screenshots of home (pre/post-fetch, desktop+mobile) and `/reading`
  (first page, a middle page, empty state), `curl` CORS header output, test
  output. Land under `backlog.d/_cycles/<id>/evidence/`.
- Gaps/waiver: Gist raw URLs are CDN-cached (~minutes without a revision SHA) —
  acceptable for a rarely-changing list; documented, revisit only if staleness
  bites.

## Premise Source
sha256:5cd4bde0a75ea50bb587c5cc3ffbcf2c0e6aa0021733d6095dc99cc564dfa364
`~/Development/atlas/systems/daybook/inbox/reading-single-source-of-truth-2026-05-31.md`
(establishes `reading-log.md` as canonical, vault-native, with a thin
publish/mirror surface — the architecture this packet implements). Immediate
decisions (placement = home gesture + paginated `/reading`; sync = live fetch of
published JSON via a phrazzld Gist) set by the operator in the /shape session,
2026-06-24.

## HTML Plan
`/private/tmp/claude-501/-Users-phaedrus-Development-vanity/c4e93916-b922-40a6-a8b9-09f86fb585a1/scratchpad/reading-list-plan.html`
(opened for review during shaping).

## Risks + Rollout
- **Live network dependency on an otherwise-static site** — the real cost of the
  live-fetch choice. Mitigated by reserved space + graceful hide: a failed fetch
  is invisible, never broken. (No committed fallback snapshot — that would
  re-introduce the coupling the operator chose to avoid.)
- **Cross-repo contract drift** (producer changes shape → consumer breaks) —
  mitigated by the pinned JSON schema, the producer-side contract test, and
  defensive parsing on the consumer side.
- **Gist CDN caching** — documented; acceptable for low update frequency.
- **Privacy** — only title/author/year/favorite published; enforced by the
  projection and an Oracle check.
- **Rollback** — vanity change is additive (one home block, one new page, one
  module, one route): revert the commit. Producer is additive. Deleting the Gist
  degrades the home to no-reading-block. Nothing destructive.
- **Design-law waiver** — the new `/reading` page is the "explicit operator
  redesign ask" the design law gates on; granted in the /shape session
  (2026-06-24). The home stays within the law.

## Open decisions to confirm before building (recommended defaults)
1. **Public host** — *default: Gist under `phrazzld`* (CORS `*`, zero infra).
   Alternatives: `reading.json` committed to a public repo, or vanity-hosted.
2. **Publish cadence** — *default: automated daily job on the always-on
   whetstone box* (zero-effort freshness); manual `bun run publish:reading`
   always available.
3. **Home entry point to the archive** — *default: the "now reading" block
   carries the link to `/reading`* (chrome row stays 3 links). Alternative: add
   a 4th "reading" link to the chrome row.
4. **Exporter vault** — *default: `VAULT_ROOT=~/Documents/daybook`* (canonical
   synced vault, matches quotes' source). Confirm the always-on whetstone
   instance points there too, or run the exporter with the explicit env.
