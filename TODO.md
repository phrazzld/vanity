# TODO: The Craftsman Aesthetic Transformation

Transform Vanity from multi-page portfolio with safe defaults (Space Grotesk, Tailwind blue) into a focused one-pager digital business card with technical warmth (IBM Plex Mono, amber accents, asymmetric composition).

**Branch**: `feature/craftsman-redesign`
**Estimated Total**: 9-13 hours across 6 phases

---

## Phase 1: Typography Foundation (1.5-2 hours)

### Font Import & Configuration

- [x] Replace Space Grotesk with IBM Plex Mono in `src/app/fonts.ts`
  - Import `IBM_Plex_Mono` from `next/font/google`
  - Load weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
  - Configure: `subsets: ['latin']`, `display: 'swap'`, `variable: '--font-ibm-plex-mono'`
  - Export as `ibmPlexMono` constant
  - Success criteria: Font loads without console errors, variable available in CSS

- [ ] Update font variable in `src/app/layout.tsx`
  - Replace `${spaceGrotesk.variable}` with `${ibmPlexMono.variable}` in html className
  - Keep `${inter.variable}` unchanged (body copy)
  - Success criteria: Both font variables present in DOM, no hydration warnings

### Typography Styling

- [ ] Update heading font-family in `src/app/globals.css` (lines 142-149)
  - Change all `h1, h2, h3, h4, h5, h6` to use `font-family: var(--font-ibm-plex-mono), monospace`
  - Add `letter-spacing: -0.02em` to heading base styles (tighter tracking for monospace)
  - Success criteria: All headings render in IBM Plex Mono with tighter letter-spacing

- [ ] Add body text letter-spacing in `src/app/globals.css` (line 139)
  - Add `letter-spacing: 0.01em` to body style (breathing room for Inter)
  - Success criteria: Body text has subtle spacing increase, improved readability

- [ ] Update `.typewriter-container` font in `src/app/globals.css` (line 479)
  - Change to use IBM Plex Mono via `font-family: var(--font-ibm-plex-mono), monospace`
  - Success criteria: Typewriter quotes render in monospace, matches heading aesthetic

- [ ] Update Tailwind config font-family in `tailwind.config.ts` (lines 26-27)
  - Replace `'space-grotesk': ['var(--font-space-grotesk)', ...defaultTheme.fontFamily.sans]`
  - With `'ibm-plex-mono': ['var(--font-ibm-plex-mono)', ...defaultTheme.fontFamily.mono]`
  - Success criteria: Tailwind utility classes reference correct font variable

---

## Phase 2: Color System (1-1.5 hours)

### CSS Variable Color Tokens

- [ ] Replace blue primary with amber in `src/app/globals.css` light mode tokens (lines 33-43)
  - `--primary-50: #fffbeb` (amber-50)
  - `--primary-100: #fef3c7` (amber-100)
  - `--primary-200: #fde68a` (amber-200)
  - `--primary-300: #fcd34d` (amber-300)
  - `--primary-400: #fbbf24` (amber-400)
  - `--primary-500: #f59e0b` (amber-500)
  - `--primary-600: #d97706` (amber-600) ← Signal color
  - `--primary-700: #b45309` (amber-700)
  - `--primary-800: #92400e` (amber-800)
  - `--primary-900: #78350f` (amber-900)
  - Success criteria: All primary color references now amber gradient

- [ ] Update dark mode primary tokens in `src/app/globals.css` (lines 66-76)
  - Inverse the scale for dark mode (darker = higher number)
  - Keep amber hue, adjust lightness for dark backgrounds
  - Success criteria: Amber works in both light/dark mode with proper contrast

- [ ] Add section gradient token in `src/app/globals.css` dark mode (line 48)
  - Add new variable: `--section-gradient: linear-gradient(135deg, #111827 0%, #1f2937 100%);`
  - This provides subtle depth behind sections in dark mode
  - Success criteria: Gradient token available for section backgrounds

### Tailwind Palette Configuration

- [ ] Ensure amber palette complete in `tailwind.config.ts` (lines 31-123)
  - Verify amber color scale already exists (should be default Tailwind)
  - If missing, add full amber scale matching CSS variables
  - Success criteria: `bg-amber-600`, `text-amber-600` utilities work

- [ ] Add gradient utilities in `tailwind.config.ts`
  - Extend `backgroundImage` theme with custom gradients
  - Add `'section-dark': 'linear-gradient(135deg, #111827 0%, #1f2937 100%)'`
  - Success criteria: Can use `bg-gradient-section-dark` utility class

### Component Color Updates

- [ ] Update dark mode moon glow in `src/app/globals.css` (line 126)
  - Change `filter: drop-shadow(0 0 8px rgba(148, 163, 184, 0.4))` blue tint
  - To `filter: drop-shadow(0 0 8px rgba(217, 119, 6, 0.4))` amber tint (amber-600 with opacity)
  - Success criteria: Moon icon glows amber in dark mode

---

## Phase 3: Page Consolidation (2-3 hours)

### Delete Obsolete Route Directories

- [ ] Delete `src/app/readings/` directory and all contents
  - Remove `src/app/readings/page.tsx`
  - Remove any nested components/layouts
  - Success criteria: No readings route exists, build doesn't reference readings

- [ ] Delete `src/app/projects/` directory and all contents
  - Remove `src/app/projects/page.tsx`
  - Remove any nested components/layouts
  - Success criteria: No projects route exists, build doesn't reference projects

- [ ] Delete `src/app/map/` directory and all contents
  - Remove `src/app/map/page.tsx`
  - Remove `src/app/map/layout.tsx` if exists
  - Success criteria: No map route exists, build doesn't reference map

### Delete Obsolete Components

- [ ] Delete `src/app/components/MobileNav.tsx`
  - No navigation needed for one-pager
  - Success criteria: Component removed, no import errors

- [ ] Delete project components from `src/app/components/`
  - Remove `ProjectItem.tsx`
  - Remove `ProjectCard.tsx`
  - Success criteria: No project component files remain

- [ ] Delete readings component directory `src/app/components/readings/`
  - Remove entire directory with all reading components
  - Includes `ReadingCard.tsx`, `YearSection.tsx`, `ReadingsHeader.tsx`, etc.
  - Success criteria: No readings components remain

- [ ] Delete Map component `src/app/components/Map.tsx`
  - Remove map visualization component
  - Success criteria: Map component removed

### Update Header Component

- [ ] Simplify `src/app/components/Header.tsx` to remove navigation
  - Remove all `<nav>` navigation links (currently links to readings, projects, map)
  - Keep only site branding (if any) and DarkModeToggle
  - Update layout to simple flex container: logo (if present) + dark mode toggle
  - Success criteria: Header renders with only essential elements, no broken nav links

### Update Footer Component

- [ ] Simplify `src/app/components/Footer.tsx` to remove route links
  - Remove internal route links that no longer exist
  - Keep copyright/basic info
  - Consider adding external links here or wait for Phase 4 links section
  - Success criteria: Footer renders without broken internal links

---

## Phase 4: One-Pager Layout (2-3 hours)

### Section Utility Classes

- [ ] Add section utility classes to `src/app/globals.css` @layer components
  - `.section-hero`: min-height 100vh, flex column, justify-center, left-aligned (60% width desktop)
  - `.section-quotes`: centered, max-width 80%, generous padding (py-32)
  - `.section-about`: right-aligned (60% width desktop, ml-auto), padding-y
  - `.section-links`: left-aligned, padding-y, grid setup
  - Success criteria: Section utilities handle responsive layout, asymmetric positioning

### Hero Section

- [ ] Redesign hero in `src/app/page.tsx` (replace lines 3-21)
  - Create full-viewport hero section with `min-h-screen` flex column
  - Add `<h1 className="text-8xl md:text-9xl">phaedrus</h1>` (massive, IBM Plex Mono)
  - Add tagline `<p className="text-xl md:text-2xl mt-4">software engineer, general tinkerer</p>`
  - Wrap in container div: 60% width on desktop (`max-w-3xl`), left-side positioning
  - Add amber accent bar: `border-l-2 border-amber-600 pl-8` on container
  - Success criteria: Hero takes full viewport, massive name, left-aligned, amber accent visible

### TypewriterQuotes Section

- [ ] Wrap TypewriterQuotes in centered section in `src/app/page.tsx`
  - Remove inline styles (lines 9-15)
  - Wrap `<TypewriterQuotes />` in semantic `<section className="section-quotes">`
  - Apply center alignment with `mx-auto max-w-4xl`
  - Add generous vertical padding: `py-32` (128px top/bottom)
  - Success criteria: Quotes centered, generous breathing room, preserved functionality

### About/Bio Section

- [ ] Create About section in `src/app/page.tsx`
  - New `<section className="section-about">`
  - Add semantic bio content (2-3 sentences about you, your work, approach)
  - Right-align: `ml-auto max-w-3xl` (60% width desktop)
  - Include inline amber link to Misty Step: `<a className="text-amber-600 hover:text-amber-700">Misty Step</a>`
  - Success criteria: Bio right-aligned, amber link styled, clear identity statement

### External Links Section

- [ ] Create Links section in `src/app/page.tsx`
  - New `<section className="section-links">`
  - Grid layout: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
  - Left-aligned container: `max-w-3xl`
  - Create link components with structure:
    - Icon placeholder (can use simple SVG or emoji initially)
    - Label in IBM Plex Mono: `font-ibm-plex-mono`
    - Hover states: `hover:scale-105 transition-transform`
  - Links to include: Misty Step, readings service, GitHub, LinkedIn, email
  - Success criteria: Links grid responsive, monospace labels, amber hover accents

---

## Phase 5: Motion & Craft (1.5-2 hours)

### Spring Physics Timing

- [ ] Add spring timing function to `tailwind.config.ts` (line 200)
  - In `transitionTimingFunction` section, add: `'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)'`
  - This creates playful bounce effect on hover states
  - Success criteria: Spring timing available as utility class

### Link Animations

- [ ] Update link underline animation in `src/app/globals.css` (lines 294, 371)
  - Change `.content-link::after` and `.project-link::after` (if still exists)
  - Replace `ease-elegant-entrance` with `ease-spring`
  - Update background color from `bg-foreground` to `bg-amber-600`
  - Success criteria: Links have amber underline with spring bounce

### Staggered Section Entrance

- [ ] Implement IntersectionObserver for section fade-in in `src/app/page.tsx`
  - Add `useEffect` hook to observe all sections
  - Add `opacity-0 translate-y-4` initial state to sections
  - Add `transition-all duration-500` to sections
  - Stagger delays: hero (0ms), quotes (200ms), about (400ms), links (600ms)
  - On intersect: add `opacity-100 translate-y-0`
  - Success criteria: Sections fade in sequentially on scroll, respects `prefers-reduced-motion`

### Noise Texture Overlay

- [ ] Create noise SVG pattern in `public/noise.svg`
  - SVG with `<filter>` containing `<feTurbulence>` for organic noise
  - Pattern should be tileable, subtle grain texture
  - Dimensions: 200x200px for performance
  - Success criteria: SVG file exists, renders as subtle texture

- [ ] Apply noise texture to dark mode in `src/app/globals.css`
  - Add `.dark::before` pseudo-element with position fixed, inset-0
  - Background: `url('/noise.svg')` repeat
  - Opacity: 0.02 (very subtle, just visible texture)
  - Pointer-events: none (don't interfere with interactions)
  - Z-index: -1 (behind content)
  - Success criteria: Subtle grain visible in dark mode, doesn't affect performance

### Viewport Accent Bar

- [ ] Add active section indicator in `src/app/page.tsx`
  - Extend IntersectionObserver to track currently visible section
  - Add `border-l-2 border-amber-600` to active section
  - Animate border with `transition-colors duration-300`
  - Only one section has border at a time
  - Success criteria: Amber left border follows scroll position smoothly

---

## Phase 6: Cleanup & Polish (1-2 hours)

### Remove Unused Code

- [ ] Audit and remove unused CSS in `src/app/globals.css`
  - Remove `.project-*` classes (project-card, project-image-container, etc.) lines 343-423
  - Remove `.reading-card` styles if not used elsewhere
  - Remove `.nav-list` navigation styles (lines 241-266) if simplified header doesn't use them
  - Remove `.full-width-breakout` utility (lines 205-228) - unused
  - Success criteria: CSS file cleaned, no dead code, build size reduced

- [ ] Remove unused CLI commands (if removing content system entirely)
  - Check `cli/` directory for quote/reading commands
  - If quotes are staying but readings are removed, only remove reading CLI
  - Update `package.json` scripts if needed
  - Success criteria: No broken CLI commands, scripts reflect current features

- [ ] Remove unused API routes
  - Check `src/app/api/` for readings/projects routes
  - Delete any routes serving removed content
  - Success criteria: No dead API routes, cleaner route structure

### Accessibility Validation

- [ ] Test amber color contrast ratios
  - Verify amber-600 (#d97706) on white background meets WCAG AA (4.5:1 for text)
  - Verify amber-600 on gray-900 dark background meets WCAG AA
  - Adjust shade if needed (darker amber for light mode, lighter for dark mode)
  - Success criteria: All text/interactive elements meet WCAG AA minimum

- [ ] Test keyboard navigation on one-pager
  - Tab through all interactive elements (links, dark mode toggle)
  - Verify focus indicators visible on all focusable elements
  - Test with screen reader: announce sections, links, content hierarchy
  - Success criteria: Full keyboard access, clear focus states, logical tab order

- [ ] Test asymmetric layout accessibility
  - Verify content order makes sense when linearized (screen reader order)
  - Check mobile responsive behavior (asymmetry collapses to single column)
  - Test with zoom up to 200% (no content clipping or overlap)
  - Success criteria: Layout accessible at all viewport sizes, logical reading order

### Performance Validation

- [ ] Verify IBM Plex Mono font loading
  - Check Network tab: font loads with `display: swap` (no FOIT)
  - Verify no Cumulative Layout Shift (CLS) from font swap
  - Measure Web Vitals: LCP should stay under 2.5s
  - Success criteria: Fonts load efficiently, no layout shift, good CLS score

- [ ] Validate no layout thrashing
  - Check browser performance tab during scroll/interaction
  - Verify IntersectionObserver doesn't cause excessive reflows
  - Check noise texture doesn't impact frame rate
  - Success criteria: 60fps maintained during scroll, no performance warnings

- [ ] Verify Vercel Analytics still works
  - Check `<Analytics />` and `<SpeedInsights />` components still mounted in layout
  - Test page view tracking after deploy
  - Success criteria: Analytics functional, no console errors

### Dark Mode Refinement

- [ ] Test gradient background visual quality
  - View section gradient (`--section-gradient`) in dark mode
  - Verify subtle depth without being distracting
  - Check gradient transitions smoothly with theme toggle
  - Success criteria: Gradient visible, professional, adds depth without overwhelm

- [ ] Verify noise texture visibility
  - View dark mode noise overlay at various screen brightnesses
  - Should be just barely visible (2% opacity) - adds texture without noise
  - Test on different displays (retina vs standard)
  - Success criteria: Texture adds subtle craftsmanship feel, not distracting

- [ ] Check amber glow consistency
  - Moon icon in dark mode (DarkModeToggle)
  - Link hover states
  - Active section border
  - All should use consistent amber-600 color with appropriate opacity
  - Success criteria: Cohesive amber accent throughout, warm technical feel

---

## Post-Implementation

After all tasks complete:

- Run `npm run build` to verify production build succeeds
- Run `npm run typecheck` to verify no TypeScript errors
- Run `npm test` to verify existing tests still pass (update/remove tests for deleted features)
- Commit changes: `git add . && git commit -m "feat: transform to craftsman one-pager aesthetic"`
- Create PR: `gh pr create --title "feat: The Craftsman Aesthetic Transformation" --body "$(cat TODO.md)"`

---

**Ousterhout Strategic Programming Note**: This transformation prioritizes deep module improvement (complete aesthetic system overhaul) over tactical fixes (keeping scattered pages with minor tweaks). The one-pager consolidation reduces complexity, the typography/color changes create a cohesive design language (deep abstraction), and the craft details demonstrate strategic investment in user experience quality. Estimated 9-13 hours for comprehensive transformation rather than quick surface changes.
