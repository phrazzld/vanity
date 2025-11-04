# PRD: Vercel Analytics and Observability

## Executive Summary

Implement zero-config observability for the Vanity personal site using Vercel Analytics and Speed Insights. Track basic visitor metrics (pageviews, traffic sources) and Core Web Vitals (LCP, INP, CLS) to monitor site health. Solution leverages existing Vercel infrastructure, costs $0 (free tier), requires no cookie consent banners, and adds <3KB to bundle size.

**User Value**: Visibility into site traffic and performance without complexity or cost.

**Success Criteria**: Pageview data and Web Vitals visible in Vercel dashboard within 24 hours of deployment.

---

## User Context

**Who**: Site owner (you) monitoring a personal content site (quotes + readings library)

**Problem Being Solved**:

- Zero visibility into who visits the site, traffic patterns, or popular content
- No monitoring of real-user performance (Core Web Vitals)
- Can't detect performance regressions or errors in production
- No data to inform content strategy or technical decisions

**Measurable Benefits**:

- Answer "How many people visit my site?" (daily/weekly/monthly)
- Identify traffic sources (referrers, search, direct)
- Monitor Core Web Vitals to maintain Google search ranking
- Detect performance regressions before they impact users

---

## Requirements

### Functional Requirements

**Must Have (MVP)**:

1. Track pageviews across all routes (`/`, `/quotes`, `/readings/*`)
2. Measure Core Web Vitals (LCP, INP, CLS, TTFB, FCP)
3. Show traffic sources and referrers
4. Display device breakdown (mobile/desktop/tablet)
5. Work on Vercel deployments automatically (no manual dashboard config)

**Won't Have (Explicitly Excluded)**:

- Custom event tracking (quote favorites, reading completion)
- Error tracking service (Sentry, Rollbar)
- User identification or session tracking
- Funnel analysis or cohort tracking
- Real-time alerts or notifications

### Non-Functional Requirements

**Performance**:

- Bundle size increase ≤5KB (target: ~3KB)
- Script loads asynchronously (non-blocking)
- Zero impact on LCP/INP metrics

**Privacy**:

- GDPR-compliant without cookie consent banner
- No personally identifiable information (PII) collected
- No cookies or persistent tracking

**Reliability**:

- Graceful degradation if analytics fails (no user-visible errors)
- Works in production only (no dev environment noise)

**Maintainability**:

- Zero configuration maintenance
- No environment variables required
- Updates via npm package updates only

---

## Architecture Decision

### Selected Approach: Vercel Native Stack

**Components**:

1. **`@vercel/analytics`** - Pageview and visitor tracking
2. **`@vercel/speed-insights`** - Core Web Vitals monitoring

**Integration Points**:

- `src/app/layout.tsx` - Root layout (adds `<Analytics />` and `<SpeedInsights />`)
- `package.json` - Add dependencies
- Vercel dashboard - Enable Analytics (one-time)

**Module Boundaries**:

```
┌─────────────────────────────────────────────┐
│ Root Layout (src/app/layout.tsx)            │
│ ┌─────────────────────────────────────────┐ │
│ │ <Analytics />                           │ │
│ │ - Tracks pageviews automatically        │ │
│ │ - Sends data to /_vercel/insights       │ │
│ │ - Hides: batching, retry logic, queue   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ <SpeedInsights />                       │ │
│ │ - Measures Web Vitals (LCP, INP, CLS)   │ │
│ │ - Hides: performance observer API       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
           │
           ▼
    Vercel Dashboard
    (aggregate metrics)
```

**Abstraction Layers**:

- **Application Layer**: Uses `<Analytics />` / `<SpeedInsights />` components (simple interface)
- **SDK Layer**: Handles data collection, batching, transmission (hidden complexity)
- **Platform Layer**: Vercel aggregates, stores, displays metrics (external system)

### Alternatives Considered

| Alternative               | User Value                            | Simplicity                | Risk             | Why Not Chosen                                        |
| ------------------------- | ------------------------------------- | ------------------------- | ---------------- | ----------------------------------------------------- |
| **Plausible Analytics**   | High (funnel analysis, custom events) | Medium (external service) | Low              | $11/month cost unnecessary for basic metrics          |
| **Google Analytics 4**    | High (mature features)                | Low (complex setup)       | Medium (privacy) | Cookie banners required, overkill for personal site   |
| **Self-hosted Plausible** | High (full control)                   | Low (maintenance)         | Medium (uptime)  | Maintenance burden not justified by $11/month savings |
| **No analytics**          | None                                  | High (zero code)          | High (blind)     | Can't measure site health or traffic                  |

**Decision Rationale**:

- **User Value (40%)**: Basic metrics sufficient for personal site ✅
- **Simplicity (30%)**: Zero-config, native integration ✅
- **Explicitness (20%)**: Two clear components, no hidden dependencies ✅
- **Risk (10%)**: Proven solution, free tier generous ✅

---

## Dependencies & Assumptions

### Dependencies

**External Systems**:

- Vercel platform (deployment infrastructure) - REQUIRED
- Vercel Analytics dashboard - REQUIRED for viewing data
- Next.js 15+ with App Router - REQUIRED (already satisfied)

**NPM Packages**:

- `@vercel/analytics` (latest: 1.5.0)
- `@vercel/speed-insights` (latest: 1.1.0)

**Browser Support**:

- Modern browsers with Performance Observer API (Chrome 52+, Firefox 57+, Safari 11+)
- Graceful degradation for older browsers (no errors, just no tracking)

### Assumptions

**Scale Expectations**:

- <2,500 events/month (pageviews + Web Vitals measurements)
- Free tier sufficient for personal site traffic
- If exceeds: upgrade to Pro ($20/month for 25k events)

**Environment**:

- Site deployed to Vercel (not self-hosted or other platforms)
- Production environment only (no dev/staging tracking)
- HTTPS enabled (required for Performance Observer API)

**Team Constraints**:

- Solo developer maintaining site
- No analytics expertise required
- No ongoing configuration or tuning needed

### Integration Requirements

**Build Process**:

- No build-time changes required
- Packages tree-shakeable (no bundle bloat if unused)

**Runtime**:

- Components render only in production (`NODE_ENV=production`)
- Scripts load after page interactive (`strategy="afterInteractive"`)

**Data Flow**:

```
User visits page
     ↓
Next.js renders <Analytics /> + <SpeedInsights />
     ↓
SDK collects pageview + Web Vitals
     ↓
Data batched and sent to /_vercel/insights
     ↓
Vercel platform aggregates metrics
     ↓
Dashboard displays insights
```

---

## Implementation Phases

### Phase 1: MVP (Week 1, Day 1-2)

**Goal**: Basic analytics operational in production

**Tasks**:

1. Install npm packages (`@vercel/analytics`, `@vercel/speed-insights`)
2. Add components to `src/app/layout.tsx`
3. Verify bundle size impact (CI check)
4. Deploy to production
5. Enable Analytics in Vercel dashboard (one-time)
6. Verify data appears in dashboard (wait 24h for metrics)

**Acceptance Criteria**:

- ✅ Analytics components render in production (check network tab for `/_vercel/insights` requests)
- ✅ Pageview data visible in Vercel dashboard
- ✅ Core Web Vitals tracked (LCP, INP, CLS)
- ✅ Bundle size increase <5KB
- ✅ CI pipeline passes (no regressions)

**Estimated Effort**: 25 minutes active work + 24h data collection

---

### Phase 2: Documentation (Week 1, Day 3)

**Goal**: Document analytics setup and conventions

**Tasks**:

1. Update `CLAUDE.md` with analytics conventions
2. Add observability section to project README
3. Document metrics interpretation (what's "good" LCP/INP/CLS)
4. Record Vercel dashboard access instructions

**Acceptance Criteria**:

- ✅ Future contributors know analytics exists
- ✅ Documented how to interpret Web Vitals scores
- ✅ Recorded where to find analytics data

**Estimated Effort**: 30 minutes

---

### Phase 3: Future Enhancements (Optional, Month 2+)

**Not Committed, Evaluate Later**:

**If traffic grows significantly** (>2,500 events/month):

- Upgrade to Vercel Pro plan ($20/month)
- Or: Implement sampling to stay under free tier

**If need custom event tracking**:

- Use `track()` function from `@vercel/analytics`
- Track quote favorites, reading completions, dark mode toggles
- Requires user interaction handlers

**If need error tracking**:

- Add Sentry (`@sentry/nextjs`)
- Configure error boundaries to send to Sentry
- Free tier: 5k errors/month

**If need advanced analytics**:

- Evaluate Plausible ($11/month) for funnel analysis
- Or: Build custom analytics using Vercel logs + PostHog

---

## Risks & Mitigation

| Risk                             | Likelihood                | Impact                     | Mitigation                                                                        |
| -------------------------------- | ------------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| **Free tier exceeded**           | Low (personal site)       | Low (upgrade $20/month)    | Monitor events count, implement sampling if approaching limit                     |
| **Ad blockers block tracking**   | Medium (30-40% users)     | Low (still get 60%+ data)  | Vercel uses first-party domain (`/_vercel/*`), higher success rate than GA        |
| **Bundle size regression**       | Low (controlled packages) | Medium (affects LCP)       | CI enforces bundle size limits, async loading prevents blocking                   |
| **Analytics data not appearing** | Low (mature product)      | Low (non-critical)         | Wait 24h for first data, verify network requests, check Vercel dashboard settings |
| **GDPR compliance questioned**   | Very Low (no PII)         | Low (legal review)         | Vercel privacy policy explicitly GDPR-compliant, no cookies = no consent needed   |
| **Vendor lock-in to Vercel**     | Medium (intentional)      | Low (export data possible) | Acceptable trade-off for simplicity, can migrate to Plausible later if needed     |

---

## Key Decisions

### Decision 1: Vercel Analytics vs Plausible

**What**: Which analytics provider to use
**Alternatives**: Vercel Analytics (free), Plausible ($11/month), Google Analytics 4 (free)
**Rationale**: Vercel Analytics wins on simplicity + cost for basic metrics
**Trade-offs**:

- ✅ Gain: Zero config, zero cost, perfect stack integration
- ❌ Lose: Advanced features (funnels, cohorts, custom events)
- **Acceptable**: Basic metrics sufficient for site health + vanity metrics

---

### Decision 2: Custom Event Tracking

**What**: Track user interactions (quote favorites, reading completions)
**Alternatives**: Implement now, add later, never add
**Rationale**: YAGNI - pageviews sufficient for current needs
**Trade-offs**:

- ✅ Gain: Simpler implementation, less code to maintain
- ❌ Lose: Can't measure engagement depth (but can add later with `track()`)
- **Acceptable**: Can add custom events incrementally when needed

---

### Decision 3: Error Tracking

**What**: Add Sentry or similar error monitoring
**Alternatives**: Sentry ($0-26/month), Rollbar, no error tracking
**Rationale**: Keep existing console logging, no external service
**Trade-offs**:

- ✅ Gain: Zero cost, simpler stack, one less dependency
- ❌ Lose: Production errors only visible in browser console (not aggregated)
- **Acceptable**: Personal site, low traffic, manual testing sufficient

---

### Decision 4: Speed Insights vs Analytics Alone

**What**: Include `@vercel/speed-insights` package
**Alternatives**: Analytics only, both packages
**Rationale**: Include both - Web Vitals critical for SEO + performance monitoring
**Trade-offs**:

- ✅ Gain: Core Web Vitals tracking, performance regression detection
- ❌ Lose: +1.5KB bundle size (minimal)
- **Acceptable**: Performance monitoring essential, negligible cost

---

## Quality Validation

### Deep Modules ✅

- **`<Analytics />`**: Simple interface (zero props), hides batching/retry/queue complexity
- **`<SpeedInsights />`**: Simple interface (zero props), hides Performance Observer API

### Information Hiding ✅

- Implementation details encapsulated (event batching, network requests, data format)
- Callers only know: "render component, get analytics"
- Vercel can change backend without breaking our code

### Abstraction Layers ✅

- **Application**: Uses components (domain: "track my site")
- **SDK**: Collects data (domain: "events and metrics")
- **Platform**: Aggregates/displays (domain: "insights dashboard")
- Each layer transforms vocabulary meaningfully

### Strategic Design ✅

- Investing in observability foundation (10% effort)
- Enables data-driven decisions for future features
- Minimal maintenance burden (auto-updates via npm)

---

## Implementation Code Preview

```typescript
// src/app/layout.tsx (after implementation)
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>{/* existing head content */}</head>
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**That's it.** Two components, zero configuration.

---

## Success Metrics

**Week 1 (Post-Deployment)**:

- Analytics dashboard shows pageview data ✅
- Web Vitals scores visible (LCP, INP, CLS) ✅
- Traffic sources identified ✅

**Week 2 (Validation)**:

- LCP ≤2.5s (75th percentile) ✅
- INP ≤200ms (75th percentile) ✅
- CLS ≤0.1 (75th percentile) ✅

**Month 1 (Insights)**:

- Identify top 5 most visited pages
- Understand mobile vs desktop split
- Baseline performance established for regression detection

---

## Timeline Estimate

**Total Implementation Time: 25 minutes**

Breakdown:

- Install packages: 2 min
- Modify layout.tsx: 3 min
- Test locally: 5 min
- Deploy to production: 5 min
- Enable Vercel dashboard: 5 min
- Verify data collection: 5 min

**Wait Time: 24 hours** (for first metrics to appear)

**Documentation: 30 minutes** (next day)

---

## Next Steps

1. **Approve this PRD** ✅ (you approved via /spec)
2. **Run `/plan`** to break into implementation tasks
3. **Execute Phase 1** (install + deploy)
4. **Wait 24h** for data collection
5. **Verify** metrics in Vercel dashboard
6. **Document** in CLAUDE.md

---

**Ready to implement.**

_Last Updated: 2025-11-02_
_Spec Version: 2.0_
