# T19: Create SearchBar Component Stories

## Task Description

Create `SearchBar.stories.ts` with stories for various states, filters, button variants, and behaviors.

## Current State Analysis

The SearchBar.stories.ts file already exists with several stories:

1. Basic - Default search bar without filters
2. BasicDarkMode - Dark mode variant of the basic search bar
3. SearchAsYouType - Search bar with auto-search behavior
4. SearchAsYouTypeDarkMode - Dark mode variant of auto-search
5. WithFilters - Search bar with filter dropdowns
6. WithFiltersDarkMode - Dark mode variant of filtered search
7. ButtonVariants - Different button styles (commented out JSX)
8. ButtonVariantsDarkMode - Dark mode variant of button variants

The SearchBar component is quite feature-rich, offering:

- Text input with search icon
- Clear button
- Optional filter dropdowns
- Search button with variants (primary, secondary, minimal)
- Support for both button-triggered and automatic searching
- Dark mode support
- Responsive design
- Accessibility attributes

## Implementation Plan

To enhance the stories and showcase all features of the SearchBar component:

1. **Fix ButtonVariants story**

   - Use React.createElement instead of JSX to fix the commented-out ButtonVariants story
   - Show all three button variants in a single story

2. **Add Initial Values and State Stories**

   - Create a story with initial query value
   - Create a story with pre-selected filters
   - Demonstrate the "unsearched changes" indicator

3. **Add Loading State Story**

   - Add a story showing a loading indicator during search

4. **Add Accessibility Stories**

   - Create a story focusing on keyboard navigation
   - Demonstrate focus states and accessibility attributes

5. **Add Responsive Layout Stories**

   - Show how the component adapts to different screen sizes

6. **Add Interactive Examples**

   - Add a story with simulated interactions
   - Demonstrate the search trigger behavior

7. **Enhance Documentation**

   - Add more comprehensive documentation in the component description
   - Include usage examples with code snippets
   - Document all props and their use cases

8. **Add Error State Stories**
   - Show how the component might look with validation errors

## Implementation Details

I'll update the SearchBar.stories.ts file with additional stories and enhanced documentation. I'll use React.createElement for complex stories rather than JSX to ensure TypeScript compatibility in the .ts file.

## Dependencies

- [x] T15: Configure Theme Context in Storybook
- [x] T16: Configure Dark Mode Support in Storybook
- [x] T17: Configure Accessibility Testing in Storybook
