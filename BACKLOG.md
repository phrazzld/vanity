# BACKLOG

- [ ] navbar should have the same width as page content
- [ ] fonts should be redone, esp on readings page (headings are meh all around, fonts and overall design)
- [ ] we should have a very simple, clean, fullwidth footer that links to email and github
- [ ] light/dark mode toggle creates a sort of flicker of page content -- it should not
- [ ] redesign projects section to be more single column, only refer to projects that are actually deployed and live

## Critical Priority (CRITICAL)

_ACTUAL critical issues that affect the live site_

- [ ] **[CRITICAL] [PERF]** Bundle size optimization | **Effort: M** | **Current: 2MB, Target: <1MB** | **Impact: 50% faster initial load**

## High Priority (HIGH)

_Code health issues, DX blockers, architecture debt, philosophy violations_

### Security & Infrastructure

- [ ] **[HIGH] [SECURITY]** Upgrade to Snyk integration with automated vulnerability scanning | **Effort: S** | **Quality: 10/10** | **Target: Zero CVEs, automated PR creation for patches**

### Developer Experience

- [ ] **[HIGH] [DX]** Implement smart test execution with incremental coverage | **Effort: M** | **Time saved: 8-12 hrs/week** | **Quality: Maintains standards while accelerating cycles**

- [ ] **[HIGH] [DX]** Parallel quality gates with early termination | **Effort: M** | **Time saved: 6-10 hrs/week** | **Quality: 5-10s feedback vs 15-30s**

### Features & Innovation

- [ ] **[HIGH] [FEATURE]** Smart content pipeline with AI assistance | **Effort: M** | **Quality: 9/10** | **Innovation: Auto-generate summaries while maintaining personal touch**

- [ ] **[HIGH] [FEATURE]** Interactive reading journey visualization | **Effort: M** | **Quality: 9/10** | **Innovation: Replace static lists with timeline/network graphs**

- [ ] **[HIGH] [FEATURE]** PWA with offline reading notes | **Effort: M** | **Quality: 9/10** | **Innovation: Modern web capabilities demonstration**

## Medium Priority (MEDIUM)

_Valuable features, simplifications, documentation, performance with metrics_

### Testing & Documentation

- [ ] **[MEDIUM] [MAINTAIN]** Add comprehensive API route testing | **Effort: M** | **Value: 90%+ API coverage with error scenarios** | **Automation: OpenAPI validation**

- [ ] **[MEDIUM] [MAINTAIN]** Create architectural decision records (ADRs) | **Effort: S** | **Value: 10+ ADRs documenting choices** | **Automation: Template-based generation**

- [ ] **[MEDIUM] [FEATURE]** Visual regression testing automation | **Effort: S** | **Value: Catch UI regressions during style overhaul** | **Innovation: Extend snapshot testing**

### Developer Experience

- [ ] **[MEDIUM] [DX]** Contextual error recovery assistant | **Effort: L** | **Time saved: 4-6 hrs/week** | **Quality: Auto-repair with learning opportunities**

- [ ] **[MEDIUM] [DX]** Development environment health monitoring | **Effort: S** | **Time saved: 3-5 hrs/week** | **Quality: Proactive issue prevention**

### Performance & Features

- [ ] **[MEDIUM] [PERF]** Implement code splitting and dynamic imports | **Effort: M** | **Value: 40% bundle size reduction (2MB→1.2MB)** | **Measurement: webpack-bundle-analyzer**

- [ ] **[MEDIUM] [PERF]** Optimize image loading with responsive sizes | **Effort: S** | **Value: 60% image payload reduction, 25% better LCP** | **Measurement: Core Web Vitals**

- [ ] **[MEDIUM] [FEATURE]** Context-aware quote display | **Effort: S** | **Value: Seasonal/time-based variations** | **Innovation: Intelligent context without complexity**

- [ ] **[MEDIUM] [FEATURE]** GitHub integration showcase | **Effort: M** | **Value: Auto-sync coding projects** | **Innovation: API integration demonstration**

- [ ] **[MEDIUM] [FEATURE]** Enhanced reading filtering system | **Effort: M** | **Value: Complex queries across reading metadata** | **Innovation: Advanced search with audiobook/status/year filters**

- [ ] **[MEDIUM] [FEATURE]** Reading progress indicators | **Effort: S** | **Value: Page/percentage completion in hover state** | **Innovation: Visual reading progress tracking**

## Low Priority (LOW)

_Nice-to-have features, minor optimizations, future-proofing_

### UI & Styling

- [ ] **[LOW] [FEATURE]** Smart image optimization pipeline | **Effort: S** | **Note: Cloudinary integration for asset management**

### Reading Features

- [ ] **[LOW] [FEATURE]** Advanced audiobook metadata | **Effort: M** | **Note: Narrator information, playback speed tracking**

- [ ] **[LOW] [FEATURE]** Batch reading operations | **Effort: M** | **Note: CLI commands for bulk reading management**

- [ ] **[LOW] [FEATURE]** Reading list performance optimization | **Effort: M** | **Note: Lazy loading for large reading collections**

- [ ] **[LOW] [FEATURE]** External platform integrations | **Effort: L** | **Note: Goodreads import, audiobook platform sync**

### Documentation & Monitoring

- [ ] **[LOW] [MAINTAIN]** Add comprehensive JSDoc coverage | **Effort: S** | **Note: 90%+ coverage for lib/ and utils/**

- [ ] **[LOW] [MAINTAIN]** Implement structured logging analytics | **Effort: S** | **Note: Log aggregation with error pattern search**

- [ ] **[LOW] [MAINTAIN]** Add visual regression testing for all components | **Effort: L** | **Note: Percy/Chromatic integration**

### Developer Experience

- [ ] **[LOW] [DX]** Quality metrics dashboard with trends | **Effort: L** | **Time saved: 2-4 hrs/week** | **Note: Real-time quality visibility**

### Cleanup

- [ ] **[LOW] [PERF]** Memoize components and implement virtual scrolling | **Effort: M** | **Note: 50% rendering time reduction for large lists**

## Quality Gates & Automation

_Dedicated enforcement mechanisms to maintain code quality_

### Pre-commit Hooks

- [ ] Enforce ESLint max-lines (400) and max-lines-per-function (50)
- [ ] Run incremental test coverage checks on modified code
- [ ] Validate JSDoc for exported functions
- [ ] Check for duplicate code patterns

### CI/CD Pipeline

- [ ] Block PRs below 36% coverage threshold (incremental to 85%)
- [ ] Automated security vulnerability scanning
- [ ] Performance budget enforcement (<100ms API responses)
- [ ] Visual regression testing for UI changes
- [ ] Dead code elimination analysis

### Monitoring & Alerts

- [ ] Error rate monitoring (<0.1% threshold)
- [ ] Performance degradation alerts
- [ ] Security header compliance checks
- [ ] Dependency update notifications

## Radical Simplification Options

_Gordian cuts that challenge fundamental assumptions - consider for v2.0_

- [x] **[GORDIAN] [COMPLETED]** ~~Eliminate database + admin → static JSON/Markdown files~~ | **✅ DONE in commit 08e6620**
- [ ] **[GORDIAN]** Delete interactive map feature entirely | **Impact: Remove leaflet dependencies, 521-line places data**
- [ ] **[GORDIAN]** Replace enterprise logging with dev-only console | **Impact: Remove Winston, correlation IDs, log rotation**
