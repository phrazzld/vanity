# Snapshot Testing Patterns

This document provides guidelines and patterns for using Jest snapshot testing in the Vanity project. Snapshot testing allows us to quickly verify that components render consistently without manually writing detailed assertions.

## Table of Contents

1. [Snapshot Testing Philosophy](#snapshot-testing-philosophy)
2. [When to Use Snapshot Testing](#when-to-use-snapshot-testing)
3. [When to Avoid Snapshot Testing](#when-to-avoid-snapshot-testing)
4. [Best Practices](#best-practices)
5. [Available Utilities](#available-utilities)
6. [Examples](#examples)
   - [Basic Component Snapshot](#basic-component-snapshot)
   - [Responsive Component Snapshot](#responsive-component-snapshot)
   - [Theme Variant Snapshots](#theme-variant-snapshots)
   - [Interactive Component Snapshots](#interactive-component-snapshots)

## Snapshot Testing Philosophy

Snapshot testing is a complementary approach to traditional assertion-based testing. It focuses on preventing **unexpected UI changes** rather than verifying specific behavior.

Our approach to snapshot testing follows these principles:

1. **Focused snapshots**: Create small, specific snapshots of individual components rather than entire page layouts
2. **Selective usage**: Use snapshot testing primarily for stable, presentational components
3. **Responsive awareness**: Test components across multiple viewport sizes when relevant
4. **Theme integration**: Test both light and dark mode renderings when applicable
5. **Readability first**: Use the provided utilities to create human-readable snapshots

## When to Use Snapshot Testing

Snapshot testing is most valuable in these scenarios:

- **UI Components**: Stateless or presentational components with consistent rendering
- **Component Variations**: Testing different states or variants of a component
- **Theme Consistency**: Ensuring components adapt correctly to theme changes
- **Responsive Design**: Verifying component behavior across different viewport sizes
- **Regression Testing**: Ensuring UI doesn't change unexpectedly between commits

## When to Avoid Snapshot Testing

Avoid snapshot testing in these scenarios:

- **Highly Interactive Components**: Complex UI with many user interactions
- **Dynamic Content**: Components with frequently changing or random content
- **Implementation Details**: Testing internal component logic or state
- **Entire Pages**: Large component trees that would produce unwieldy snapshots
- **Rapidly Evolving Components**: Components under active development

## Best Practices

### 1. Keep Snapshots Small and Focused

Test specific component states rather than entire pages:

```tsx
// Good: Focused snapshot
it('renders button in disabled state', () => {
  const { cleanHtml } = createComponentSnapshot(<Button disabled>Disabled</Button>);
  expect(cleanHtml).toMatchSnapshot();
});

// Bad: Too broad
it('renders entire page', () => {
  const { container } = renderWithTheme(<HomePage />);
  expect(container).toMatchSnapshot();
});
```

### 2. Use Descriptive Test Names

Name your tests clearly to explain what aspect of the component is being verified:

```tsx
// Good: Descriptive test names
it('renders with primary styling when variant="primary"', () => {
  // ...
});

it('renders with icon when showIcon is true', () => {
  // ...
});

// Bad: Vague test names
it('renders correctly', () => {
  // ...
});

it('has the right styles', () => {
  // ...
});
```

### 3. Review Snapshots During Code Review

When reviewing PRs, always inspect snapshots to:

- Ensure expected changes match the component updates
- Identify unexpected changes that might indicate regressions
- Verify snapshots are readable and focused

### 4. Update Snapshots Intentionally

Only update snapshots when you've verified the changes are intended:

```bash
# Update specific test snapshots
npm test -- -u -t "ComponentName"

# Using our custom env variable
UPDATE_SNAPSHOTS=true npm test -- -t "ComponentName"
```

### 5. Include Multiple Variants

Test different component states when applicable:

```tsx
it('renders in all button variants', () => {
  const variants = ['primary', 'secondary', 'tertiary', 'danger'];

  variants.forEach(variant => {
    const { cleanHtml } = createComponentSnapshot(<Button variant={variant}>Button</Button>);
    expect(cleanHtml).toMatchSnapshot(`Button ${variant} variant`);
  });
});
```

## Available Utilities

Our test-utils module provides several utilities to streamline snapshot testing:

### 1. createComponentSnapshot

Creates a clean, readable snapshot of a component:

```tsx
const { cleanHtml } = createComponentSnapshot(<Component />);
expect(cleanHtml).toMatchSnapshot();
```

### 2. createResponsiveSnapshots

Creates snapshots for multiple viewport sizes:

```tsx
const responsiveSnapshots = createResponsiveSnapshots(<ResponsiveComponent />, [
  'mobile',
  'tablet',
  'desktop',
]);
expect(responsiveSnapshots).toMatchSnapshot();
```

### 3. Custom Jest Matchers

- `toMatchComponentSnapshot`: Compares a rendered component to a clean HTML string
- `toMatchResponsiveSnapshots`: Compares responsive renderings across multiple viewports
- `toMatchThemeSnapshots`: Verifies that a component renders differently in light and dark mode

## Examples

### Basic Component Snapshot

```tsx
import { createComponentSnapshot } from '@/test-utils';
import Card from '../Card';

describe('Card Component', () => {
  it('renders basic card correctly', () => {
    const { cleanHtml } = createComponentSnapshot(
      <Card title="Card Title">
        <p>Card content</p>
      </Card>
    );

    // Snapshot assertion
    expect(cleanHtml).toMatchSnapshot();
  });

  it('renders card with different emphasis levels', () => {
    const emphasisLevels = ['low', 'medium', 'high'];

    emphasisLevels.forEach(level => {
      const { cleanHtml } = createComponentSnapshot(
        <Card title="Card Title" emphasis={level}>
          <p>Card content</p>
        </Card>
      );

      // Using a named snapshot
      expect(cleanHtml).toMatchSnapshot(`Card with ${level} emphasis`);
    });
  });
});
```

### Responsive Component Snapshot

```tsx
import { createResponsiveSnapshots } from '@/test-utils';
import ResponsiveLayout from '../ResponsiveLayout';

describe('ResponsiveLayout', () => {
  it('adapts correctly to different viewport sizes', () => {
    const responsiveSnapshots = createResponsiveSnapshots(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    expect(responsiveSnapshots).toMatchSnapshot();
  });

  it('changes layout on mobile vs desktop', () => {
    const mobileSnapshot = createResponsiveSnapshots(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>,
      ['mobile'] // Only test mobile
    );

    const desktopSnapshot = createResponsiveSnapshots(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>,
      ['desktop'] // Only test desktop
    );

    // Verify mobile and desktop are different
    expect(mobileSnapshot.mobile).not.toBe(desktopSnapshot.desktop);

    // Snapshot individual sizes
    expect(mobileSnapshot).toMatchSnapshot('mobile layout');
    expect(desktopSnapshot).toMatchSnapshot('desktop layout');
  });
});
```

### Theme Variant Snapshots

```tsx
import { createComponentSnapshot } from '@/test-utils';
import ThemeAwareButton from '../ThemeAwareButton';

describe('ThemeAwareButton', () => {
  it('renders differently in light and dark mode', () => {
    const lightRender = createComponentSnapshot(<ThemeAwareButton>Click Me</ThemeAwareButton>, {
      themeMode: 'light',
    });

    const darkRender = createComponentSnapshot(<ThemeAwareButton>Click Me</ThemeAwareButton>, {
      themeMode: 'dark',
    });

    // Using our custom matcher to verify theme differentiation
    expect(lightRender).toMatchThemeSnapshots(darkRender);

    // Also snapshot each theme
    expect(lightRender.cleanHtml).toMatchSnapshot('light mode button');
    expect(darkRender.cleanHtml).toMatchSnapshot('dark mode button');
  });
});
```

### Interactive Component Snapshots

```tsx
import { createComponentSnapshot, renderWithTheme, screen, setupUser } from '@/test-utils';
import Accordion from '../Accordion';

describe('Accordion', () => {
  it('renders in collapsed state by default', () => {
    const { cleanHtml } = createComponentSnapshot(
      <Accordion title="Accordion Title">
        <p>Accordion content</p>
      </Accordion>
    );

    expect(cleanHtml).toMatchSnapshot('collapsed accordion');
  });

  it('renders expanded state after user interaction', async () => {
    const user = setupUser();

    // Render the component
    renderWithTheme(
      <Accordion title="Accordion Title">
        <p>Accordion content</p>
      </Accordion>
    );

    // Interact to expand
    await user.click(screen.getByRole('button', { name: /accordion title/i }));

    // Create snapshot after interaction
    const { cleanHtml } = createComponentSnapshot(
      <Accordion title="Accordion Title" defaultExpanded>
        <p>Accordion content</p>
      </Accordion>
    );

    expect(cleanHtml).toMatchSnapshot('expanded accordion');
  });
});
```

## Maintenance

Regularly review and clean up snapshots to ensure they remain valuable:

1. **Remove obsolete snapshots**: Delete snapshots for removed components
2. **Keep snapshots focused**: Refactor broad snapshots into more specific ones
3. **Review during code updates**: When modifying components, verify snapshot changes
4. **Update documentation**: Keep this guide updated with evolving best practices

By following these guidelines, snapshot testing will provide a valuable layer of regression testing without becoming a maintenance burden.
