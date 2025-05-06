# Storybook Configuration

This directory contains the configuration for Storybook, which is used for developing, testing, and documenting UI components in isolation.

## Setup

Storybook is configured with the following features:

### 1. Core Configuration (main.ts)

- **Stories Pattern**: Automatically discovers stories in `src/**/*.mdx` and `src/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- **Static Assets**: Serves assets from the `public` directory
- **Framework**: Next.js integration via `@storybook/nextjs`
- **TypeScript Support**: Enhanced TypeScript configuration with React docgen

### 2. Addons

The following addons are installed and configured:

- **@storybook/addon-links**: For linking between stories
- **@storybook/addon-essentials**: Core addons bundle (actions, backgrounds, controls, docs, viewport, toolbars, etc.)
- **@storybook/addon-interactions**: For testing component interactions
- **@storybook/addon-a11y**: For accessibility testing
- **@storybook/addon-viewport**: For testing responsive designs
- **storybook-dark-mode**: For dark mode support

### 3. Theme Integration (preview.ts & ThemeDecorator.tsx)

- **ThemeDecorator**: Integrates the app's theme context with Storybook
- **Dark Mode**: Configured to work with the project's dark mode implementation via Tailwind
- **Global Styles**: Imports the app's global CSS for consistent styling
- **ThemeContext Provider**: Provides a theme context with `isDarkMode` and `toggleDarkMode` values

### 4. Theme Context and Dark Mode

#### Theme Context Integration

- **Context Access**: Components that use `useTheme()` hook will work correctly in Storybook
- **Dark Mode Toggle**: The `ThemeContext` provides synchronized dark mode state with Storybook
- **State Synchronization**: The theme state stays in sync with Storybook's dark mode toggle

#### Using the Dark Mode Addon

The Storybook dark mode addon (`storybook-dark-mode`) provides several ways to control dark mode:

1. **Global Toggle**: Use the toggle button in the Storybook toolbar to switch between light and dark mode for all stories

2. **Per-Story Configuration**: Force a specific story to render in light or dark mode using story parameters:

   ```typescript
   export const DarkMode: Story = {
     parameters: {
       darkMode: {
         current: 'dark', // Use 'light' for light mode
       },
     },
   };
   ```

3. **Default Dark Mode**: Set the default dark mode in preview.ts:
   ```typescript
   const preview: Preview = {
     parameters: {
       darkMode: {
         current: 'light', // or 'dark'
       },
     },
   };
   ```

#### Creating Dark Mode Variants

For better testing and documentation, create explicit dark mode variants of your stories:

```typescript
// Light mode story (default)
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

#### Best Practices for Dark Mode

1. **Test Both Modes**: Always view your components in both light and dark mode to ensure proper rendering
2. **Use Tailwind Dark Classes**: Style dark mode variants using Tailwind's `dark:` prefix classes:
   ```html
   <div className="bg-white text-black dark:bg-gray-800 dark:text-white">
     Dark mode compatible content
   </div>
   ```
3. **Theme Context**: Components that need to react to theme changes should use the ThemeContext:
   ```typescript
   const { isDarkMode } = useTheme();
   ```
4. **Contrast and Accessibility**: Ensure proper contrast in both modes using the a11y addon

### 5. Tailwind CSS Integration

- **Automatic Processing**: Tailwind CSS is fully integrated with Storybook
- **Global CSS Import**: The project's globals.css is imported in preview.ts
- **Content Paths**: Tailwind's content configuration includes Storybook files
- **Dark Mode Support**: Works with Tailwind's dark mode classes through ThemeDecorator

## Usage

### Running Storybook

```bash
npm run storybook
```

This starts the Storybook development server at [http://localhost:6006](http://localhost:6006).

### Building Storybook

```bash
npm run build-storybook
```

This builds a static version of Storybook for deployment.

### Testing Storybook

```bash
npm run test-storybook
```

Runs tests for your Storybook stories.

## Creating Stories

Create `.stories.ts` or `.stories.tsx` files alongside your components:

```typescript
// Example: Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    // Optional parameters
  },
  args: {
    // Default args
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Define your stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

## Best Practices

1. **Component-Driven Development**: Design and develop components in isolation before integrating them into the application.
2. **Test Different States**: Create stories for all significant component states (normal, hover, active, disabled, error, etc.).
3. **Document Props**: Use JSDoc comments for proper documentation in the Storybook UI.
4. **Accessibility Testing**: Use the a11y addon to check for accessibility issues (see dedicated section below).
5. **Responsive Design Testing**: Use the viewport addon to test components at different screen sizes.
6. **Using Tailwind Classes**: Apply Tailwind utility classes directly in your component and story files:
   ```tsx
   // Component example with Tailwind classes
   <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Card Title</h2>
     <p className="text-gray-600 dark:text-gray-300">Card content goes here</p>
   </div>
   ```
7. **Testing Dark Mode**: Use the dark mode toggle in Storybook to test both light and dark appearances of components:

   ```typescript
   // Add a dark mode story variant
   export const DarkMode: Story = {
     args: {
       /* component props */
     },
     parameters: {
       darkMode: {
         current: 'dark',
       },
     },
   };
   ```

8. **Using Theme Context**: For components that depend on the theme context:

   ```typescript
   // Import and use the useTheme hook normally in your components
   import { useTheme } from '../context/ThemeContext';

   function MyComponent() {
     const { isDarkMode, toggleDarkMode } = useTheme();
     // Use theme context values
     return (
       <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
         <button onClick={toggleDarkMode}>Toggle Theme</button>
       </div>
     );
   }
   ```

## Accessibility Testing

### Accessibility Addon Overview

The Storybook Accessibility (a11y) addon helps identify and fix accessibility issues in your components. It uses [axe-core](https://github.com/dequelabs/axe-core) to audit components for compliance with web accessibility standards.

### Global Configuration

A global accessibility configuration is set up in `.storybook/preview.ts` with sensible defaults:

- **WCAG Compliance Level**: Set to WCAG 2.1 AA
- **Key Rules Enabled**:
  - ARIA attributes validation
  - Button and link discernible text
  - Form element labels
  - Image alt text
  - Color contrast
  - And more...

### Using the Accessibility Addon

#### Viewing Accessibility Violations

1. Open your component in Storybook
2. Navigate to the "Accessibility" tab in the addon panel
3. View highlighted violations, organized by severity
4. Click on each violation to see:
   - Details about the issue
   - Affected elements
   - How to fix the problem
   - Links to WCAG guidelines

#### Configuring Accessibility Rules for Specific Stories

Override global rules for specific components or stories:

```typescript
// In your story file
const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    a11y: {
      // Component-specific a11y configuration
      config: {
        rules: [
          {
            // Disable a specific rule for this component
            id: 'color-contrast',
            enabled: false,
          },
          {
            // Enable a rule that might be globally disabled
            id: 'landmark-one-main',
            enabled: true,
          },
        ],
      },
      // Optional manual checks specific to this component
      manual: [
        {
          description: 'Check keyboard navigation for dropdown',
          items: ['Escape key closes dropdown', 'Arrow keys navigate options'],
        },
      ],
    },
  },
};
```

#### Story-Level Configuration

Configure specific rule overrides for individual stories:

```typescript
export const WithSpecialRules: Story = {
  args: {
    // component props
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'autocomplete-valid',
            enabled: false,
            // Optional reason for future reference
            selector: 'input[autocomplete="custom-value"]',
          },
        ],
      },
    },
  },
};
```

### Accessibility Best Practices

1. **Run A11y Checks Regularly**: Check the accessibility panel for every component and story
2. **Fix All Violations**: Aim for zero accessibility violations in all components
3. **Test in Light and Dark Modes**: Ensure components are accessible in both themes
4. **Keyboard Navigation**: Verify components are fully usable with keyboard only
5. **Focus Management**: Ensure focus states are visible and logical
6. **Screen Reader Testing**: Test critical components with actual screen readers

### Common Accessibility Patterns

#### Accessible Buttons

```tsx
// Good - has accessible name
<button aria-label="Close menu">
  <svg>...</svg>
</button>

// Good - has text content
<button>
  <svg aria-hidden="true">...</svg>
  Close menu
</button>

// Bad - no accessible name
<button>
  <svg>...</svg>
</button>
```

#### Form Controls with Labels

```tsx
// Good - explicit label
<div>
  <label htmlFor="name">Name</label>
  <input id="name" type="text" />
</div>

// Good - aria-label
<input aria-label="Search" type="search" />

// Bad - no label
<input type="text" placeholder="Enter name" />
```

#### Non-Text Content

```tsx
// Good - descriptive alt text
<img src="logo.png" alt="Company Logo" />

// Good - decorative image
<img src="decoration.png" alt="" role="presentation" />

// Bad - missing alt
<img src="logo.png" />
```

## Troubleshooting

- If you encounter TypeScript errors, ensure your `tsconfig.json` includes the `.storybook` directory.
- For styling issues, verify that global CSS is properly imported in `preview.ts`.
- For component errors, check that all dependencies are properly mocked or provided through decorators.
