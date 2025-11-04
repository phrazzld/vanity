# DESIGN: Vercel Analytics & Speed Insights Integration

**Status**: Architecture Phase
**PRD Reference**: TASK.md
**Last Updated**: 2025-11-02

---

## Architecture Overview

**Selected Approach**: **Zero-Config Component Integration (Drop-in Pattern)**

**Rationale**: Vercel Analytics components are designed as pure React components with zero props, requiring no configuration, state management, or integration logic. This matches the project's "Static First" and "Simplicity" principles perfectly. The components self-initialize in production, lazy-load their scripts, and handle all complexity internally.

**Core Modules**:

- **Analytics Component** (`@vercel/analytics/next`): Tracks pageviews automatically, hides batching/retry/queue logic
- **Speed Insights Component** (`@vercel/speed-insights/next`): Measures Core Web Vitals, hides Performance Observer API
- **Root Layout** (`src/app/layout.tsx`): Integration point, renders both components once

**Data Flow**:

```
User visits page
     ↓
Next.js SSG renders layout.tsx
     ↓
<Analytics /> + <SpeedInsights /> components mount (production only)
     ↓
SDK scripts load asynchronously (non-blocking)
     ↓
SDK collects pageview + Web Vitals metrics
     ↓
Data batched and sent to /_vercel/insights (first-party endpoint)
     ↓
Vercel platform aggregates metrics
     ↓
Dashboard displays insights (external to codebase)
```

**Key Design Decisions**:

1. **Drop-in components over SDK initialization**: Eliminates configuration files, init code, and state management (simplicity)
2. **No environment variables**: Components work automatically in production via Vercel platform detection (explicitness)
3. **No testing changes**: Analytics components render null in test environment, no test modifications needed (maintainability)
4. **Static export compatible**: Components work with `output: 'export'` mode, no server-side requirements (architectural alignment)

---

## Alternative Architectures Considered

### Alternative A: SDK Initialization Pattern (Manual Setup)

**Structure**:

```typescript
// lib/analytics.ts - New file
import { init } from '@vercel/analytics';

export function initAnalytics() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    init({
      debug: false,
      beforeSend: (event) => {
        // Custom filtering logic
        return event;
      }
    });
  }
}

// app/layout.tsx
import { initAnalytics } from '@/lib/analytics';

export default function RootLayout({ children }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  return <html>...</html>
}
```

**Evaluation**:

- **Simplicity (40%)**: ❌ Poor - Requires new file, useEffect, client component conversion
- **Module Depth (30%)**: ❌ Shallow - Exposes initialization logic to application layer
- **Explicitness (20%)**: ⚠️ Medium - Clear what's happening, but more code to maintain
- **Robustness (10%)**: ✅ Same - No difference in error handling

**Verdict**: **REJECTED** - Adds unnecessary complexity. Component pattern is simpler and achieves same result.

---

### Alternative B: Custom Analytics Abstraction Layer

**Structure**:

```typescript
// lib/analytics/index.ts - New abstraction
export interface AnalyticsProvider {
  trackPageview(url: string): void;
  trackEvent(name: string, properties: Record<string, any>): void;
  init(): void;
}

class VercelAnalyticsProvider implements AnalyticsProvider {
  // Wrapper implementation
}

// Usage
const analytics = new VercelAnalyticsProvider();
analytics.init();
```

**Evaluation**:

- **Simplicity (40%)**: ❌ Very Poor - Abstract interface for single provider is premature
- **Module Depth (30%)**: ❌ Shallow - Adds layer that hides nothing (Vercel SDK already simple)
- **Explicitness (20%)**: ❌ Poor - Abstractions hide which provider is actually used
- **Robustness (10%)**: ⚠️ Medium - Easier to swap providers (YAGNI - won't happen)

**Verdict**: **REJECTED** - Classic over-engineering. Abstractions should wait for 2nd provider, not speculate. Violates YAGNI principle.

---

### Alternative C: Custom Event Wrapper Functions

**Structure**:

```typescript
// lib/analytics/events.ts
import { track } from '@vercel/analytics';

export function trackQuoteFavorite(quoteId: number, author: string) {
  track('Quote:Favorite', { quoteId, author });
}

export function trackReadingFinished(title: string, author: string) {
  track('Reading:Finished', { title, author });
}

// Usage in components
import { trackQuoteFavorite } from '@/lib/analytics/events';

onClick={() => trackQuoteFavorite(quote.id, quote.author)}
```

**Evaluation**:

- **Simplicity (40%)**: ⚠️ Medium - Adds event catalog file, but provides type safety
- **Module Depth (30%)**: ✅ Good - Hides `track()` API behind domain functions
- **Explicitness (20%)**: ✅ Good - Event names and properties typed and documented
- **Robustness (10%)**: ✅ Good - Prevents typos in event names, enforces schema

**Verdict**: **DEFERRED** - Excellent pattern for Phase 3 (custom events), but Phase 1 is pageviews only. Implement when needed, not before.

---

### Alternative D: Next.js Script Component Pattern

**Structure**:

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="/_vercel/insights/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
```

**Evaluation**:

- **Simplicity (40%)**: ⚠️ Medium - Manual script URL, no TypeScript types
- **Module Depth (30%)**: ❌ Shallow - Exposes script URL implementation detail
- **Explicitness (20%)**: ⚠️ Medium - Clear it's a script, but URL is magic string
- **Robustness (10%)**: ❌ Poor - No TypeScript checks, easy to typo URL

**Verdict**: **REJECTED** - `@vercel/analytics` package provides typed components. Using raw Script bypasses official SDK for no benefit.

---

### Selected Architecture: Drop-in Component Pattern ✅

**Structure**:

```typescript
// app/layout.tsx (only file modified)
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Evaluation**:

- **Simplicity (40%)**: ✅ Excellent - 2 imports, 2 components, zero configuration
- **Module Depth (30%)**: ✅ Excellent - Zero-prop interface, hides all complexity
- **Explicitness (20%)**: ✅ Good - Clear what components do, no magic config
- **Robustness (10%)**: ✅ Good - TypeScript types, official SDK, battle-tested

**Why This Wins**:

1. **Minimal surface area**: 2 lines of code, 1 file modified
2. **Deep modules**: Components hide script loading, batching, retry, environment detection, production gating
3. **Architectural alignment**: Matches existing patterns (ThemeInitializer, Footer, Header components in layout)
4. **Zero maintenance**: Components self-update via npm, no configuration to maintain
5. **Test compatibility**: Components render null in test env, no test changes needed

---

## Module Design (Deep Dive)

### Module: Analytics Component

**File**: `node_modules/@vercel/analytics/next` (external package)
**Integration Point**: `src/app/layout.tsx`

**Responsibility**: Hide all complexity of pageview tracking from application code

**Public Interface** (what application sees):

```typescript
// Zero-prop component - simplest possible interface
import { Analytics } from '@vercel/analytics/next';

// Usage - no configuration needed
<Analytics />
```

**Internal Implementation** (hidden complexity):

- Environment detection (only runs in production)
- Script loading (lazy, non-blocking, `/_vercel/insights/script.js`)
- Pageview collection (automatic on route changes)
- Event batching (reduces network requests)
- Retry logic (handles network failures)
- Queue management (prevents data loss)
- First-party endpoint routing (`/_vercel/insights`)

**Dependencies**:

- **Required**: Vercel hosting platform (for `/_vercel/insights` endpoint)
- **Optional**: None
- **Used by**: Root layout only

**Data Structures** (internal, not exposed):

```typescript
// Event format (sent to Vercel platform)
type PageviewEvent = {
  type: 'pageview';
  url: string;
  referrer: string;
  timestamp: number;
  // Additional metadata (browser, device, country) added by SDK
};
```

**Error Handling**:

- Script load failure → Silent (graceful degradation)
- Network request failure → Retry with exponential backoff
- Invalid data → Drop event, log to console (debug mode only)
- Test environment → Render null, no-op

---

### Module: Speed Insights Component

**File**: `node_modules/@vercel/speed-insights/next` (external package)
**Integration Point**: `src/app/layout.tsx`

**Responsibility**: Hide Performance Observer API complexity from application code

**Public Interface** (what application sees):

```typescript
// Zero-prop component - simplest possible interface
import { SpeedInsights } from '@vercel/speed-insights/next';

// Usage - no configuration needed
<SpeedInsights />
```

**Internal Implementation** (hidden complexity):

- Performance Observer API initialization
- Web Vitals measurement (LCP, FID, CLS, TTFB, FCP, INP)
- Attribution data collection (which DOM elements caused metrics)
- Metric buffering (avoids blocking main thread)
- Data serialization and transmission
- Environment detection (production only)

**Dependencies**:

- **Required**: Browser with Performance Observer API (Chrome 52+, Firefox 57+, Safari 11+)
- **Optional**: `webVitalsAttribution` in next.config.ts (for detailed attribution)
- **Used by**: Root layout only

**Data Structures** (internal, not exposed):

```typescript
// Web Vitals metric format
type WebVitalMetric = {
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  attribution?: {
    // Detailed attribution (which element caused the metric)
    element: string;
    url: string;
  };
};
```

**Error Handling**:

- Performance API unavailable → Silent (older browsers)
- Measurement failure → Skip metric, continue with others
- Network failure → Retry with backoff
- Test environment → Render null, no-op

---

### Module: Root Layout (Integration Layer)

**File**: `src/app/layout.tsx` (application code)
**Lines Changed**: +2 imports, +2 JSX components (4 total changes)

**Responsibility**: Mount analytics components in application tree

**Public Interface** (Next.js App Router contract):

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>{/* Theme initialization script */}</head>
      <body>
        <ThemeInitializer />
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
        </Suspense>
        <main>{children}</main>
        <Footer />

        {/* NEW: Analytics components */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Internal Implementation**:

- Renders analytics components at end of body (non-blocking)
- Components mount after main content renders
- No state management required
- No lifecycle hooks needed (components handle their own lifecycle)

**Dependencies**:

- **Requires**: `@vercel/analytics`, `@vercel/speed-insights` npm packages
- **Integrates with**: Next.js App Router, React 19
- **Used by**: All pages (layout wraps entire app)

**Data Flow**:

```
Layout renders
     ↓
React mounts Analytics component
     ↓
Analytics component checks environment (production?)
     ↓
If production: inject script, start tracking
If not: render null, no-op
```

**Error Handling**:

- Package not installed → TypeScript error at build time (caught early)
- Component render error → Error boundary catches (existing pattern)
- Script load failure → Graceful degradation (analytics stops, site works)

---

## Implementation Pseudocode

### Phase 1: Package Installation

```pseudocode
function installPackages():
  1. Verify package.json exists in /Users/phaedrus/Development/vanity/
  2. Run: pnpm add @vercel/analytics @vercel/speed-insights
  3. Verify packages appear in dependencies (not devDependencies)
  4. Expected packages:
     - @vercel/analytics@^1.5.0 (or latest)
     - @vercel/speed-insights@^1.1.0 (or latest)
  5. No package.json modifications needed (pnpm handles it)

  Success: Both packages in dependencies
  Failure: Build will fail with TypeScript error if import fails
```

---

### Phase 2: Layout Integration

```pseudocode
function integrateAnalytics():
  1. Open file: /Users/phaedrus/Development/vanity/src/app/layout.tsx

  2. Add imports after existing imports (line 7, after font imports):
     import { Analytics } from '@vercel/analytics/next';
     import { SpeedInsights } from '@vercel/speed-insights/next';

  3. Locate closing </body> tag (currently line 69)

  4. Add components before </body>:
     <Analytics />
     <SpeedInsights />

  5. Final structure:
     <body className="...">
       <ThemeInitializer />
       <Suspense>
         <Header />
       </Suspense>
       <main>{children}</main>
       <Footer />
       <Analytics />
       <SpeedInsights />
     </body>

  Success: File compiles with TypeScript
  Failure: Import error if packages not installed
```

---

### Phase 3: Build Verification

```pseudocode
function verifyBuild():
  1. Run: pnpm run build

  2. Monitor output for:
     - TypeScript compilation success
     - No import errors from @vercel packages
     - Static generation completes
     - Bundle size report shows +3-5KB (acceptable)

  3. Check bundle size against limits:
     - framework chunk: <45KB (vercel adds minimal overhead)
     - main chunk: <55KB
     - app chunks: <50KB each

  4. Verify no CSP errors (Content-Security-Policy):
     - Vercel scripts use first-party domain (/_vercel/*)
     - Should pass existing CSP rules

  Success: Build completes, bundle under limits
  Failure: Bundle size exceeded → Investigate (unlikely)
```

---

### Phase 4: Production Verification

```pseudocode
function verifyProduction():
  1. Deploy to Vercel: git push (auto-deploy on push)

  2. Visit production site in browser

  3. Open DevTools Network tab

  4. Look for requests to:
     - /_vercel/insights/script.js (Analytics script)
     - /_vercel/insights/view (Pageview event)
     - /_vercel/insights/vitals (Web Vitals event)

  5. Verify requests succeed (200 status)

  6. Check response headers:
     - Content-Type: application/javascript (for script)
     - Content-Type: application/json (for events)

  7. Wait 24 hours for data aggregation

  8. Visit Vercel dashboard → Analytics tab

  9. Verify metrics appear:
     - Pageview count > 0
     - Top pages list populated
     - Web Vitals scores displayed (LCP, INP, CLS)

  Success: Dashboard shows data
  Failure: No data after 24h → Check Vercel dashboard settings
```

---

## File Organization

### Modified Files

```
src/app/layout.tsx  [MODIFIED]
├── Add 2 import statements (lines 8-9)
├── Add 2 components before </body> (lines 70-71)
└── Total changes: 4 lines

package.json  [MODIFIED by pnpm]
└── Add 2 dependencies automatically
```

### New Files

**None.** This is a key architectural decision - zero new files, minimal modification to existing structure.

### Unchanged Files (Important Context)

```
next.config.ts
├── output: 'export' remains unchanged
├── Static export mode compatible with Analytics
└── No configuration needed for Analytics

vercel.json
├── CSP headers remain unchanged
├── Vercel Analytics uses first-party domain (/_vercel/*)
└── Passes existing security policy

src/lib/logger.ts
├── Console logging remains unchanged
├── No integration with Analytics needed
└── Analytics handles its own error logging

jest.config.js
├── Test configuration unchanged
├── Analytics components return null in test env
└── No test modifications needed
```

---

## Integration Points

### No Database Schema

**Why**: Analytics data stored on Vercel platform, not in application database.
**Benefit**: Zero database migrations, no schema to maintain.

### No Redis/Cache Layer

**Why**: Vercel handles event buffering and aggregation.
**Benefit**: Zero infrastructure setup, no cache invalidation complexity.

### No External APIs

**Why**: First-party endpoint (`/_vercel/insights`) handled by Vercel platform.
**Benefit**: No CORS issues, no API key management, no rate limiting concerns.

### Environment Variables

**None required.**

Vercel Analytics automatically detects production environment via:

- `process.env.NODE_ENV === 'production'`
- Vercel platform detection (checks for Vercel-specific environment variables)

**Benefit**: Zero configuration, works automatically in production, silent in dev/test.

### Build-Time Integration

```javascript
// next.config.ts - No changes needed
const nextConfig = {
  output: 'export', // Analytics works with static export
  // No analytics configuration needed
};
```

**Static Export Compatibility**:

- Analytics scripts injected client-side (no server rendering needed)
- Components render to empty div in SSG, populate client-side
- Works with `output: 'export'` mode (confirmed by Vercel docs)

### Runtime Integration

```
Page Load Sequence:
1. Next.js renders layout (SSG or client)
2. <Analytics /> component mounts
3. Component checks: if (production && typeof window !== 'undefined')
4. If true: inject script tag, start tracking
5. If false: render null, no-op
6. User navigates → Next.js router fires event
7. Analytics listens to router events
8. Pageview automatically tracked
9. Web Vitals measured via Performance Observer
10. Data batched and sent to /_vercel/insights
```

---

## State Management

### No Client State

**Analytics Components**: Stateless from application perspective. Internal state hidden.

**Application State** (Zustand store): No changes needed. Analytics doesn't integrate with Zustand.

**Why**: Analytics is a pure observer - reads route changes, writes to external API. No shared state with application.

### No Server State

**Static Site**: No server to maintain state.
**Vercel Platform**: Handles all state (event queue, aggregation, storage).

**Why**: Static export mode means zero server-side code. Analytics entirely client-side.

### No Persistent State

**No localStorage**: Analytics doesn't persist user IDs or session data.
**No cookies**: GDPR-compliant, cookie-less tracking.

**Why**: Privacy-first design. Each pageview is independent, no cross-session tracking.

---

## Error Handling Strategy

### Error Categories

#### 1. Package Installation Errors (Build-Time)

**Symptoms**:

- TypeScript: `Cannot find module '@vercel/analytics/next'`
- Build fails with import error

**Cause**: Package not installed or wrong import path

**Mitigation**:

```pseudocode
if build fails with import error:
  1. Run: pnpm install (ensure lockfile respected)
  2. Verify package.json contains @vercel/analytics
  3. Clear node_modules: rm -rf node_modules && pnpm install
  4. Check pnpm version: pnpm --version (should be 10.17.1+)
```

**Recovery**: Automatic - fix package.json, re-run install

---

#### 2. Script Load Errors (Runtime, Production)

**Symptoms**:

- Network tab shows 404 for `/_vercel/insights/script.js`
- Analytics events not sent

**Cause**:

- Not deployed to Vercel platform
- Vercel Analytics not enabled in dashboard
- Incorrect deployment configuration

**Mitigation**:

```pseudocode
if script fails to load:
  1. Verify site deployed to Vercel (not self-hosted)
  2. Check Vercel dashboard → Analytics tab → Enable Analytics
  3. Verify deployment environment is production (not preview)
  4. Re-deploy: git push (force new deployment)
```

**Recovery**: Manual - enable Analytics in Vercel dashboard, redeploy

---

#### 3. Content Security Policy (CSP) Violations

**Symptoms**:

- Console error: "Refused to load script..."
- Analytics script blocked by CSP

**Cause**: CSP headers too restrictive

**Current CSP** (vercel.json):

```
script-src 'self' 'unsafe-inline' 'unsafe-eval';
connect-src 'self' https:;
```

**Mitigation**:

- Vercel scripts use `/_vercel/*` (first-party, same origin)
- `script-src 'self'` allows it
- `connect-src 'self'` allows API calls
- **No CSP changes needed** (already compatible)

**If CSP error occurs**:

```pseudocode
if CSP blocks Vercel scripts:
  1. Verify script URL is /_vercel/insights/script.js (first-party)
  2. Check CSP: script-src should include 'self'
  3. Check CSP: connect-src should include 'self' or 'https:'
  4. If restrictive: Add 'https://*.vercel-insights.com' to connect-src
```

**Recovery**: Automatic - existing CSP already compatible

---

#### 4. Bundle Size Regression

**Symptoms**:

- CI fails with "Bundle size exceeded"
- GitHub Action reports bundle growth > 10%

**Cause**: Analytics packages larger than expected

**Expected Impact**:

- `@vercel/analytics`: ~2KB gzipped
- `@vercel/speed-insights`: ~1.5KB gzipped
- **Total**: ~3.5KB (well under 5KB budget)

**Mitigation**:

```pseudocode
if bundle size exceeds limits:
  1. Run: pnpm run analyze (webpack-bundle-analyzer)
  2. Verify @vercel packages are ~3.5KB total
  3. If larger: Check for accidental imports (e.g., importing from wrong package)
  4. Verify tree-shaking works (only production code included)

if legitimate growth:
  1. Update bundlesize config in package.json
  2. Document reason in PR (adding analytics justifies 3.5KB)
  3. Ensure still under Next.js chunk limits (55KB main, 45KB framework)
```

**Recovery**: Automatic - adjust bundle size limits if needed

---

#### 5. Test Environment Errors

**Symptoms**:

- Tests fail with "Analytics is not defined"
- Tests try to load Vercel scripts

**Cause**: Analytics components run in test environment

**Expected Behavior**: Components should render null in test env

**Mitigation**:

```pseudocode
if tests fail with Analytics errors:
  1. Verify NODE_ENV=test in jest.config.js
  2. Analytics components check: if (process.env.NODE_ENV === 'production')
  3. If false, components render null → no script loading
  4. No test modifications needed

if component doesn't check environment:
  1. This is a bug in @vercel/analytics package
  2. Report to Vercel (unlikely - battle-tested package)
  3. Workaround: Mock component in jest.setup.js
```

**Recovery**: Automatic - components handle test env correctly

---

### Error Response Format

**Analytics components**: No error responses to application. All errors silent (graceful degradation).

**Philosophy**: Analytics is non-critical. If it fails, site should work normally.

### Logging Strategy

**Development**:

- Analytics components log to console (debug mode)
- Use React DevTools to inspect component state

**Production**:

- Analytics errors logged to Vercel's internal error tracking
- Application logger (`src/lib/logger.ts`) unaffected
- No additional logging configuration needed

**Monitoring**:

- Vercel dashboard shows Analytics health (script load success rate)
- No custom monitoring needed

---

## Testing Strategy

### Unit Tests

**None required.**

**Why**:

- Analytics components are external packages (already tested by Vercel)
- Zero application logic to test (drop-in components)
- Components render null in test environment

### Integration Tests

**None required.**

**Why**:

- No integration with application code (pure observers)
- No shared state to test
- No API contracts to verify (Vercel platform handles endpoints)

### E2E Tests

**Manual verification only** (not automated):

```pseudocode
Manual Test Plan:
1. Deploy to Vercel production
2. Visit site in browser
3. Open DevTools Network tab
4. Verify /_vercel/insights/script.js loads (200 status)
5. Navigate between pages (/, /quotes, /readings)
6. Verify pageview events sent for each route
7. Wait 24 hours
8. Check Vercel dashboard for analytics data
```

**Why manual**: Analytics is external service, E2E tests would hit production Vercel API (not recommended).

### Test Coverage Impact

**Before**: 100% coverage (existing baseline)
**After**: 100% coverage (no application code added)

**Why**: Components imported from external package, not counted in coverage.

---

### Mocking Strategy

**No mocks needed.**

**Existing test behavior**:

```typescript
// jest.setup.js - No changes needed
// Analytics components automatically render null in test env

// Example test - No modification needed
describe('Layout', () => {
  it('renders children', () => {
    render(<RootLayout><div>Child</div></RootLayout>);
    expect(screen.getByText('Child')).toBeInTheDocument();
    // Analytics component renders null, doesn't affect test
  });
});
```

**Why this works**:

- Components check `process.env.NODE_ENV === 'production'`
- Jest sets `NODE_ENV=test` by default
- Components return null in test, no script loading

---

## Performance Considerations

### Expected Load

**Static Site Characteristics**:

- No auth, no dynamic content
- All pages statically generated
- CDN-cached HTML/CSS/JS

**Analytics Load** (estimated):

- 500-2,500 pageviews/month (typical personal site)
- 1,000-5,000 Web Vitals measurements/month (2x pageviews)
- **Total**: <2,500 events/month (fits free tier)

### Optimizations (Built-in)

**Script Loading**:

- Lazy loaded (after page interactive)
- Non-blocking (async attribute)
- First-party domain (no DNS lookup)

**Event Batching**:

- SDK batches events (reduces requests)
- Sends max every 5 seconds or 10 events
- Reduces network overhead

**Bundle Size**:

- Tree-shaking enabled (only used code included)
- Gzipped compression (~3.5KB total)
- Minimal impact on LCP (loads after content)

**Web Vitals Measurement**:

- Uses Performance Observer API (native browser)
- No blocking main thread
- Measurements buffered, sent in batch

### Performance Budget

**Before Analytics**:

- Main bundle: ~50KB
- Framework bundle: ~40KB
- **Total**: ~90KB

**After Analytics**:

- Analytics package: +2KB
- Speed Insights package: +1.5KB
- **Total**: ~93.5KB (+3.8%)

**Budget Status**: ✅ Under limits (main: 55KB, framework: 45KB)

---

### Scaling Strategy

**Free Tier Limits**:

- 2,500 events/month
- 30-day retention

**If Traffic Grows**:

#### Option 1: Upgrade to Pro ($20/month)

- 25,000 events included
- Additional 500k events: +$50
- 90-day retention

#### Option 2: Implement Sampling

```pseudocode
function shouldTrackPageview():
  if events_this_month < 2000:
    return true
  else:
    // Sample 20% of remaining traffic
    return Math.random() < 0.2
```

#### Option 3: Move to Self-Hosted Analytics

- Plausible (self-hosted): Free, infrastructure cost only
- Requires: Docker, 1GB RAM, 10GB storage
- **Effort**: 8-12 hours setup + ongoing maintenance

**Recommendation**: Stay on free tier. Traffic unlikely to exceed 2,500 events/month for personal site.

---

### Performance Monitoring

**Baseline Metrics** (establish before Analytics):

```
Target Web Vitals (75th percentile):
- LCP: ≤2.5s (Largest Contentful Paint)
- INP: ≤200ms (Interaction to Next Paint)
- CLS: ≤0.1 (Cumulative Layout Shift)
- TTFB: ≤600ms (Time to First Byte)
```

**After Analytics Deployment**:

- Verify Web Vitals remain within targets
- Analytics should add <50ms to LCP (lazy loading)
- No impact on CLS (components at end of body)
- Minimal INP impact (<10ms)

**Regression Detection**:

- CI already tracks bundle size (automated)
- Manually verify Web Vitals after deploy
- If regression: Investigate script load timing

---

## Security Considerations

### Threats Mitigated

#### 1. Script Injection

**Threat**: Malicious script injected via compromised CDN
**Mitigation**: First-party domain (`/_vercel/*`) controlled by Vercel
**Result**: No third-party CDN, reduced attack surface

#### 2. Data Exfiltration

**Threat**: Analytics collects PII and sends to external server
**Mitigation**: GDPR-compliant, no cookies, no user IDs, aggregate data only
**Result**: Zero PII collected, even if compromised

#### 3. Ad Blocker Evasion Detection

**Threat**: Site breaks for users with ad blockers
**Mitigation**: Analytics fails gracefully (no errors if blocked)
**Result**: Site works normally, analytics stops silently

#### 4. Cross-Site Tracking

**Threat**: Analytics tracks users across sites
**Mitigation**: First-party only, no cross-domain cookies
**Result**: Tracking scoped to vanity.yoursite.com only

---

### Security Best Practices (Already Followed)

#### Content Security Policy (CSP)

**Current CSP** (vercel.json, line 19):

```
script-src 'self' 'unsafe-inline' 'unsafe-eval';
connect-src 'self' https:;
```

**Analytics Compatibility**:

- Scripts: `/_vercel/insights/script.js` → Allowed by `'self'`
- API calls: `/_vercel/insights/view` → Allowed by `'self'`
- **No CSP changes needed** ✅

#### Subresource Integrity (SRI)

**Not applicable**: First-party scripts don't use SRI (same origin, controlled by deployment).

#### HTTPS Enforcement

**Already enforced** (vercel.json, line 24):

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Analytics Impact**: Scripts only load over HTTPS ✅

#### Permissions Policy

**Already configured** (vercel.json, line 40):

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Analytics Impact**: No additional permissions requested ✅

---

### Privacy Compliance

#### GDPR (EU)

**Requirements**: Consent for cookies, right to data deletion, data minimization
**Compliance**:

- ✅ No cookies used (no consent banner needed)
- ✅ No PII collected (nothing to delete)
- ✅ Data minimized (aggregate stats only)

#### CCPA (California)

**Requirements**: Disclosure of data collection, opt-out mechanism
**Compliance**:

- ✅ Anonymous data (no "sale" of personal info)
- ✅ No opt-out needed (no PII to opt out of)

#### PECR (UK)

**Requirements**: Cookie consent
**Compliance**:

- ✅ No cookies (no consent needed)

**Documentation**: No privacy policy updates needed (already covered by "analytics" disclosure).

---

### Dependency Security

#### Package Audit

**Before adding packages**:

```bash
pnpm audit --audit-level=high
# Should return: No vulnerabilities found
```

**After adding packages**:

```bash
pnpm add @vercel/analytics @vercel/speed-insights
pnpm audit --audit-level=high
# Verify: No new high/critical vulnerabilities
```

**CI Integration**: Already configured (npm run security:audit in CI)

#### Supply Chain Security

**Vercel Packages**:

- Official packages from Vercel
- SOC 2 Type II certified organization
- Actively maintained (weekly releases)
- No known CVEs

**Mitigation**: Use lockfile (`pnpm-lock.yaml`) to pin versions, prevent supply chain attacks.

---

### Security Monitoring

**No additional monitoring needed**:

- Vercel platform handles security monitoring
- CI already runs security audits (`.github/workflows/ci.yml`)
- Existing error boundary catches component errors

**If security issue discovered**:

```pseudocode
if security vulnerability in @vercel/analytics:
  1. Check pnpm audit output
  2. Update package: pnpm update @vercel/analytics
  3. Run tests: pnpm test (verify no breaking changes)
  4. Deploy: git push (CI runs security scan)
```

---

## Complexity Assessment

### Simplicity Score: ⭐⭐⭐⭐⭐ (5/5 - Excellent)

**Why**:

- 4 lines of code changed
- 1 file modified
- 0 new files
- 0 configuration needed
- 0 environment variables
- 0 test changes
- 0 state management changes

**Comparison to alternatives**:

- Manual SDK init: 3/5 (new file, useEffect, config)
- Abstraction layer: 1/5 (over-engineered)
- Custom events: 4/5 (good for Phase 3, premature for Phase 1)

---

### Module Depth Score: ⭐⭐⭐⭐⭐ (5/5 - Excellent)

**Analytics Component**:

- **Interface**: Zero props (simplest possible)
- **Implementation**: Hides 500+ lines of SDK code
- **Depth**: Extremely deep module

**Speed Insights Component**:

- **Interface**: Zero props
- **Implementation**: Hides Performance Observer complexity
- **Depth**: Extremely deep module

**Comparison**: These are textbook examples of deep modules (John Ousterhout's ideal).

---

### Explicitness Score: ⭐⭐⭐⭐ (4/5 - Good)

**Explicit**:

- Clear what components do (`<Analytics />`, `<SpeedInsights />`)
- Dependencies declared in package.json
- Integration point obvious (root layout)

**Implicit** (minor):

- Production gating hidden in component (not obvious it only runs in prod)
- Vercel platform dependency not explicitly stated in code

**Mitigation**: Document in CLAUDE.md that Analytics requires Vercel hosting.

---

### Robustness Score: ⭐⭐⭐⭐⭐ (5/5 - Excellent)

**Error Handling**:

- ✅ Graceful degradation (site works if analytics fails)
- ✅ No user-facing errors (silent failures)
- ✅ Battle-tested packages (Vercel's production-grade SDK)

**Scaling**:

- ✅ Handles 2,500 events/month (free tier)
- ✅ Easy upgrade path (Pro plan or sampling)

**Maintenance**:

- ✅ Zero configuration to maintain
- ✅ Auto-updates via npm
- ✅ No breaking changes expected (stable API)

---

## Summary

**This architecture achieves the "impossible" trifecta**:

1. **Minimal code** (4 lines changed)
2. **Maximum depth** (components hide all complexity)
3. **Zero maintenance** (no configuration to manage)

**The secret**: Leveraging Vercel's platform integration. By using their native components instead of fighting the ecosystem, we get production-grade analytics with near-zero effort.

**Next steps**: Run `/plan` to convert this architecture into atomic implementation tasks.

---

_Last Updated: 2025-11-02_
_Architecture validated against: Simplicity, Module Depth, Explicitness, Robustness_
_Architect: Claude (IQ 165 system design specialist)_
