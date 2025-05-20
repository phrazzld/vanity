# Vanity Project: Storybook Guidelines

This document outlines specific guidelines for using Storybook with the Vanity project components.

## Table of Contents

- [Component Organization](#component-organization)
- [Project-Specific Patterns](#project-specific-patterns)
- [Component Examples](#component-examples)
- [Common Pitfalls](#common-pitfalls)
- [TypeScript Tips](#typescript-tips)
- [Adding New Components](#adding-new-components)

## Component Organization

The Vanity project organizes components following the Atomic Design methodology:

```
src/app/components/
├── atoms/           # Basic UI building blocks
├── molecules/       # Combinations of atoms
├── organisms/       # Complex UI sections
├── templates/       # Page layouts
└── index.ts         # Component exports
```

Your Storybook story titles should follow this hierarchy:

```typescript
// For an atom
title: 'Atoms/ButtonName';

// For a molecule
title: 'Molecules/CardName';

// For an organism
title: 'Organisms/HeaderName';
```

## Project-Specific Patterns

### ThemeContext Integration

All components that use theme context will automatically work with Storybook's dark mode toggle due to our ThemeDecorator:

```typescript
// This will read from Storybook's dark mode toggle state
const { isDarkMode } = useTheme();
```

Create explicit dark mode variants for thorough testing:

```typescript
export const DefaultDarkMode: Story = {
  args: {
    /* Same props as Default */
  },
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};
```

### Tailwind Integration

Vanity uses Tailwind CSS for styling. Always use Tailwind's dark mode syntax in your components:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Content</div>
```

### Mobile-First Responsive Design

Test your components at different viewport sizes using responsive classes:

```tsx
<div className="p-2 md:p-4 lg:p-6">Responsive padding</div>
```

Use the Viewport addon to test different screen sizes.

## Component Examples

### SearchBar Component

The SearchBar component demonstrates best practices for Storybook integration:

1. **Comprehensive Documentation**: Detailed component description with features and usage examples
2. **Parameter Configuration**: Layout, documentation, and accessibility settings
3. **Detailed ArgTypes**: Descriptions and control configurations for each prop
4. **Story Organization**:
   - Basic variants first (`Basic`)
   - State variations (`WithFilters`, `SearchAsYouType`)
   - Dark mode variants (`BasicDarkMode`)
   - Special cases (`ButtonVariants`, `AccessibleSearchBar`, `ResponsiveDemo`)

### DarkModeToggle Component

The DarkModeToggle component shows:

1. **Size Variants**: Demonstrates component in different size configurations
2. **Mode Variants**: Forces specific modes for testing
3. **Custom Styling**: Shows how to apply custom classes
4. **Accessibility Testing**: Highlights focus states

## Common Pitfalls

### 1. JSX in TypeScript Files

You cannot use JSX syntax in `.ts` files (only in `.tsx` files). Use `React.createElement` for complex demonstrations in `.ts` files:

```typescript
// INCORRECT in .ts files
export const Example: Story = {
  render: () => (
    <div>
      <Component />
    </div>
  ),
};

// CORRECT in .ts files
export const Example: Story = {
  render: () => React.createElement(
    'div',
    null,
    React.createElement(Component, null)
  ),
};
```

### 2. Context Access

Components that rely on context need to be wrapped with their providers. The ThemeDecorator handles this for ThemeContext, but other contexts need explicit decorators:

```typescript
// For a component requiring UserContext
const withUserContext = (Story) => (
  <UserProvider initialUser={{ name: 'Test User' }}>
    <Story />
  </UserProvider>
);

const meta = {
  decorators: [withUserContext],
  // ...
};
```

### 3. Custom Event Handlers

For components with form submissions or other events, provide mock handlers:

```typescript
export const WithFormSubmit: Story = {
  args: {
    onSubmit: e => {
      e.preventDefault();
      console.log('Form submitted');
    },
  },
};
```

## TypeScript Tips

### 1. Type Definitions

For proper typing with Storybook:

```typescript
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  // ...
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;
```

### 2. argTypes Configuration

Properly type your argTypes for better autocomplete:

```typescript
argTypes: {
  size: {
    control: 'select',
    options: ['small', 'medium', 'large'] as const,
    description: 'Size of the component',
  },
} as const,
```

### 3. Documentation Comments

Use JSDoc comments for props to generate documentation:

```typescript
interface Props {
  /** Description of this prop */
  propName: string;
}
```

## Adding New Components

When adding a new component to the Vanity project:

1. Create the component with TypeScript interface for props
2. Add JSDoc comments to all props
3. Create stories covering all variants, states, and responsive behaviors
4. Include a dark mode story variant
5. Test the component with the accessibility addon
6. Include usage examples in the story documentation

### Story Checklist

- [ ] Basic/default variant
- [ ] All prop variations
- [ ] Dark mode variant
- [ ] Mobile/responsive behavior
- [ ] Error states (if applicable)
- [ ] Loading states (if applicable)
- [ ] Accessibility tested
- [ ] Comprehensive documentation

### Example Story Setup

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import NewComponent from './NewComponent';

const meta: Meta<typeof NewComponent> = {
  title: 'Components/NewComponent',
  component: NewComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# NewComponent

Detailed description of what this component does.

## Features
- Feature 1
- Feature 2

## Usage
\`\`\`tsx
<NewComponent prop="value" />
\`\`\`
`,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const Variant: Story = {
  args: {
    // Variant props
  },
};

export const DarkMode: Story = {
  args: {
    // Same as Default
  },
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};
```
