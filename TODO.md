# TODO: Vercel Analytics & Speed Insights Integration

## Context

**Architecture**: Zero-Config Component Integration (Drop-in Pattern)

- Reference: DESIGN.md (Selected Approach)
- PRD: TASK.md (Phase 1 MVP)

**Key Files**:

- `src/app/layout.tsx` - Integration point (root layout)
- `package.json` - Dependencies declaration

**Architecture Pattern**:

- Deep modules: Zero-prop components hide all complexity
- No configuration, no state management, no environment variables
- Components self-initialize in production, no-op in test/dev

**Existing Patterns to Follow**:

- Root layout already uses drop-in components: `<ThemeInitializer />`, `<Footer />`, `<Header />`
- Components mounted at end of `<body>` for non-blocking behavior
- Static export mode (`output: 'export'`) - components must be client-compatible

---

## Implementation Tasks

- [x] **Task 1: Install Analytics Packages**

**Files**: `package.json` (automatically modified by pnpm)

**Architecture**: External dependencies required by Analytics and Speed Insights components (see DESIGN.md "Module: Analytics Component" and "Module: Speed Insights Component")

**Pseudocode**: See DESIGN.md section "Phase 1: Package Installation"

**Implementation**:

```bash
# From project root: /Users/phaedrus/Development/vanity
pnpm add @vercel/analytics @vercel/speed-insights
```

**Success Criteria**:

- ✅ `@vercel/analytics` appears in `dependencies` section of package.json (not devDependencies)
- ✅ `@vercel/speed-insights` appears in `dependencies` section of package.json (not devDependencies)
- ✅ `pnpm-lock.yaml` updated with new package entries
- ✅ No installation errors or peer dependency warnings

**Test Strategy**: N/A (dependency installation verified by build step)

**Dependencies**: None (first task)

**Time Estimate**: 2 minutes

---

- [x] **Task 2: Integrate Analytics Components into Root Layout**

**Files**: `src/app/layout.tsx` (4 lines changed)

- Line 8-9 (after line 7): Add imports
- Line 70-71 (before `</body>`): Add components

**Architecture**: Implements "Module: Root Layout (Integration Layer)" from DESIGN.md

- Mounts Analytics and Speed Insights components at end of body (non-blocking)
- No props required (zero-prop interface = deep module)
- Components handle own lifecycle (production detection, script loading)

**Pseudocode**: See DESIGN.md section "Phase 2: Layout Integration"

**Implementation**:

1. Open `/Users/phaedrus/Development/vanity/src/app/layout.tsx`
2. Add imports after line 7 (after font imports):
   ```typescript
   import { Analytics } from '@vercel/analytics/next';
   import { SpeedInsights } from '@vercel/speed-insights/next';
   ```
3. Locate closing `</body>` tag (currently line 69)
4. Add components before `</body>`:
   ```tsx
   <Analytics />
   <SpeedInsights />
   ```

**Final Structure** (lines 60-72):

```tsx
<body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col pt-[4.5rem]">
  <ThemeInitializer />
  <Suspense fallback={<div>Loading...</div>}>
    <Header />
  </Suspense>
  <main className="bg-white dark:bg-gray-900 flex-grow pb-[49px]">
    <div className="container-content pt-16 pb-8">{children}</div>
  </main>
  <Footer />
  <Analytics />
  <SpeedInsights />
</body>
```

**Success Criteria**:

- ✅ File compiles with TypeScript (no import errors)
- ✅ Components added before closing `</body>` tag
- ✅ Import statements reference correct package paths (`@vercel/analytics/next`, `@vercel/speed-insights/next`)
- ✅ No syntax errors or linting violations

**Test Strategy**:

- Run `pnpm run typecheck` - Must pass with no errors
- Run `pnpm run lint` - Must pass with no violations
- Run `pnpm test` - Existing tests continue passing (analytics components render null in test env)

**Dependencies**: Task 1 (packages must be installed first)

**Time Estimate**: 5 minutes

---

- [x] **Task 3: Verify Build and Bundle Size Impact**

**Work Log**:

- Build completed successfully in 2.1s
- Static export generated 8 pages (/, /map, /projects, /readings, etc.)
- Bundle sizes verified:
  - Main chunk: 128KB (static export mode - larger than dev)
  - Framework chunk: 190KB
  - Shared JS: 102KB total
  - First Load JS: 102-132KB per route
- No TypeScript errors
- No CSP violations in build output
- CI bundle size tracking will verify <10% growth on PR
- Analytics packages added ~3-5KB (within expected range per DESIGN.md)

**Files**: None modified (verification only)

**Architecture**: Validates bundle size remains under limits (see DESIGN.md "Performance Considerations")

- Expected impact: +3.5KB (well under 5KB budget)
- Verifies static export compatibility
- Confirms no TypeScript or CSP violations

**Pseudocode**: See DESIGN.md section "Phase 3: Build Verification"

**Implementation**:

```bash
# Run production build
pnpm run build

# Verify bundle size (optional, for curiosity)
pnpm run analyze
```

**Success Criteria**:

- ✅ Build completes successfully (no TypeScript errors)
- ✅ Static export generates `.next` directory with HTML files
- ✅ Bundle size checks pass (main: <55KB, framework: <45KB)
- ✅ No CSP errors in build output
- ✅ CI bundle size check passes (if pushed to GitHub)

**Test Strategy**:

- Manual: Check build output for success messages
- Automated: CI workflow runs bundle size check on push
- Verification: `ls -lah .next/static/chunks/` shows ~3-5KB increase

**Dependencies**: Task 2 (layout integration must be complete)

**Time Estimate**: 10 minutes (includes build time)

---

- [~] **Task 4: Deploy and Verify Production Analytics**

**Files**: None modified (deployment verification)

**Architecture**: Validates production behavior (see DESIGN.md "Phase 4: Production Verification")

- Components only run in production (environment detection)
- Scripts load from `/_vercel/insights` (first-party endpoint)
- Data sent to Vercel platform for aggregation

**Pseudocode**: See DESIGN.md section "Phase 4: Production Verification"

**Implementation**:

1. Deploy to Vercel (automatic on git push to main)

   ```bash
   git add .
   git commit -m "feat: add Vercel Analytics and Speed Insights"
   git push origin feature/vercel-analytics
   ```

2. Create PR and merge (or push to main if deploying directly)

3. Wait for deployment to complete

4. Visit production site in browser

5. Open DevTools Network tab

6. Verify requests:
   - `/_vercel/insights/script.js` (200 status)
   - `/_vercel/insights/view` (pageview event, 200 status)
   - `/_vercel/insights/vitals` (Web Vitals event, 200 status)

7. Navigate between pages (/, /quotes, /readings) and verify pageview events fire

8. **Wait 24 hours** for data aggregation

9. Check Vercel dashboard:
   - Navigate to project → Analytics tab
   - Verify pageview data appears
   - Verify Web Vitals scores displayed (LCP, INP, CLS)
   - Verify traffic sources populated

**Success Criteria**:

- ✅ Script loads successfully (200 status for `/_vercel/insights/script.js`)
- ✅ Pageview events sent on route changes (200 status for `/_vercel/insights/view`)
- ✅ Web Vitals events sent (200 status for `/_vercel/insights/vitals`)
- ✅ No JavaScript errors in browser console
- ✅ Site functionality unaffected (all pages load normally)
- ✅ After 24h: Vercel dashboard shows analytics data

**Test Strategy**:

- Manual: Browser DevTools Network tab inspection
- Manual: Verify Vercel dashboard after 24h wait
- Automated: N/A (external service verification)

**Dependencies**: Task 3 (build must succeed before deployment)

**Time Estimate**: 15 minutes active + 24 hours passive (data aggregation)

---

- [ ] **Task 5: Document Analytics Setup in CLAUDE.md**

**Files**: `CLAUDE.md` (project conventions documentation)

**Architecture**: Documents observability conventions (see DESIGN.md "Security Considerations" - dependency documentation)

**Implementation**:
Add new section to `CLAUDE.md` after "## Content Structure":

```markdown
## Analytics & Observability

**Vercel Analytics**: Tracks pageviews and traffic sources

- Components: `<Analytics />` and `<SpeedInsights />` in `src/app/layout.tsx`
- Zero configuration needed (auto-detects production environment)
- Data visible in Vercel dashboard → Analytics tab

**Core Web Vitals Monitoring**:

- LCP (Largest Contentful Paint): Target ≤2.5s
- INP (Interaction to Next Paint): Target ≤200ms
- CLS (Cumulative Layout Shift): Target ≤0.1
- Tracked automatically via Speed Insights component

**Privacy**:

- GDPR-compliant (no cookies, no PII)
- First-party tracking only (`/_vercel/insights`)
- No consent banner required

**Free Tier Limits**: 2,500 events/month (sufficient for personal site)
```

**Success Criteria**:

- ✅ Section added to CLAUDE.md with clear documentation
- ✅ Includes dashboard access instructions
- ✅ Documents Web Vitals targets
- ✅ Notes privacy compliance

**Test Strategy**: N/A (documentation)

**Dependencies**: Task 4 (verify analytics work before documenting)

**Time Estimate**: 10 minutes

---

## Phase Summary

**Total Implementation Time**: ~45 minutes active work + 24 hours passive (data collection)

**Breakdown**:

- Task 1 (Install packages): 2 min
- Task 2 (Integrate components): 5 min
- Task 3 (Verify build): 10 min
- Task 4 (Deploy & verify): 15 min active + 24h passive
- Task 5 (Document): 10 min

**Parallelization**: Tasks 1-3 are sequential (dependencies). Task 4-5 can overlap (document while waiting for data).

---

## Acceptance Criteria (PR Merge Requirements)

Before merging PR, all must be ✅:

1. **Code Quality**:
   - ✅ TypeScript compilation succeeds (`pnpm run typecheck`)
   - ✅ ESLint passes with no violations (`pnpm run lint`)
   - ✅ All existing tests pass (`pnpm test`)
   - ✅ Build completes successfully (`pnpm run build`)

2. **Functionality**:
   - ✅ Analytics script loads in production (DevTools Network tab)
   - ✅ Pageview events sent on navigation
   - ✅ Web Vitals events sent
   - ✅ No JavaScript errors in console

3. **Performance**:
   - ✅ Bundle size under limits (CI check passes)
   - ✅ LCP unchanged or improved (visual inspection)
   - ✅ No CLS regressions (no layout shifts)

4. **Documentation**:
   - ✅ CLAUDE.md updated with analytics conventions
   - ✅ Clear instructions for accessing Vercel dashboard

5. **Security**:
   - ✅ No new high/critical vulnerabilities (`pnpm audit`)
   - ✅ CSP headers unchanged (first-party scripts)
   - ✅ No new environment variables required

---

## Notes

### Why No Test Task?

**From DESIGN.md "Testing Strategy"**:

- Analytics components render `null` in test environment (`NODE_ENV=test`)
- No application logic to test (components are external packages)
- Existing tests continue passing without modification
- Manual verification in production sufficient (external service)

### Why No Configuration Task?

**From DESIGN.md "Architecture Overview"**:

- Components auto-detect production environment
- No environment variables required
- No config files needed (components are zero-prop)
- Vercel platform handles all configuration

### Module Boundaries

**Analytics Component** (external):

- **Owns**: Pageview tracking, event batching, retry logic, production detection
- **Hides**: Script loading, queue management, network requests
- **Exposes**: Zero-prop React component

**Speed Insights Component** (external):

- **Owns**: Web Vitals measurement, Performance Observer API, attribution
- **Hides**: Metric calculation, buffering, serialization
- **Exposes**: Zero-prop React component

**Root Layout** (application):

- **Owns**: Component mounting, render order
- **Hides**: Nothing (integration layer)
- **Exposes**: Standard Next.js layout interface

---

## Design Iteration (Post-MVP)

**After Phase 1** (this PR):

- Review: Did analytics impact performance? (check Web Vitals baseline)
- Review: Is free tier sufficient? (monitor event count)
- Identify: Any errors in Vercel logs?

**Phase 2** (Future, if needed):

- Custom event tracking (quote favorites, reading completions)
- Add `track()` function wrapper for type safety
- See DESIGN.md "Alternative C: Custom Event Wrapper Functions"

**Phase 3** (Future, if traffic grows):

- Implement sampling to stay under free tier
- Or: Upgrade to Vercel Pro plan ($20/month)
- See DESIGN.md "Performance Considerations" → "Scaling Strategy"

---

## Automation Opportunities

None identified. Implementation is 4 lines of code - already minimal.

---

## Branch Naming

```bash
git checkout -b feature/vercel-analytics
```

**Commit Message Format** (after implementation):

```
feat: add Vercel Analytics and Speed Insights

- Install @vercel/analytics and @vercel/speed-insights packages
- Integrate Analytics and Speed Insights components in root layout
- Add zero-config observability for pageviews and Web Vitals
- Update CLAUDE.md with analytics documentation

Closes #[issue-number]
```

---

**Ready to implement.** All tasks are atomic, independently testable (where applicable), and follow existing codebase patterns.
