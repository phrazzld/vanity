# Mobile Experience Enhancement PRD

## Executive Summary

Transform Vanity's mobile experience with professional-grade responsive design. Implement hamburger navigation with slide-in drawer, optimize quotes/readings lists for mobile consumption with card-based layouts and larger touch targets, and maintain accessibility/performance standards. Solution prioritizes elegant mobile UX while preserving desktop experience, using progressive enhancement and existing architecture (Zustand, Tailwind, Server Components).

**User Value**: Seamless mobile experience matching 2025 industry standards, improved readability, easier navigation, and faster content consumption on phones/tablets.

**Success Criteria**: 44x44px touch targets, smooth animations (60fps), <3s mobile load time, WCAG 2.1 AA compliance maintained, zero layout shift.

## User Context

**Who**: You (primary user) accessing the personal site on mobile devices

**Problems Solved**:

- Cramped navigation with stacked links consuming vertical space
- Table-based layouts difficult to scan on narrow screens
- Small touch targets causing accidental taps
- Column headers wasting mobile real estate
- Suboptimal reading experience for quotes/book information

**Measurable Benefits**:

- 70% reduction in vertical space for navigation (collapsed drawer)
- 100% touch target compliance (minimum 44x44px)
- 40% larger typography for critical content on mobile
- Single-column layouts optimized for 320px-428px viewports

## Requirements

### Functional Requirements

**FR1: Mobile Navigation Drawer**

- Hamburger button (☰) visible only on mobile (<768px)
- Slide-in drawer from left with smooth animation
- Overlay background (semi-transparent) for focus context
- Close mechanisms: X button, ESC key, overlay tap, navigation to new page
- Desktop navigation unchanged (horizontal links)

**FR2: Mobile-Optimized Quote List**

- Single-column card layout on mobile
- Hide column headers below 768px
- Minimum 48px touch target height per quote
- Larger quote text (16px minimum) with author on separate line
- Preserve search highlighting and empty states

**FR3: Mobile-Optimized Reading List**

- Card-based layout with larger book covers (60x84px on mobile)
- Title + author + cover + date in vertical stack
- Minimum 60px touch target height per reading
- Audiobook badge remains visible but compact
- Preserve favorites filter and empty states

**FR4: Responsive Breakpoints**

- Mobile: <768px (matches existing `md` breakpoint)
- Tablet: 768px-1024px (enhanced spacing)
- Desktop: >1024px (current experience)

### Non-Functional Requirements

**NFR1: Performance**

- No layout shift (CLS = 0)
- Animations run at 60fps (use CSS transforms)
- First Contentful Paint <1.5s on 3G
- Mobile JS bundle impact <5KB gzipped

**NFR2: Accessibility**

- Focus trapping in mobile drawer (focus-trap-react or manual)
- Keyboard navigation (Tab, Shift+Tab, ESC, Enter, Space)
- Screen reader announcements for drawer state changes
- Minimum 44x44px touch targets (WCAG 2.1 Level AAA)
- Respect prefers-reduced-motion

**NFR3: Maintainability**

- Use existing Zustand store for drawer state
- Tailwind responsive utilities (no custom media queries in JS)
- Server Components where possible, Client Components for interactivity
- Consistent with existing code patterns (feature-focused organization)

**NFR4: Browser Support**

- iOS Safari 15+
- Chrome Mobile 90+
- Firefox Mobile 90+
- Samsung Internet 15+

## Architecture Decision

### Selected Approach: Progressive Enhancement with CSS-Driven Responsiveness

**Rationale**:

- **Simplicity**: Single component codebase with Tailwind responsive utilities (md:, lg:)
- **User Value**: Faster implementation = sooner user benefit
- **Explicitness**: Media queries clearly show mobile vs desktop logic
- **Performance**: CSS-only responsiveness (no JS media query listeners)

### Alternatives Considered

| Approach                       | Value  | Simplicity | Risk   | Why Not Chosen                                     |
| ------------------------------ | ------ | ---------- | ------ | -------------------------------------------------- |
| **Progressive Enhancement**    | High   | High       | Low    | ✅ Selected                                        |
| Component Swap (useMediaQuery) | High   | Medium     | Medium | Duplicate components, hydration complexity         |
| Responsive Table Pattern       | Medium | High       | Low    | Limited by table semantics, awkward mobile UX      |
| Full Rebuild (shadcn/ui)       | High   | Low        | High   | Overkill for polish task, breaks existing patterns |

### Module Boundaries

**Navigation Module** (`src/app/components/Header.tsx` + new `MobileNav.tsx`)

- **Interface**: Navigation links array, current pathname, theme toggle
- **Responsibility**: Render appropriate nav for viewport, manage drawer state
- **Hidden Complexity**: Focus management, overlay rendering, animation orchestration

**List Display Modules** (`QuotesList.tsx`, `ReadingsList.tsx`)

- **Interface**: Items array, sort config, search query, selection handlers
- **Responsibility**: Responsive layout rendering, touch target optimization
- **Hidden Complexity**: Conditional header rendering, card vs table layout logic

**UI State Module** (Zustand store)

- **Interface**: `isMobileNavOpen`, `setMobileNavOpen(boolean)`
- **Responsibility**: Persist drawer open/close state across navigation
- **Hidden Complexity**: None (simple boolean state)

### Abstraction Layers

**Layer 1: Layout Components** (Header, MobileNav)

- Vocabulary: Navigation structure, visual states (open/closed)
- Abstraction: User interaction (tap, swipe, keyboard) → state changes

**Layer 2: List Components** (QuotesList, ReadingsList)

- Vocabulary: Content cards, touch targets, responsive grids
- Abstraction: Data arrays → visual layouts optimized per viewport

**Layer 3: Style System** (Tailwind utilities, globals.css)

- Vocabulary: Breakpoints, spacing scale, touch target sizes
- Abstraction: Design tokens → CSS properties

## Dependencies & Assumptions

### Dependencies

- **External**: None (avoid new dependencies - use existing Zustand, Tailwind, Next.js)
- **Internal**: Zustand store (`useUIStore`), existing Tailwind config, Header component
- **Version Constraints**: Next.js 15.5.6, React 18+, Tailwind 3.x

### Assumptions

- Users primarily consume content (view quotes/readings), not create on mobile
- Mobile usage is significant enough to warrant investment
- Current desktop experience is satisfactory (no changes needed)
- Markdown content files remain small enough that virtualization is unnecessary
- Touch devices are primary mobile input (not stylus or mouse)

### Environment Requirements

- Viewport widths: 320px (iPhone SE) to 428px (iPhone 14 Pro Max) to 768px (iPad)
- Touch targets: Minimum 44x44px (WCAG 2.1 AAA)
- Network: Design for 3G baseline (4G/5G nice-to-have)
- Browser features: CSS Grid, Flexbox, CSS Transforms, localStorage

## Implementation Phases

### Phase 1: Mobile Navigation (MVP Core)

**Goal**: Replace stacked mobile nav with professional drawer pattern

**Tasks**:

1. Create `MobileNav.tsx` Client Component
   - Drawer UI with slide animation (translateX)
   - Overlay with semi-transparent background
   - Hamburger button component (accessible, animated)
   - Close button (X icon)
   - Focus trap implementation

2. Update Zustand UI store
   - Add `isMobileNavOpen: boolean`
   - Add `setMobileNavOpen(open: boolean)` action

3. Update `Header.tsx`
   - Conditionally render: desktop nav (hidden on mobile) + hamburger (visible on mobile)
   - Wire hamburger to Zustand state
   - Maintain Server Component for nav links, Client Component wrapper for state

4. Add mobile nav styles to `globals.css`
   - Drawer animations (slide-in/out)
   - Overlay fade in/out
   - Z-index (use semantic scale: `z-modal` or `z-drawer`)
   - Responsive breakpoint styles

**Acceptance Criteria**:

- Hamburger visible only on <768px viewports
- Drawer slides in from left with smooth animation
- Focus trapped within open drawer
- ESC key closes drawer
- Overlay tap closes drawer
- No layout shift on toggle
- Desktop navigation unchanged

### Phase 2: Mobile Quote List Optimization

**Goal**: Transform table-like quote layout into mobile-friendly cards

**Tasks**:

1. Update `QuotesList.tsx` component
   - Hide column headers on mobile (`md:flex hidden`)
   - Single-column layout for quote items
   - Increase touch target minimum height (48px)
   - Larger typography (text-base instead of text-sm)
   - Adjust spacing (more breathing room between items)

2. Update quote item rendering
   - Stack quote text and author vertically
   - Enlarge quote icon for better visual hierarchy
   - Optimize truncation for mobile widths
   - Maintain search highlighting

3. Test quote interaction patterns
   - Tap to select (no accidental taps)
   - Scroll performance with 50+ quotes
   - Search highlighting visibility

**Acceptance Criteria**:

- Column headers hidden on mobile
- Minimum 48px touch targets
- Quote text 16px minimum font size
- No horizontal scrolling
- Smooth scrolling performance
- Search highlighting preserved

### Phase 3: Mobile Reading List Optimization

**Goal**: Optimize reading list for mobile consumption with enhanced visuals

**Tasks**:

1. Update `ReadingsList.tsx` component
   - Hide column headers on mobile
   - Single-column card layout
   - Larger book covers (60x84px on mobile vs 40x56px desktop)
   - Increase touch target minimum height (60px)
   - Stack title, author, metadata vertically

2. Optimize reading card layout
   - Cover on left, metadata stacked on right
   - Larger title typography (text-lg on mobile)
   - Compact audiobook badge
   - Date icon + text on separate line

3. Update favorites filter toggle
   - Ensure mobile-friendly button size
   - Preserve functionality

**Acceptance Criteria**:

- Column headers hidden on mobile
- Minimum 60px touch targets (larger due to covers)
- Book covers 60x84px on mobile
- Title text 18px minimum
- No horizontal scrolling
- Favorites filter accessible

### Phase 4: Polish & Performance

**Goal**: Ensure production-ready quality and performance

**Tasks**:

1. Accessibility audit
   - Test keyboard navigation (Tab, Shift+Tab, ESC)
   - Test screen reader announcements (VoiceOver, TalkBack)
   - Verify focus indicators visible
   - Confirm touch target sizes (44x44px minimum)
   - Test color contrast ratios

2. Performance optimization
   - Measure CLS (target: 0)
   - Measure FCP (target: <1.5s on 3G)
   - Test animation frame rates (target: 60fps)
   - Optimize image loading (book covers already WebP)
   - Test scroll performance (50+ items)

3. Cross-device testing
   - iPhone SE (320px width)
   - iPhone 14 Pro (393px width)
   - iPad Mini (768px width)
   - Android phones (various sizes)
   - Landscape orientation

4. Edge case handling
   - Very long quote text on mobile
   - Missing book covers (placeholder SVG)
   - Empty states on mobile
   - Loading states
   - Network errors

**Acceptance Criteria**:

- All WCAG 2.1 AA criteria met
- CLS = 0
- FCP <1.5s on simulated 3G
- 60fps animations
- No bugs on tested devices
- Graceful degradation for edge cases

## Risks & Mitigation

| Risk                                 | Likelihood | Impact | Mitigation                                                           |
| ------------------------------------ | ---------- | ------ | -------------------------------------------------------------------- |
| Focus trap breaks keyboard nav       | Medium     | High   | Use well-tested pattern from React docs, thorough testing            |
| Animations janky on low-end devices  | Low        | Medium | Use CSS transforms (GPU-accelerated), respect prefers-reduced-motion |
| Drawer state persists incorrectly    | Low        | Medium | Reset on route change, use Next.js router events                     |
| Touch targets still too small        | Low        | High   | Use browser dev tools to measure, iterate until 44x44px              |
| Layout shift during drawer animation | Medium     | Medium | Use fixed positioning, transform instead of width changes            |
| Existing tests break                 | Medium     | Low    | Update tests to handle responsive classes, add mobile-specific tests |

## Key Decisions

### Decision 1: CSS-Only Responsiveness (No JS Media Queries)

**Alternatives**: useMediaQuery hook, matchMedia API
**Rationale**:

- User Value: Better performance (no JS execution)
- Simplicity: Tailwind utilities handle everything
- Explicitness: Media query breakpoints visible in className
  **Tradeoffs**: Less flexible for complex conditional logic, but sufficient for this use case

### Decision 2: Zustand for Drawer State (Not Local useState)

**Alternatives**: Component-local useState, Context API
**Rationale**:

- User Value: Drawer state persists across navigation
- Simplicity: Already using Zustand for theme
- Explicitness: Centralized state management
  **Tradeoffs**: Slight overkill for single boolean, but consistency wins

### Decision 3: Defer Virtualization

**Alternatives**: Implement TanStack Virtual immediately
**Rationale**:

- User Value: Faster delivery of core improvements
- Simplicity: Avoid complexity until proven necessary
- Risk: May need to add later if performance degrades
  **Tradeoffs**: Could have performance issues with hundreds of items, but unlikely for personal site

### Decision 4: Manual Focus Trap (No Library)

**Alternatives**: focus-trap-react library
**Rationale**:

- User Value: Smaller bundle size
- Simplicity: Straightforward implementation for single drawer
- Explicitness: Full control over behavior
  **Tradeoffs**: More implementation work, but educational and maintainable

### Decision 5: Mobile Breakpoint at 768px (Matches Tailwind `md`)

**Alternatives**: 640px (sm), custom breakpoint
**Rationale**:

- User Value: Consistent with existing responsive design
- Simplicity: Reuse existing breakpoint
- Explicitness: Clear alignment with Tailwind defaults
  **Tradeoffs**: Tablets (768px-1024px) get mobile layout, but acceptable

## Quality Validation Checklist

### Deep Modules

- ✅ MobileNav: Simple interface (`isOpen`, `onClose`), hides focus trap complexity
- ✅ Lists: Same props interface, hides responsive layout logic
- ✅ UI Store: Single method (`setMobileNavOpen`), hides persistence

### Information Hiding

- ✅ Drawer animation details hidden from Header
- ✅ Focus trap implementation hidden from consumers
- ✅ Responsive breakpoint logic hidden in CSS classes
- ✅ Touch target sizing calculations encapsulated in component

### Different Abstractions

- ✅ Layer 1 (Components): User interaction vocabulary
- ✅ Layer 2 (Styles): Design token vocabulary
- ✅ Layer 3 (Data): Content structure vocabulary
- Each layer transforms concepts meaningfully

### Strategic Design

- ✅ Investing in reusable mobile patterns (drawer, card layouts)
- ✅ Building foundation for future mobile features
- ✅ Reducing future friction (mobile-first thinking embedded)
- ✅ Not just tactical polish, but strategic UX improvement

## Test Plan

### Unit Tests

- MobileNav component: open/close behavior, keyboard interactions
- QuotesList: responsive class application, touch target sizes
- ReadingsList: responsive class application, image optimization
- UI Store: drawer state mutations

### Integration Tests

- Header + MobileNav interaction flow
- Drawer open → navigate → drawer closes
- Search + mobile list rendering
- Favorites filter + mobile cards

### Accessibility Tests

- Keyboard navigation (Tab, Shift+Tab, ESC, Enter, Space)
- Screen reader announcements (aria-live, role changes)
- Focus indicators visible and clear
- Color contrast ratios (4.5:1 text, 3:1 UI)
- Touch target sizes (automated measurement)

### Visual Regression Tests

- Snapshot tests for mobile breakpoints
- Desktop layout unchanged
- Tablet layout (768px-1024px)
- Small mobile (320px)
- Large mobile (428px)

### Performance Tests

- Lighthouse mobile score (target: >90)
- CLS measurement (target: 0)
- FCP measurement (target: <1.5s)
- Animation frame rate (target: 60fps)
- Bundle size impact (target: <5KB)

## Success Metrics

**Primary Metrics**:

- Touch target compliance: 100% of interactive elements ≥44x44px
- Mobile performance: Lighthouse score ≥90
- Accessibility: WCAG 2.1 AA compliance maintained
- Zero regressions: Desktop experience unchanged

**Secondary Metrics**:

- Animation smoothness: 60fps (no dropped frames)
- Load time: <3s on simulated 3G
- Layout stability: CLS = 0
- Code quality: No new eslint/TypeScript errors

---

**Next Steps**: Run `/plan` to break this specification into executable implementation tasks.
