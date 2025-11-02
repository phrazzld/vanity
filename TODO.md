# TODO: Mobile Experience Enhancement

## Context

- **Approach**: Progressive enhancement with CSS-driven responsiveness
- **Key Files**: Header.tsx, QuotesList.tsx, ReadingsList.tsx, ui.ts (Zustand store), globals.css
- **Patterns**: Follow DarkModeToggle.tsx for Client Components, useFocusTrap hook for accessibility, existing test patterns (snapshot + a11y)
- **Existing Assets**: Focus trap utilities in `src/utils/keyboard/trap.ts`, Zustand store in `src/store/ui.ts`, responsive breakpoints in `tailwind.config.ts`

## Implementation Tasks

### Phase 1: Mobile Navigation Infrastructure

- [ ] Add mobile nav state to Zustand store

  ```
  Files: src/store/ui.ts:44-46, src/store/__tests__/ui.test.ts
  Approach: Add isMobileNavOpen (boolean) alongside existing sidebar state (line 178-181)
  Pattern: Follow isSidebarOpen pattern - add state + open/close/toggle actions
  Success: Store exposes isMobileNavOpen, openMobileNav(), closeMobileNav(), toggleMobileNav()
  Test: Unit test state mutations, verify no localStorage persistence for nav state
  Module: UIState manages all transient navigation state, hides implementation
  Time: 20min
  ```

- [ ] Create MobileNav drawer component

  ```
  Files: src/app/components/MobileNav.tsx (new), src/app/components/__tests__/MobileNav.test.tsx (new)
  Approach: Client Component using useFocusTrap hook, similar to DarkModeToggle pattern
  Pattern: Follow DarkModeToggle.tsx structure - memo wrapper, ref management, accessibility
  Interface: Props { isOpen: boolean, onClose: () => void, navLinks: Array<{href, label}> }
  Implementation:
    - Drawer: Fixed position, translateX animation, z-modal layer
    - Overlay: Semi-transparent bg, onClick closes drawer
    - Focus trap: useFocusTrap with onEscape callback
    - Close button: Accessible X icon with aria-label
    - Auto-close: On route navigation (usePathname effect)
  Success: Drawer slides in/out smoothly, focus trapped, ESC/overlay/X closes it
  Test: Unit tests for open/close, keyboard navigation, snapshot tests
  Module: Hides focus trap complexity, animation orchestration, event handling
  Time: 1.5hr
  ```

- [ ] Create HamburgerButton component

  ```
  Files: src/app/components/HamburgerButton.tsx (new), src/app/components/__tests__/HamburgerButton.test.tsx (new)
  Approach: Animated hamburger icon with accessibility (like DarkModeToggle button pattern)
  Interface: Props { isOpen: boolean, onClick: () => void, className?: string }
  Implementation:
    - Three-line SVG icon that animates to X when open
    - aria-label, aria-expanded attributes
    - Minimum 44x44px touch target
    - Smooth animation (transform-based, GPU-accelerated)
  Success: Icon toggles smoothly, accessible, correct touch target size
  Test: Snapshot tests for open/closed states, a11y tests for attributes
  Module: Single responsibility (visual toggle state), simple interface
  Time: 30min
  ```

- [ ] Update Header component for mobile nav

  ```
  Files: src/app/components/Header.tsx:1-49, src/app/components/__tests__/Header.test.tsx (new)
  Approach: Conditional rendering - desktop nav hidden on mobile, HamburgerButton shown
  Pattern: Use Tailwind responsive classes (hidden md:flex, flex md:hidden)
  Implementation:
    - Import MobileNav, HamburgerButton, useUIStore
    - Desktop nav: Wrap in <div className="hidden md:flex">
    - Mobile: Add HamburgerButton + MobileNav components
    - Wire to Zustand: isMobileNavOpen, toggleMobileNav
    - Maintain Server Component wrapper where possible
  Success: Desktop unchanged, mobile shows hamburger, drawer works, no layout shift
  Test: Snapshot tests for both viewports, integration test for state flow
  Module: Header orchestrates nav variants, hides viewport detection logic
  Time: 45min
  ```

- [ ] Add mobile nav styles to globals.css
  ```
  Files: src/app/globals.css:457-end
  Approach: Add drawer animation utilities, z-index semantic values
  Pattern: Follow existing animation patterns (iconSwitch, fadeIn)
  Implementation:
    - @keyframes slideInLeft (translateX(-100%) to 0)
    - @keyframes slideOutLeft (0 to translateX(-100%))
    - @keyframes fadeIn/fadeOut for overlay
    - .mobile-nav-drawer class (positioning, transforms)
    - .mobile-nav-overlay class (backdrop, z-index)
    - Respect prefers-reduced-motion
  Success: Smooth 60fps animations, no jank, reduced motion support
  Test: Manual testing on dev server, Lighthouse performance check
  Module: Style system hides animation implementation, exposes class interface
  Time: 30min
  ```

### Phase 2: Mobile Quote List Optimization

- [ ] Optimize QuotesList for mobile layout

  ```
  Files: src/app/components/quotes/QuotesList.tsx:163-173,203-272
  Approach: Hide headers, adjust grid, increase touch targets with responsive classes
  Pattern: Use Tailwind responsive utilities (hidden md:flex, text-sm md:text-base)
  Implementation:
    - Column headers: Add `hidden md:flex` to line 164 wrapper
    - Quote items: Remove grid, use single column layout on mobile
    - Touch targets: Increase min-height to 48px (py-3 md:py-2)
    - Typography: text-base on mobile, keep text-sm on desktop
    - Icon size: h-5 w-5 on mobile (was h-4 w-4)
    - Spacing: Increase gap between items (space-y-2 md:space-y-1)
  Success: Headers hidden <768px, readable text, 48px+ touch targets, no horizontal scroll
  Test: Update existing tests for responsive classes, add mobile viewport snapshots
  Module: Same interface, hides responsive layout complexity
  Time: 45min
  ```

- [ ] Add mobile-specific quote card styles
  ```
  Files: src/app/globals.css:429-437
  Approach: Add responsive utilities for quote display on mobile
  Pattern: Follow existing .quote-text-display pattern
  Implementation:
    - .quote-card-mobile class for enhanced mobile cards
    - Larger padding, better visual hierarchy
    - Enhanced focus states for touch
    - Subtle shadow on mobile for card separation
  Success: Visually distinct cards on mobile, improved readability
  Test: Visual regression snapshots at 375px, 428px viewports
  Module: Style tokens for mobile quote cards
  Time: 20min
  ```

### Phase 3: Mobile Reading List Optimization

- [ ] Optimize ReadingsList for mobile layout

  ```
  Files: src/app/components/readings/ReadingsList.tsx:187-255,284-409
  Approach: Similar to QuotesList - hide headers, single column, larger targets
  Pattern: Responsive Tailwind classes, maintain existing functionality
  Implementation:
    - Column headers (lines 187-254): Add `hidden md:flex` wrapper
    - Grid: Single column on mobile (remove grid-cols-12 constraint)
    - Book covers: Larger on mobile - h-20 w-14 md:h-14 md:w-10 (60x84 vs 40x56)
    - Touch targets: min-h-[60px] on list items
    - Title typography: text-lg md:text-sm
    - Author typography: text-base md:text-xs
    - Metadata: Stack vertically on mobile with more spacing
    - Audiobook badge: Smaller on mobile (text-2xs md:text-xs)
  Success: Headers hidden <768px, larger covers, 60px+ targets, improved hierarchy
  Test: Update ReadingsList.test.tsx, add mobile snapshots, verify image sizes
  Module: Interface unchanged, responsive complexity hidden
  Time: 1hr
  ```

- [ ] Optimize ReadingsFilterToggle for mobile
  ```
  Files: src/app/components/readings/ReadingsFilterToggle.tsx
  Approach: Ensure button meets touch target requirements
  Implementation:
    - Verify/enforce minimum 44x44px button size
    - Add responsive padding if needed (p-2 md:p-1.5)
    - Test touch interaction on mobile viewports
  Success: Button easily tappable on mobile, no accidental activations
  Test: Manual testing, touch target measurement
  Module: Self-contained filter UI
  Time: 15min
  ```

### Phase 4: Testing & Polish

- [ ] Create comprehensive mobile navigation tests

  ```
  Files: src/app/components/__tests__/MobileNav.a11y.test.tsx (new)
  Approach: Follow existing a11y test patterns (DarkModeToggle.a11y.test.tsx)
  Pattern: Use test-utils/a11y-helpers.tsx utilities
  Implementation:
    - Focus trap behavior (Tab, Shift+Tab cycling)
    - ESC key closes drawer
    - Overlay click closes drawer
    - Proper ARIA attributes (aria-modal, role="dialog")
    - Focus return after close
    - Screen reader announcements
  Success: All a11y tests pass, no jest-axe violations
  Test: Run with npm test, verify 100% coverage for a11y paths
  Module: Test module validates accessibility contract
  Time: 45min
  ```

- [ ] Add mobile viewport snapshot tests

  ```
  Files: src/app/components/__tests__/MobileNav.snapshot.test.tsx (new)
  Files: src/app/components/quotes/__tests__/QuotesList.test.tsx (update)
  Files: src/app/components/readings/__tests__/ReadingsList.test.tsx (update)
  Approach: Follow DarkModeToggle.snapshot.test.tsx pattern
  Pattern: Use createComponentSnapshot with viewport options
  Implementation:
    - MobileNav: Open/closed states, overlay visible/hidden
    - QuotesList: 375px viewport (iPhone SE), 768px (tablet)
    - ReadingsList: 375px viewport, verify image sizes
    - HamburgerButton: Open/closed animation states
  Success: Snapshots capture all responsive states, UPDATE_SNAPSHOTS=true works
  Test: npm run test:snapshot passes
  Module: Visual regression safety net
  Time: 30min
  ```

- [ ] Performance validation and optimization

  ```
  Files: n/a (testing task)
  Approach: Use Chrome DevTools, Lighthouse mobile audit
  Implementation:
    - Run Lighthouse mobile audit (target: score >90)
    - Measure CLS (target: 0)
    - Measure animation FPS (target: 60fps)
    - Test on throttled 3G network
    - Verify no layout shift when drawer opens/closes
    - Check bundle size impact (target: <5KB for new code)
  Success: Lighthouse >90, CLS=0, smooth animations, fast load
  Test: Document results in performance-results.md
  Module: Validation of performance requirements
  Time: 45min
  ```

- [ ] Cross-device manual testing

  ```
  Files: n/a (testing task)
  Approach: Test on real devices and browser DevTools
  Implementation:
    - iPhone SE (320px): Nav, quotes, readings all usable
    - iPhone 14 Pro (393px): Optimal layout, no cramping
    - iPad Mini (768px): Breakpoint transition works correctly
    - Android Chrome: Touch targets work, animations smooth
    - Landscape orientation: No layout breaks
    - Dark mode: All mobile components themed correctly
    - Safari iOS: Focus trap works, animations smooth
  Success: No critical bugs, acceptable UX on all tested devices
  Test: Document issues in TESTING.md, create follow-up issues for edge cases
  Module: Real-world validation
  Time: 1hr
  ```

- [ ] Update documentation
  ```
  Files: docs/RESPONSIVE_DESIGN.md:172-190, CLAUDE.md:12-25
  Approach: Document new mobile navigation pattern and responsive conventions
  Implementation:
    - Add "Mobile Navigation Pattern" section to RESPONSIVE_DESIGN.md
    - Document drawer, hamburger, focus trap usage
    - Add examples for mobile-optimized list patterns
    - Update CLAUDE.md with mobile development guidance
  Success: Engineers can implement similar patterns without questions
  Test: Review clarity with fresh eyes, ensure examples are runnable
  Module: Knowledge capture for future development
  Time: 30min
  ```

## Acceptance Criteria

**Phase 1 Complete When**:

- [ ] Hamburger menu visible only <768px viewports
- [ ] Drawer slides in/out smoothly (60fps)
- [ ] Focus trapped in open drawer (Tab/Shift+Tab cycle)
- [ ] ESC key, overlay click, X button all close drawer
- [ ] Desktop navigation completely unchanged
- [ ] No layout shift when toggling drawer
- [ ] All tests pass (unit, snapshot, a11y)

**Phase 2 Complete When**:

- [ ] Quote column headers hidden <768px
- [ ] Quote text minimum 16px font size on mobile
- [ ] Minimum 48px touch targets per quote
- [ ] No horizontal scrolling on narrow viewports (320px)
- [ ] Search highlighting preserved on mobile
- [ ] All QuotesList tests updated and passing

**Phase 3 Complete When**:

- [ ] Reading column headers hidden <768px
- [ ] Book covers 60x84px on mobile (larger than desktop)
- [ ] Title text minimum 18px on mobile
- [ ] Minimum 60px touch targets per reading
- [ ] Favorites filter button ≥44x44px
- [ ] All ReadingsList tests updated and passing

**Phase 4 Complete When**:

- [ ] Lighthouse mobile score ≥90
- [ ] CLS = 0 (no layout shift)
- [ ] All animations 60fps (no dropped frames)
- [ ] Zero jest-axe violations
- [ ] Manual testing completed on 5+ devices/viewports
- [ ] Documentation updated with mobile patterns

## Design Iteration

**After Phase 1**:

- Review mobile nav state management - is Zustand overkill for boolean?
- Evaluate drawer animation smoothness - any jank on low-end devices?
- Check if focus trap needs refinement based on testing

**After Phase 3**:

- Review touch target sizes across all components
- Identify any remaining mobile UX friction
- Consider if virtualization needed based on scroll performance

**Post-Launch**:

- Monitor for user feedback on mobile experience
- Plan follow-up: gesture support (swipe to close drawer)?
- Consider mobile-specific features (pull-to-refresh, infinite scroll)

## Automation Opportunities

- Create script to measure touch target sizes automatically
- Add Lighthouse CI integration for mobile performance regression prevention
- Generate responsive screenshot matrix (multiple viewports × light/dark themes)
- Automate bundle size tracking for mobile-specific code

## Notes

**Module Boundaries**:

- **MobileNav**: Owns drawer UI, focus management, close behavior (hides trap complexity)
- **HamburgerButton**: Owns icon animation, touch target (simple visual component)
- **Header**: Orchestrates nav variants (hides viewport detection)
- **List Components**: Own responsive layouts (hide grid→card logic)
- **UI Store**: Owns all transient UI state (mobile nav, sidebar, modals)

**Value Formula Applied**:

- MobileNav: High functionality (drawer + trap + animations) - Simple interface (isOpen, onClose) = High value ✅
- HamburgerButton: Medium functionality (animated icon) - Simple interface (isOpen, onClick) = Medium value ✅
- Lists: High functionality (responsive layouts + all existing features) - Same interface = High value ✅

**Parallel Execution**:

- Phase 1 tasks are mostly sequential (store → components → integration)
- Phase 2 and 3 can be done in parallel (quotes and readings independent)
- Phase 4 tests can be parallelized across different test types

**Risk Mitigation**:

- Focus trap: Using existing proven utility (src/utils/keyboard/trap.ts)
- Animations: CSS transforms (GPU-accelerated), reduced motion support
- Layout shift: Fixed positioning, transform-only animations
- Testing: Following established patterns (snapshot + a11y + integration)
