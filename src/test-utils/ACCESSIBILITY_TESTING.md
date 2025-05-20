# Accessibility Testing with axe-core

This document explains how to use the axe-core integration in our testing framework to check components for accessibility violations.

## Overview

We use [axe-core](https://github.com/dequelabs/axe-core) via the [jest-axe](https://github.com/nickcolley/jest-axe) library to automatically test our components for accessibility issues during unit testing. This helps catch issues early in the development process.

## Getting Started

To test a component for accessibility issues, you can use one of the provided utility functions in `@/test-utils/a11y-helpers.tsx`:

### Basic Usage

```tsx
import { checkA11y } from '@/test-utils/a11y-helpers';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('has no accessibility violations', async () => {
    await checkA11y(<MyComponent />);
  });
});
```

### Testing in Both Light and Dark Themes

```tsx
import { checkA11yInBothThemes } from '@/test-utils/a11y-helpers';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('has no accessibility violations in both themes', async () => {
    await checkA11yInBothThemes(<MyComponent />);
  });
});
```

### Testing at Different Viewport Sizes

```tsx
import { checkResponsiveA11y } from '@/test-utils/a11y-helpers';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('has no accessibility violations across viewport sizes', async () => {
    await checkResponsiveA11y(<MyComponent />);
  });
});
```

## Customizing Tests

You can customize the axe-core configuration to focus on specific rules or to ignore others:

```tsx
import { checkA11y, a11yRules } from '@/test-utils/a11y-helpers';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('passes specific accessibility checks', async () => {
    await checkA11y(<MyComponent />, {
      axeOptions: {
        rules: {
          'color-contrast': { enabled: true },
          'button-name': { enabled: true },
          // Disable rules that aren't relevant for this component
          'document-title': { enabled: false },
        },
      },
      // Set to true to see detailed violation information
      verbose: true,
    });
  });

  // Or use predefined rule sets
  it('passes form-specific accessibility checks', async () => {
    await checkA11y(<MyFormComponent />, { axeOptions: a11yRules.forms });
  });
});
```

## Predefined Rule Sets

We provide several predefined rule sets for common testing scenarios:

- `a11yRules.basic`: Common rules suitable for most components
- `a11yRules.forms`: Rules focused on forms and input elements
- `a11yRules.navigation`: Rules for navigation and landmark elements

## Understanding Test Failures

When a test fails, jest-axe provides detailed information about the violations, including:

- The specific rule that was violated
- The impact level (minor, moderate, serious, critical)
- The HTML element(s) that caused the violation
- Suggestions for fixing the issue

Example failure output:

```
Expected the HTML found at the beginning of the test to have no violations:

Found 1 accessibility violation:

1. Elements must have sufficient color contrast (color-contrast, serious)

Check these nodes:
- div.low-contrast-text (html > body > div > div.low-contrast-text)

You can find more information on this issue here:
https://dequeuniversity.com/rules/axe/4.6/color-contrast
```

## Common Accessibility Issues and Fixes

### Missing Alternative Text for Images

```tsx
// ❌ Bad
<img src="logo.png" />

// ✅ Good
<img src="logo.png" alt="Company Logo" />

// For decorative images:
<img src="decoration.png" alt="" aria-hidden="true" />
```

### Insufficient Color Contrast

Ensure text has sufficient contrast against its background according to WCAG guidelines:

- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.

### Missing Form Labels

```tsx
// ❌ Bad
<input type="text" placeholder="Enter name" />

// ✅ Good
<label htmlFor="name">Name</label>
<input id="name" type="text" placeholder="Enter name" />

// Or using aria-label
<input type="text" aria-label="Name" placeholder="Enter name" />
```

### Interactive Elements Without Accessible Names

```tsx
// ❌ Bad
<button><svg viewBox="0 0 24 24">...</svg></button>

// ✅ Good
<button aria-label="Close menu">
  <svg viewBox="0 0 24 24" aria-hidden="true">...</svg>
</button>
```

## Resources

- [Deque University WCAG Compliance](https://dequeuniversity.com/rules/axe/4.6)
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Web Docs: ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
