# T17: Configure Accessibility Testing in Storybook

## Task Description

Set up `@storybook/addon-a11y` in `main.ts` and configure accessibility rules as needed.

## Implementation Plan

1. **Check Current Setup**

   - Verify if `@storybook/addon-a11y` is already installed and configured in `.storybook/main.ts`
   - Check if any accessibility rules are already configured in any of the Storybook files

2. **Configure A11y Addon**

   - Ensure the addon is properly configured in `.storybook/main.ts`
   - Update `.storybook/preview.ts` with global accessibility parameters if needed

3. **Set Up Default A11y Rules**

   - Configure sensible default accessibility rules in `.storybook/preview.ts` using the `a11y` parameter
   - Include key WCAG 2.1 standards and set appropriate rule severity levels

4. **Create Documentation**

   - Update the Storybook README.md with comprehensive information about the a11y addon
   - Provide examples of how to configure and use accessibility testing
   - Document how to override default rules for specific stories

5. **Test Accessibility Configuration**

   - Check existing stories to ensure the accessibility addon works correctly
   - Verify that accessibility violations are properly reported

6. **Update TODO.md**
   - Mark task T17 as complete

## Dependencies

- [x] T13: Initialize and Configure Basic Storybook Setup
