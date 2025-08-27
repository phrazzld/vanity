- [x] navbar should have the same width as page content
- [x] fonts should be redone, esp on readings page (headings are meh all around, fonts and overall design)
- [x] we should have a very simple, clean, fullwidth footer that links to email and github

---

# Enhanced Specification

## Research Findings

### Industry Best Practices

- **Navbar alignment**: Max-width container pattern (`max-w-7xl mx-auto`) is the 2025 standard for content-navbar alignment
- **Typography trends**: 18px base font size for reading-focused sites, 1.5x line height, maximum 70ch line length
- **Sticky footer pattern**: Flexbox with `min-h-screen` and `mt-auto` for reliable sticky positioning
- **Font loading**: Next.js `next/font` with variable fonts provides zero layout shift and optimal performance

### Technology Analysis

- **Existing setup**: Next.js 15.3.4 with Tailwind CSS 3.4.1 already provides all necessary capabilities
- **Typography enhancement**: @tailwindcss/typography plugin (8kb) offers prose classes for better reading experience
- **Font system**: Current Inter + Space Grotesk combination is solid, needs weight and size adjustments
- **No new dependencies required** for navbar and footer improvements

### Codebase Integration

- **Navbar pattern exists** at `src/app/layout.tsx:14-44` but lacks container wrapper
- **Typography system** established at `src/app/globals.css:136-159` with comprehensive scale
- **Design tokens** fully implemented with CSS variables for consistent theming
- **No footer exists**, clear opportunity for implementation

## Detailed Requirements

### Functional Requirements

- **REQ-001**: Navbar inner content must align exactly with page content width (max-w-7xl)
  - Acceptance: Pixel-perfect alignment between navbar items and page content edges
  - Full-width background color preserved for visual continuity
- **REQ-002**: Typography hierarchy on readings page must be visually distinct and readable
  - Acceptance: "Currently Reading", "2025", "2024" headers are prominent and well-styled
  - Clear visual hierarchy between section headers, book titles, and metadata
- **REQ-003**: Sticky footer with email and GitHub links
  - Acceptance: Footer always visible at bottom of viewport or after content (whichever is lower)
  - Links are accessible, properly styled, and open in appropriate targets
- **REQ-004**: Remove email/GitHub links from home page after footer implementation
  - Acceptance: No duplicate links between home page content and footer

### Non-Functional Requirements

- **Performance**: Bundle size increase < 10kb total
- **Accessibility**: WCAG AAA for typography (7:1 contrast ratio)
- **Responsive**: Consistent behavior across all breakpoints
- **Dark mode**: Full compatibility with existing theme system

## Architecture Decisions

### ADR-001: Container Alignment Strategy

**Decision**: Use consistent max-width wrapper pattern

**Options considered**:

1. Container queries with dynamic sizing
2. Fixed pixel widths
3. **Max-width with auto margins** ✓

**Rationale**:

- Zero performance overhead (pure CSS)
- Guaranteed pixel alignment
- Industry standard pattern
- Already partially implemented in codebase

### ADR-002: Typography Enhancement Approach

**Decision**: Adjust existing font system rather than replace

**Options considered**:

1. Add serif font for body text
2. Replace entire font stack
3. **Enhance current Inter + Space Grotesk** ✓

**Rationale**:

- Maintains design consistency
- Minimal bundle impact
- Inter variable font provides weight flexibility
- Space Grotesk excellent for headings

### ADR-003: Footer Implementation Pattern

**Decision**: Flexbox sticky footer with semantic HTML

**Options considered**:

1. CSS Grid with template areas
2. **Flexbox with min-height and auto margins** ✓
3. Position fixed footer

**Rationale**:

- Most reliable cross-browser support
- Semantic and accessible
- Works with existing layout structure
- No JavaScript required

## Implementation Strategy

### Development Approach

Sequential implementation with immediate visual validation

### MVP Definition

1. **Phase 1**: Navbar width alignment (15 minutes)
   - Add container wrapper to Header component
   - Verify alignment with page content
2. **Phase 2**: Typography improvements (30 minutes)
   - Enhance YearSection heading styles
   - Adjust reading page header hierarchy
   - Optional: Add @tailwindcss/typography for prose content
3. **Phase 3**: Footer implementation (20 minutes)
   - Create Footer component with sticky positioning
   - Add email and GitHub links
   - Remove duplicate links from home page

### Technical Implementation Details

#### 1. Navbar Container Fix

```tsx
// src/app/layout.tsx
<header className="site-header bg-white dark:bg-gray-900 border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <nav className="flex items-center justify-between py-8">{/* existing nav content */}</nav>
  </div>
</header>
```

#### 2. Typography Enhancements

```css
/* Enhance YearSection headers */
.year-section-header {
  @apply text-2xl md:text-3xl font-space-grotesk font-bold 
         tracking-tight text-gray-900 dark:text-gray-100
         border-b-2 border-gray-200 dark:border-gray-700
         py-4 mb-6;
}

/* Status headers (Currently Reading, etc.) */
.status-header {
  @apply text-xl md:text-2xl font-space-grotesk font-semibold
         uppercase tracking-wide text-gray-700 dark:text-gray-300
         mb-4;
}
```

#### 3. Sticky Footer Component

```tsx
// src/app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center gap-8">
          <a href="mailto:your-email" className="footer-link">
            Email
          </a>
          <a href="https://github.com/phrazzld" className="footer-link">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

// Update layout.tsx to include min-height
<body className="min-h-screen flex flex-col">
  <Header />
  <main className="flex-grow">{children}</main>
  <Footer />
</body>;
```

## Testing Strategy

### Visual Regression Testing

- Screenshot comparisons before/after changes
- Verify alignment at multiple breakpoints (mobile, tablet, desktop)
- Dark mode visual validation

### Accessibility Testing

- Keyboard navigation through footer links
- Screen reader announcement verification
- Color contrast validation (use Chrome DevTools)

### Cross-browser Testing

- Chrome, Safari, Firefox on desktop
- iOS Safari, Chrome on mobile
- Verify sticky footer behavior

## Deployment Considerations

### Build Verification

```bash
npm run build
npm run lint
```

### Bundle Size Check

- Baseline: Current bundle size
- Target: < 10kb increase
- Measure: Use `npm run build` output

## Success Criteria

### Acceptance Criteria

- [ ] Navbar content aligns pixel-perfect with page content at all breakpoints
- [ ] Reading page headers are visually prominent and well-hierarchized
- [ ] Footer sticks to viewport bottom when content is short
- [ ] Footer appears after content when content is long
- [ ] Email and GitHub links in footer are functional and accessible
- [ ] Home page no longer contains duplicate email/GitHub links
- [ ] Dark mode maintains full visual consistency
- [ ] Bundle size increase < 10kb

### Performance Metrics

- Lighthouse score maintained at 95+
- No layout shift from typography changes
- Zero JavaScript required for layout features

### User Experience Goals

- Improved visual hierarchy on readings page
- Consistent layout alignment across all pages
- Persistent access to contact links via footer

## Future Enhancements

### Post-MVP Features

- Animate footer link hover states
- Add copyright notice with dynamic year
- Implement breadcrumb navigation
- Enhanced mobile navigation menu

### Scalability Roadmap

- Component library for consistent patterns
- Advanced typography system with fluid scaling
- Internationalization support
- Performance monitoring dashboard
