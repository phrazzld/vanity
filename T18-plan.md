# T18: Create DarkModeToggle Component Stories

## Task Description

Create `DarkModeToggle.stories.ts` with stories for different states and interactions.

## Current State Analysis

The DarkModeToggle.stories.ts file already exists with three basic stories:

1. Default - using the current theme context state
2. LightMode - explicitly set to light mode
3. DarkMode - explicitly set to dark mode

The DarkModeToggle component itself is a simple button that:

- Displays a sun icon in dark mode and a moon icon in light mode
- Uses the ThemeContext to get the current mode and toggle function
- Has hover styles for both light and dark modes
- Includes appropriate accessibility attributes (aria-label)

## Implementation Plan

To enhance the stories and demonstrate different states and interactions, I'll add the following:

1. **Add Interactive Controls**

   - Add control to toggle between light and dark mode
   - Include a note in the docs about how the component works with ThemeContext

2. **Add Interaction Stories**

   - Create a story that demonstrates the click interaction
   - Use Storybook's play function to simulate user interactions

3. **Add Accessibility Stories**

   - Create a story focused on accessibility features
   - Demonstrate proper ARIA attributes and keyboard interaction

4. **Add Size Variants**

   - Create stories for different size variants (small, medium, large)
   - This will require modifying the component to accept a size prop

5. **Add Custom Styling Example**

   - Create a story showing how to customize the appearance
   - Demonstrate proper application of Tailwind classes

6. **Add Documentation Examples**

   - Enhance the component documentation
   - Add usage examples in the docs section

7. **Verify Accessibility**
   - Ensure all stories pass accessibility checks
   - Fix any a11y issues found

## Implementation Details

I'll update the DarkModeToggle.stories.ts file with the additional stories and documentation. I'll also need to update the DarkModeToggle component to support size variants.

## Dependencies

- [x] T15: Configure Theme Context in Storybook
- [x] T16: Configure Dark Mode Support in Storybook
- [x] T17: Configure Accessibility Testing in Storybook
