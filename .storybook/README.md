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

### 4. Tailwind CSS Integration

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
4. **Accessibility Testing**: Use the a11y addon to check for accessibility issues.
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

## Troubleshooting

- If you encounter TypeScript errors, ensure your `tsconfig.json` includes the `.storybook` directory.
- For styling issues, verify that global CSS is properly imported in `preview.ts`.
- For component errors, check that all dependencies are properly mocked or provided through decorators.
