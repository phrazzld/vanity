import type { Meta, StoryObj } from '@storybook/react';
import SearchBar from './SearchBar';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A reusable search input component with optional filters that supports both interactive and automatic searching.',
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
    onSearch: { action: 'search triggered' },
    filters: {
      control: 'object',
      description: 'Array of filter configurations',
    },
    searchAsYouType: {
      control: 'boolean',
      description: 'Whether to search automatically as user types',
    },
    buttonVariant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'minimal'],
      description: 'Button style variant',
    },
  },
} satisfies Meta<typeof SearchBar>;

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

// Search as you type
export const SearchAsYouType: Story = {
  args: {
    placeholder: 'Search as you type...',
    searchAsYouType: true,
    debounceMs: 300,
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

// Different button variants
export const ButtonVariants: Story = {
  // Note: The render function is commented out because JSX isn't supported directly in .stories.ts files
  // This would need to be moved to a .stories.tsx file to work properly
  /*
  render: (args) => (
    <div className="space-y-4">
      <SearchBar {...args} buttonVariant="primary" searchButtonText="Primary" />
      <SearchBar {...args} buttonVariant="secondary" searchButtonText="Secondary" />
      <SearchBar {...args} buttonVariant="minimal" searchButtonText="Minimal" />
    </div>
  ),
  */
  args: {
    placeholder: 'Search...',
    searchAsYouType: false,
    buttonVariant: 'primary',
    searchButtonText: 'Search',
  },
};
