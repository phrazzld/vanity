# Storybook Usage Guidelines

This document provides comprehensive guidance for using Storybook in the Vanity project. It covers everything from basic concepts to advanced patterns and best practices.

## Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Project Configuration](#project-configuration)
4. [Creating Component Stories](#creating-component-stories)
5. [Documentation Standards](#documentation-standards)
6. [Testing with Storybook](#testing-with-storybook)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Dark Mode Support](#dark-mode-support)
9. [Advanced Patterns](#advanced-patterns)
10. [Workflow Integration](#workflow-integration)
11. [Troubleshooting](#troubleshooting)

## Introduction

Storybook is a development environment for UI components that enables you to:

- Develop components in isolation without worrying about application logic
- View and interact with different states of your components
- Automatically document your component API from TypeScript types
- Test components for visual, functional, and accessibility issues
- Share and collaborate on component development with your team

In the Vanity project, Storybook serves as both a development tool and a living documentation source for our component library.

## Getting Started

### Running Storybook

```bash
npm run storybook
```

This starts the Storybook development server at [http://localhost:6006](http://localhost:6006).

### Building a Static Version

```bash
npm run build-storybook
```

This builds a static version of Storybook for deployment.

### Testing Storybook

```bash
npm run test-storybook
```

Runs tests for your Storybook stories.

## Project Configuration

The Storybook configuration for the Vanity project includes:

### Core Configuration Files

- **`.storybook/main.ts`**: Defines story discovery patterns, addons, and framework settings
- **`.storybook/preview.ts`**: Global parameters, decorators, and theming
- **`.storybook/ThemeDecorator.tsx`**: Integration with the app's theme system

### Installed Addons

| Addon                           | Purpose                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `@storybook/addon-essentials`   | Core functionality bundle (docs, controls, actions, etc.) |
| `@storybook/addon-a11y`         | Accessibility testing and reporting                       |
| `@storybook/addon-links`        | Story linking and navigation                              |
| `@storybook/addon-interactions` | Interaction testing                                       |
| `@storybook/addon-viewport`     | Responsive design testing                                 |
| `storybook-dark-mode`           | Dark mode toggle and theme integration                    |

### TypeScript Integration

Storybook is configured with enhanced TypeScript support:

```typescript
// From .storybook/main.ts
typescript: {
  check: true,
  reactDocgen: 'react-docgen-typescript',
  reactDocgenTypescriptOptions: {
    shouldExtractLiteralValuesFromEnum: true,
    propFilter: prop => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
  },
}
```

This configuration enables:

- TypeScript error checking
- Automated prop documentation from TypeScript types
- Proper handling of enum values in controls

## Creating Component Stories

### Basic Story Structure

For each component, create a `.stories.ts` or `.stories.tsx` file in the same directory:

```typescript
// Component.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import Component from './Component';

const meta = {
  title: 'Category/Component',
  component: Component,
  parameters: {
    /* Global story parameters */
  },
  args: {
    /* Default props */
  },
  argTypes: {
    /* Control definitions */
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    /* Props for this variant */
  },
};

export const AnotherVariant: Story = {
  args: {
    /* Props for another variant */
  },
};
```

### Important Story Fields

| Field        | Description                     | Example                                                        |
| ------------ | ------------------------------- | -------------------------------------------------------------- |
| `title`      | Navigation path in Storybook UI | `'Components/Inputs/SearchBar'`                                |
| `component`  | Component reference             | `SearchBar`                                                    |
| `parameters` | Global config for all stories   | `{ layout: 'centered' }`                                       |
| `args`       | Default props for all stories   | `{ variant: 'primary' }`                                       |
| `argTypes`   | Controls configuration          | `{ size: { control: 'select', options: ['sm', 'md', 'lg'] } }` |
| `tags`       | Special flags for stories       | `['autodocs']`                                                 |

### Story Naming Conventions

Follow these conventions for story naming:

1. Use PascalCase for story exports: `export const Primary: Story = {...}`
2. Use descriptive names that reflect the state or variant
3. For dark mode variants, append "DarkMode" to the name: `export const PrimaryDarkMode: Story = {...}`
4. Group related stories together in the file

### Story Organization

Organize stories in a logical progression:

1. Start with the simplest usage (`Default`)
2. Show variants (e.g., `Primary`, `Secondary`)
3. Add state-based stories (`Disabled`, `Loading`, `Error`)
4. Include interaction examples (`WithHover`, `WithFocus`)
5. Showcase responsive behavior (`Mobile`, `Desktop`)
6. Include dark mode variants as needed

### Creating Complex Story Examples

For complex component demonstrations:

```typescript
// For TypeScript files (.ts)
export const ComplexExample: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-4' },
      React.createElement(Component, { prop1: 'value1' }),
      React.createElement(Component, { prop2: 'value2' })
    );
  },
};

// For TSX files (.tsx)
export const ComplexExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Component prop1="value1" />
      <Component prop2="value2" />
    </div>
  ),
};
```

## Documentation Standards

### Component Documentation

Add comprehensive documentation to your component stories:

```typescript
const meta = {
  // ...
  parameters: {
    docs: {
      description: {
        component: `
# ComponentName

A brief description of what this component does.

## Features
- Feature 1
- Feature 2

## Usage Examples
\`\`\`tsx
<Component prop="value" />
\`\`\`

## Accessibility Considerations
- Keyboard support details
- Screen reader behavior
`,
      },
    },
  },
};
```

### Prop Documentation

Use JSDoc comments in your TypeScript interfaces to generate prop documentation:

```typescript
export interface ButtonProps {
  /** The content to display inside the button */
  children: React.ReactNode;

  /** The variant style to apply to the button */
  variant?: 'primary' | 'secondary' | 'text';

  /** Whether the button is disabled */
  disabled?: boolean;

  /** Callback fired when the button is clicked */
  onClick?: () => void;
}
```

### Control Documentation

Configure controls with helpful descriptions:

```typescript
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'text'],
    description: 'The visual style of the button',
    table: {
      defaultValue: { summary: 'primary' },
      type: { summary: 'string' },
    },
  },
}
```

## Testing with Storybook

### Testing Approaches

Storybook supports multiple testing methods:

1. **Visual Testing**: Manual review in the Storybook UI
2. **Interaction Testing**: Using the interactions addon for user flows
3. **Accessibility Testing**: Using the a11y addon
4. **Automated Testing**: Using the test-storybook runner

### Interaction Testing

Test interactive behavior in your stories:

```typescript
export const WithInteractions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Simulate user interaction
    await userEvent.click(button);

    // Verify the result
    await expect(canvas.getByText('Clicked!')).toBeInTheDocument();
  },
};
```

### Visual Testing Best Practices

1. Create stories for all significant visual states
2. Test both light and dark modes
3. Use the viewport addon to test responsive behavior
4. Include edge cases (very long text, empty states, error states)

## Accessibility Guidelines

### Using the Accessibility Addon

The a11y addon helps identify accessibility issues:

1. Open your component in Storybook
2. Navigate to the "Accessibility" tab
3. Address all violations before considering a component complete

### Common Accessibility Patterns

```tsx
// Accessible button with icon
<button aria-label="Close menu">
  <svg aria-hidden="true">...</svg>
</button>

// Form control with explicit label
<div>
  <label htmlFor="name">Name</label>
  <input id="name" type="text" />
</div>

// Image with alt text
<img src="logo.png" alt="Company Logo" />
```

## Dark Mode Support

### Using Dark Mode in Stories

Create dark mode variants of your stories:

```typescript
// Light mode story
export const Default: Story = {
  args: {
    // component props
  },
};

// Dark mode variant
export const DefaultDarkMode: Story = {
  args: {
    // Same props as the Default story
  },
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};
```

### Theme Context Integration

Components that use the ThemeContext will automatically work in Storybook thanks to the ThemeDecorator:

```typescript
// In your component
const { isDarkMode } = useTheme();

// This will reflect Storybook's dark mode toggle state
```

### Styling for Dark Mode

Use Tailwind's dark mode classes in your components:

```tsx
<div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
  Dark mode compatible content
</div>
```

## Advanced Patterns

### Using Decorators

Decorators allow you to wrap stories with additional context:

```typescript
// Component-level decorator
const meta = {
  // ...
  decorators: [
    (Story) => (
      <div className="custom-wrapper">
        <Story />
      </div>
    ),
  ],
};

// Story-level decorator
export const WithDecorator: Story = {
  decorators: [
    (Story) => (
      <div className="story-specific-wrapper">
        <Story />
      </div>
    ),
  ],
};
```

### Dynamic Stories

Create dynamically generated stories:

```typescript
// Generate stories for multiple variants
const variants = ['small', 'medium', 'large'];

// Create a story for each variant
const sizeStories = variants.reduce(
  (acc, size) => {
    acc[`Size${size.charAt(0).toUpperCase() + size.slice(1)}`] = {
      args: { size },
    };
    return acc;
  },
  {} as Record<string, StoryObj<typeof Component>>
);

// Export all size stories
Object.entries(sizeStories).forEach(([name, story]) => {
  exports[name] = story;
});
```

### Complex Compositions

For complex component compositions:

```typescript
export const ComplexComposition: Story = {
  render: () =>
    React.createElement(
      'div',
      { className: 'composition-container' },
      React.createElement(Header, { title: 'Page Title' }),
      React.createElement(
        'div',
        { className: 'content-area' },
        React.createElement(Sidebar, { items: ['Item 1', 'Item 2'] }),
        React.createElement(MainContent, { children: 'Main content here' })
      ),
      React.createElement(Footer)
    ),
};
```

## Workflow Integration

### Storybook-First Development

Consider using a Storybook-first development workflow:

1. Define component requirements and API
2. Create a story with expected props and variants
3. Implement the component to match the story
4. Add more stories for edge cases and states
5. Integrate the component into the application

### CI/CD Integration

Integrate Storybook into your CI/CD pipeline:

1. Build Storybook as part of CI checks
2. Run accessibility tests using test-storybook
3. Consider deploying Storybook with each version for stakeholder review
4. Run visual regression tests to detect unintended changes

## Troubleshooting

### Common Issues

| Issue                  | Solution                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| TypeScript errors      | Ensure `.storybook` is included in your `tsconfig.json`              |
| Styling issues         | Check that global CSS is imported in `preview.ts`                    |
| Context errors         | Verify that necessary context providers are in place                 |
| Image loading failures | Check static paths and file references                               |
| CSF format errors      | Ensure you're using the correct CSF version (Storybook 7+ uses CSF3) |

### Support Resources

- [Official Storybook Documentation](https://storybook.js.org/docs)
- [Storybook GitHub Issues](https://github.com/storybookjs/storybook/issues)
- [Vanity Project Team Resources](#) (internal link)
