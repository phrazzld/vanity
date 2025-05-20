# Responsive Design System

This document provides guidelines and references for implementing responsive design in the Vanity project using our custom Tailwind CSS configuration.

## Breakpoints

Our design system uses the following screen breakpoints:

| Breakpoint | Size (px) | Description         |
| ---------- | --------- | ------------------- |
| `xs`       | 480px     | Extra small devices |
| `sm`       | 640px     | Small devices       |
| `md`       | 768px     | Medium devices      |
| `lg`       | 1024px    | Large devices       |
| `xl`       | 1280px    | Extra large devices |
| `2xl`      | 1536px    | 2X large devices    |
| `3xl`      | 1920px    | 3X large devices    |

## Basic Responsive Usage

Use Tailwind's responsive utility classes with the breakpoint prefix:

```html
<!-- Element that is block on mobile, flex on md and up -->
<div class="block md:flex">...</div>

<!-- Font size that increases at different breakpoints -->
<h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl">...</h1>

<!-- Width that adapts to different screen sizes -->
<div class="w-full md:w-1/2 lg:w-1/3">...</div>
```

## Container Queries

Container queries allow you to style elements based on the size of a containing element rather than the viewport. This provides more flexible component-based responsive design.

### Usage

1. Apply the `@container` class to the parent element:

```html
<div class="@container">
  <!-- Content here responds to container width, not viewport -->
  <div class="@md:flex @md:gap-4 @sm:grid @sm:grid-cols-2">
    <!-- Content here -->
  </div>
</div>
```

Available container breakpoints mirror our standard breakpoints:

- `@xs`: 480px
- `@sm`: 640px
- `@md`: 768px
- `@lg`: 1024px
- `@xl`: 1280px
- `@2xl`: 1536px

## Custom Responsive Utilities

### Screen-Adapted Heights

```html
<!-- Uses the small viewport height for mobile-friendly layouts -->
<div class="h-screen-small">...</div>

<!-- Uses the large viewport height -->
<div class="h-screen-large">...</div>

<!-- Uses dynamic viewport height (adjusts for browser UI) -->
<div class="h-screen-dynamic">...</div>
```

### Responsive Typography

For optimal reading experience:

```html
<!-- Width that's ideal for reading text -->
<article class="w-readable">...</article>

<!-- Width optimized for prose content -->
<div class="w-prose">...</div>
```

### Aspect Ratio Utilities

Maintain consistent proportions across screen sizes:

```html
<!-- Portrait aspect ratio (2:3) -->
<div class="aspect-portrait">...</div>

<!-- Landscape aspect ratio (16:9) -->
<div class="aspect-landscape">...</div>

<!-- Square (1:1) -->
<div class="aspect-square">...</div>

<!-- Golden ratio (1.618:1) -->
<div class="aspect-golden">...</div>

<!-- Ultrawide ratio (21:9) -->
<div class="aspect-ultrawide">...</div>
```

## Z-Index Scale

Semantic z-index values for consistent stacking context:

| Name       | Value | Usage                                  |
| ---------- | ----- | -------------------------------------- |
| `behind`   | -1    | Elements positioned behind normal flow |
| `base`     | 0     | Default stacking context               |
| `elevated` | 1     | Slightly elevated elements             |
| `dropdown` | 10    | Dropdown menus                         |
| `sticky`   | 20    | Sticky headers/elements                |
| `fixed`    | 30    | Fixed position elements                |
| `modal`    | 40    | Modal dialogs                          |
| `popover`  | 50    | Popovers and tooltips                  |
| `tooltip`  | 60    | Tooltips                               |
| `toast`    | 70    | Toast notifications                    |
| `overlay`  | 80    | Full-screen overlays                   |
| `spinner`  | 90    | Loading spinners                       |
| `top`      | 100   | Highest level elements                 |

```html
<div class="z-dropdown">...</div>
<div class="z-modal">...</div>
```

## Accessibility and Screen Readers

Use Tailwind's built-in SR-only utilities:

```html
<!-- Visible only to screen readers -->
<span class="sr-only">This text is only for screen readers</span>

<!-- Visible to everyone except screen readers -->
<span aria-hidden="true">This is hidden from screen readers</span>

<!-- Interactive elements visible to screen readers when focused -->
<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>
```

## Responsive Patterns

### Card Grid

```html
<!-- Responsive card grid with different columns per breakpoint -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div class="card">...</div>
  <!-- More cards... -->
</div>
```

### Sidebar Layout

```html
<!-- Hidden on mobile, shown on larger screens -->
<div class="hidden lg:block lg:w-64">Sidebar content</div>

<!-- Sidebar with main content -->
<div class="flex flex-col lg:flex-row">
  <aside class="w-full lg:w-1/4 p-4">Sidebar</aside>
  <main class="w-full lg:w-3/4 p-4">Main content</main>
</div>
```

### Navigation

```html
<!-- Standard horizontal menu that becomes vertical on mobile -->
<nav>
  <ul class="flex flex-col sm:flex-row gap-4">
    <li>Home</li>
    <li>About</li>
    <li>Contact</li>
  </ul>
</nav>

<!-- Mobile hamburger menu that shows full on larger screens -->
<button class="block sm:hidden">Menu</button>
<nav class="hidden sm:block">
  <!-- Navigation items -->
</nav>
```

## Best Practices

1. **Mobile-First Approach**: Start with the mobile design and progressively enhance for larger screens.

2. **Fluid Typography**: Use relative units (rem) and responsive sizes for a more adaptive design.

3. **Logical Properties**: When possible, use logical properties (`inset-start` instead of `left`) for better internationalization support.

4. **Test Across Devices**: Regularly test on different devices and screen sizes.

5. **Use Container Queries**: When components need to adapt based on their container rather than the viewport.

6. **Performance**: Be mindful of performance, especially on mobile. Use responsive images and optimize assets.

7. **Touch Targets**: Ensure touch targets are at least 44x44px for mobile users.

8. **Content Prioritization**: On smaller screens, prioritize the most important content and hide secondary elements.
