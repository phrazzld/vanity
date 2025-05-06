import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import SearchBar from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# SearchBar

A versatile search input component with optional filter dropdowns, designed for flexibility and customization.

## Features

- **Input Modes:** Button-triggered or automatic search-as-you-type
- **Filters:** Optional filter dropdowns that can be configured for any data type
- **Button Variants:** Primary, secondary, and minimal styles
- **Clear Button:** One-click clearing of search input
- **Responsive:** Adapts to different screen sizes (vertical on mobile, horizontal on desktop)
- **Accessibility:** ARIA labels and keyboard navigation support
- **Dark Mode:** Full support for both light and dark themes
- **Visual Feedback:** Indicators for unsaved changes and loading states

## Usage Examples

### Basic Search

\`\`\`tsx
<SearchBar 
  placeholder="Search products..." 
  onSearch={(query, filters) => handleSearch(query, filters)} 
/>
\`\`\`

### Search As You Type

\`\`\`tsx
<SearchBar 
  searchAsYouType={true}
  debounceMs={300}
  onSearch={(query, filters) => handleSearch(query, filters)} 
/>
\`\`\`

### With Filters

\`\`\`tsx
<SearchBar 
  filters={[
    {
      name: "category",
      label: "Category",
      options: [
        { value: "", label: "All Categories" },
        { value: "books", label: "Books" },
        { value: "electronics", label: "Electronics" }
      ]
    }
  ]}
  onSearch={(query, filters) => handleSearch(query, filters)}
/>
\`\`\`

### With Custom Button Styling

\`\`\`tsx
<SearchBar 
  buttonVariant="secondary"
  searchButtonText="Find"
  onSearch={(query, filters) => handleSearch(query, filters)}
/>
\`\`\`
`,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'label',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSearch: {
      action: 'search triggered',
      description: 'Callback function triggered when search is performed',
      control: false,
    },
    initialQuery: {
      control: 'text',
      description: 'Initial value for the search input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the component',
    },
    filters: {
      control: 'object',
      description: 'Array of filter configurations',
    },
    debounceMs: {
      control: 'number',
      description:
        'Delay in milliseconds before triggering search (when searchAsYouType is enabled)',
    },
    searchAsYouType: {
      control: 'boolean',
      description: 'Whether to search automatically as user types',
    },
    searchButtonText: {
      control: 'text',
      description: 'Text to display on the search button',
    },
    filtersUpdateOnChange: {
      control: 'boolean',
      description: 'Whether to update search results when filters change',
    },
    buttonVariant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'minimal'],
      description: 'Button style variant',
    },
    showButton: {
      control: 'boolean',
      description: 'Whether to show the search button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic search bar without filters
export const Basic: Story = {
  args: {
    placeholder: 'Search...',
    searchButtonText: 'Search',
    searchAsYouType: false,
    buttonVariant: 'primary',
  },
};

// Dark mode variant of Basic
export const BasicDarkMode: Story = {
  args: {
    placeholder: 'Search...',
    searchButtonText: 'Search',
    searchAsYouType: false,
    buttonVariant: 'primary',
  },
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};

// Search as you type
export const SearchAsYouType: Story = {
  args: {
    placeholder: 'Search as you type...',
    searchAsYouType: true,
    debounceMs: 300,
  },
};

// Dark mode variant of SearchAsYouType
export const SearchAsYouTypeDarkMode: Story = {
  args: {
    placeholder: 'Search as you type...',
    searchAsYouType: true,
    debounceMs: 300,
  },
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};

// With filters
export const WithFilters: Story = {
  args: {
    placeholder: 'Search readings...',
    searchButtonText: 'Search',
    searchAsYouType: false,
    filters: [
      {
        name: 'year',
        label: 'Year',
        options: [
          { value: '', label: 'All Years' },
          { value: '2024', label: '2024' },
          { value: '2023', label: '2023' },
          { value: '2022', label: '2022' },
        ],
        defaultValue: '',
      },
      {
        name: 'category',
        label: 'Category',
        options: [
          { value: '', label: 'All Categories' },
          { value: 'fiction', label: 'Fiction' },
          { value: 'non-fiction', label: 'Non-Fiction' },
          { value: 'biography', label: 'Biography' },
        ],
        defaultValue: '',
      },
    ],
  },
};

// Dark mode variant of WithFilters
export const WithFiltersDarkMode: Story = {
  args: {
    placeholder: 'Search readings...',
    searchButtonText: 'Search',
    searchAsYouType: false,
    filters: [
      {
        name: 'year',
        label: 'Year',
        options: [
          { value: '', label: 'All Years' },
          { value: '2024', label: '2024' },
          { value: '2023', label: '2023' },
          { value: '2022', label: '2022' },
        ],
        defaultValue: '',
      },
      {
        name: 'category',
        label: 'Category',
        options: [
          { value: '', label: 'All Categories' },
          { value: 'fiction', label: 'Fiction' },
          { value: 'non-fiction', label: 'Non-Fiction' },
          { value: 'biography', label: 'Biography' },
        ],
        defaultValue: '',
      },
    ],
  },
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};

// Auto-update filters
export const FiltersAutoUpdate: Story = {
  args: {
    placeholder: 'Search with auto-updating filters...',
    searchAsYouType: true,
    filtersUpdateOnChange: true,
    filters: [
      {
        name: 'year',
        label: 'Year',
        options: [
          { value: '', label: 'All Years' },
          { value: '2024', label: '2024' },
          { value: '2023', label: '2023' },
          { value: '2022', label: '2022' },
        ],
        defaultValue: '',
      },
      {
        name: 'category',
        label: 'Category',
        options: [
          { value: '', label: 'All Categories' },
          { value: 'fiction', label: 'Fiction' },
          { value: 'non-fiction', label: 'Non-Fiction' },
          { value: 'biography', label: 'Biography' },
        ],
        defaultValue: '',
      },
    ],
  },
};

// With initial values
export const WithInitialValues: Story = {
  args: {
    initialQuery: 'Initial search term',
    placeholder: 'Search...',
    searchButtonText: 'Search',
    searchAsYouType: false,
    filters: [
      {
        name: 'category',
        label: 'Category',
        options: [
          { value: '', label: 'All Categories' },
          { value: 'fiction', label: 'Fiction' },
          { value: 'non-fiction', label: 'Non-Fiction' },
          { value: 'biography', label: 'Biography' },
        ],
        defaultValue: 'fiction', // Pre-selected filter value
      },
    ],
  },
};

// No search button
export const NoSearchButton: Story = {
  args: {
    placeholder: 'Search as you type (no button)...',
    searchAsYouType: true,
    showButton: false,
  },
};

// Different button variants
export const ButtonVariants: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-4' },
      React.createElement(SearchBar, {
        placeholder: 'Primary button (default)',
        searchButtonText: 'Primary',
        buttonVariant: 'primary',
        onSearch: () => console.log('Primary search clicked'),
      }),
      React.createElement(SearchBar, {
        placeholder: 'Secondary button',
        searchButtonText: 'Secondary',
        buttonVariant: 'secondary',
        onSearch: () => console.log('Secondary search clicked'),
      }),
      React.createElement(SearchBar, {
        placeholder: 'Minimal button',
        searchButtonText: 'Minimal',
        buttonVariant: 'minimal',
        onSearch: () => console.log('Minimal search clicked'),
      })
    );
  },
};

// Button variants in dark mode
export const ButtonVariantsDarkMode: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-4' },
      React.createElement(SearchBar, {
        placeholder: 'Primary button (default)',
        searchButtonText: 'Primary',
        buttonVariant: 'primary',
        onSearch: () => console.log('Primary search clicked'),
      }),
      React.createElement(SearchBar, {
        placeholder: 'Secondary button',
        searchButtonText: 'Secondary',
        buttonVariant: 'secondary',
        onSearch: () => console.log('Secondary search clicked'),
      }),
      React.createElement(SearchBar, {
        placeholder: 'Minimal button',
        searchButtonText: 'Minimal',
        buttonVariant: 'minimal',
        onSearch: () => console.log('Minimal search clicked'),
      })
    );
  },
  parameters: {
    darkMode: {
      current: 'dark',
    },
  },
};

// Accessibility focused
export const AccessibleSearchBar: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-6' },
      React.createElement(
        'div',
        {
          className:
            'bg-blue-50 dark:bg-gray-800 p-4 rounded-md border border-blue-200 dark:border-gray-700',
        },
        React.createElement(
          'h3',
          { className: 'font-medium text-sm mb-2 text-blue-800 dark:text-blue-300' },
          'Accessibility Features:'
        ),
        React.createElement(
          'ul',
          { className: 'list-disc ml-5 text-sm text-gray-700 dark:text-gray-300 space-y-1' },
          React.createElement('li', {}, 'Input has aria-label for screen readers'),
          React.createElement('li', {}, 'Clear button has descriptive aria-label'),
          React.createElement('li', {}, 'Filter dropdowns have proper labels'),
          React.createElement('li', {}, 'Buttons have focus indicators'),
          React.createElement('li', {}, 'Tab navigation follows logical flow')
        )
      ),
      React.createElement(SearchBar, {
        placeholder: 'Try tabbing through this component',
        searchButtonText: 'Search',
        className: 'focus-ring-demo',
        filters: [
          {
            name: 'category',
            label: 'Category Filter',
            options: [
              { value: '', label: 'All Categories' },
              { value: 'fiction', label: 'Fiction' },
              { value: 'non-fiction', label: 'Non-Fiction' },
            ],
          },
        ],
        onSearch: () => console.log('Accessible search clicked'),
      })
    );
  },
};

// Responsive demo
export const ResponsiveDemo: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-6' },
      React.createElement(
        'div',
        {
          className:
            'bg-yellow-50 dark:bg-gray-800 p-4 rounded-md border border-yellow-200 dark:border-gray-700',
        },
        React.createElement(
          'h3',
          { className: 'font-medium text-sm text-yellow-800 dark:text-yellow-300' },
          'Resize your browser to see how the SearchBar adapts:'
        ),
        React.createElement(
          'p',
          { className: 'text-sm text-gray-700 dark:text-gray-300 mt-1' },
          'On mobile: Components stack vertically. On desktop: Components align horizontally.'
        )
      ),
      React.createElement(
        'div',
        {
          className:
            'border border-gray-300 dark:border-gray-700 p-4 rounded max-w-full sm:max-w-[500px] md:max-w-full',
        },
        React.createElement(SearchBar, {
          placeholder: 'Responsive search example',
          searchButtonText: 'Search',
          filters: [
            {
              name: 'year',
              label: 'Year',
              options: [
                { value: '', label: 'All Years' },
                { value: '2024', label: '2024' },
                { value: '2023', label: '2023' },
              ],
            },
            {
              name: 'category',
              label: 'Category',
              options: [
                { value: '', label: 'All Categories' },
                { value: 'fiction', label: 'Fiction' },
                { value: 'non-fiction', label: 'Non-Fiction' },
              ],
            },
          ],
          onSearch: () => console.log('Responsive search clicked'),
        })
      )
    );
  },
};

// Interactive with unsearched changes indicator
export const UnsearchedChanges: Story = {
  render: () => {
    return React.createElement(
      'div',
      { className: 'flex flex-col gap-4' },
      React.createElement(
        'div',
        {
          className:
            'bg-blue-50 dark:bg-gray-800 p-4 rounded-md border border-blue-200 dark:border-gray-700',
        },
        React.createElement(
          'p',
          { className: 'text-sm text-gray-700 dark:text-gray-300' },
          'Type in the search box below. Notice the blue dot indicator appears on the button, showing there are unsearched changes.'
        )
      ),
      React.createElement(SearchBar, {
        placeholder: 'Type something and see the indicator...',
        searchButtonText: 'Search',
        searchAsYouType: false,
        onSearch: () => console.log('Interactive search clicked'),
      })
    );
  },
};

// Mobile view
export const MobileView: Story = {
  render: () => {
    // Create a container with limited width to simulate mobile
    return React.createElement(
      'div',
      { className: 'max-w-[320px] border border-gray-300 dark:border-gray-700 p-2 rounded' },
      React.createElement(SearchBar, {
        placeholder: 'Mobile view search...',
        searchButtonText: 'Go',
        filters: [
          {
            name: 'category',
            label: 'Category',
            options: [
              { value: '', label: 'All Categories' },
              { value: 'fiction', label: 'Fiction' },
              { value: 'non-fiction', label: 'Non-Fiction' },
            ],
          },
        ],
        onSearch: () => console.log('Mobile search clicked'),
      })
    );
  },
};
