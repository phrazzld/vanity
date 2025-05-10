# Accessibility Guidelines for Vanity Project

This document outlines accessibility guidelines and best practices for the Vanity project, including how to use the ESLint jsx-a11y plugin to ensure our components meet accessibility standards.

## Overview

Web accessibility ensures that people with disabilities can use our web application. This includes users who are:

- Visually impaired (blind, low vision, or color-blind)
- Hearing impaired
- Motor impaired
- Cognitively impaired

Proper accessibility not only helps these users but also improves usability for everyone and helps with SEO.

## ESLint jsx-a11y Plugin

We've integrated the [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) to automatically check for accessibility issues in our React components. This plugin enforces accessibility best practices and helps developers identify and fix accessibility issues during development.

### Configured Rules

The following jsx-a11y rules have been configured in our ESLint setup:

#### Critical Rules (Error Level)

- `jsx-a11y/alt-text`: Ensures images have alt text
- `jsx-a11y/anchor-has-content`: Ensures anchors have content
- `jsx-a11y/anchor-is-valid`: Ensures anchors have valid href attributes
- `jsx-a11y/aria-props`: Ensures ARIA properties are valid
- `jsx-a11y/aria-proptypes`: Ensures ARIA property values are valid
- `jsx-a11y/aria-role`: Ensures ARIA roles are valid
- `jsx-a11y/aria-unsupported-elements`: Ensures elements don't have unsupported ARIA attributes
- `jsx-a11y/heading-has-content`: Ensures headings have content
- `jsx-a11y/html-has-lang`: Ensures HTML elements have a lang attribute
- `jsx-a11y/img-redundant-alt`: Prevents redundant alt text (like "image of" or "picture of")
- `jsx-a11y/interactive-supports-focus`: Ensures interactive elements can be focused
- `jsx-a11y/label-has-associated-control`: Ensures labels are associated with form controls
- `jsx-a11y/no-access-key`: Prevents the use of accessKey
- `jsx-a11y/no-noninteractive-tabindex`: Prevents tabindex on non-interactive elements
- `jsx-a11y/no-redundant-roles`: Prevents redundant roles (like `role="list"` on a `<ul>`)
- `jsx-a11y/role-has-required-aria-props`: Ensures elements with ARIA roles have required props
- `jsx-a11y/role-supports-aria-props`: Ensures elements with ARIA roles have supported props

#### Warning Level Rules

- `jsx-a11y/mouse-events-have-key-events`: Ensures mouse events have corresponding keyboard events
- `jsx-a11y/no-autofocus`: Warns about using autofocus
- `jsx-a11y/no-noninteractive-element-interactions`: Warns about interactive handlers on non-interactive elements
- `jsx-a11y/tabindex-no-positive`: Warns about positive tabindex values

## Common Accessibility Issues and Solutions

### 1. Non-interactive Elements with Click Handlers

**Issue**: Adding click handlers to non-interactive elements (like `<div>`, `<li>`) without keyboard support.

**Solution**:

- Add keyboard event handlers (onKeyDown)
- Add appropriate tabIndex and ARIA attributes
- Or, use an appropriate interactive element (button, a, etc.)

**Example**:

```jsx
// Instead of:
<li onClick={handleClick}>Item</li>

// Do:
<li
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
      e.preventDefault();
    }
  }}
  tabIndex={0}
  role="button"
>
  Item
</li>

// Or even better, when appropriate:
<button>Item</button>
```

### 2. Redundant ARIA Roles

**Issue**: Adding redundant roles to elements that already have implicit roles.

**Solution**: Remove redundant roles and use proper semantic HTML.

**Example**:

```jsx
// Instead of:
<ul role="list">
  <li role="listitem">Item</li>
</ul>

// Do:
<ul>
  <li>Item</li>
</ul>
```

### 3. Empty Links or Invalid href

**Issue**: Links with empty or "#" href values.

**Solution**:

- Provide valid URLs
- If it's a button, use `<button>` instead
- If it's a router link, use the appropriate Next.js Link component

**Example**:

```jsx
// Instead of:
<a href="#">Click me</a>

// Do:
<button className="link-styled">Click me</button>

// Or when linking to a page:
<Link href="/about">About us</Link>
```

### 4. Images Without Alt Text

**Issue**: Images missing alt attributes for screen readers.

**Solution**: Add descriptive alt text to all images.

**Example**:

```jsx
// Instead of:
<img src="/book-cover.jpg" />

// Do:
<img src="/book-cover.jpg" alt="Book cover of War and Peace by Leo Tolstoy" />

// For decorative images:
<img src="/decorative-line.jpg" alt="" aria-hidden="true" />
```

## Testing Accessibility

Besides using the ESLint plugin, it's recommended to:

1. Use keyboard navigation to test your components
2. Test with a screen reader (VoiceOver on macOS, NVDA on Windows)
3. Check color contrast ratios
4. Include accessibility testing in your manual QA process

## Resources

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [eslint-plugin-jsx-a11y documentation](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [Accessible Rich Internet Applications (ARIA)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [React accessibility docs](https://reactjs.org/docs/accessibility.html)
- [Next.js accessibility docs](https://nextjs.org/docs/accessibility)

## Future Improvements

- Add automated accessibility testing using tools like Axe
- Consider implementing an accessibility statement
- Conduct regular accessibility audits
- Add user testing with individuals who use assistive technologies
