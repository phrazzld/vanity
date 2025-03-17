# SearchBar Component

A reusable search input component with optional filters that supports both automatic (as-you-type) and explicit (button-click) search triggering.

## Features

- Text input for search queries
- Search button with configurable appearance
- Clear button to reset search
- Optional filter dropdowns
- Visual indicator for unsearched changes
- Support for both button-triggered and automatic searching
- Debounce for search-as-you-type mode
- Responsive design
- Dark mode support

## Usage

```tsx
import { SearchBar } from '@/app/components';

export default function MyComponent() {
  const handleSearch = (query: string, filters: Record<string, string>) => {
    // Process search query and filters
    console.log('Search query:', query);
    console.log('Filters:', filters);
  };

  const filterConfig = [
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      defaultValue: 'all'
    }
  ];

  return (
    <SearchBar
      onSearch={handleSearch}
      initialQuery=""
      placeholder="Search items..."
      filters={filterConfig}
      searchAsYouType={false} // Require button click to trigger search
      searchButtonText="Search"
      buttonVariant="primary"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSearch` | `(query: string, filters: Record<string, string>) => void` | Required | Callback when search is triggered |
| `initialQuery` | `string` | `''` | Initial search value |
| `placeholder` | `string` | `'Search...'` | Placeholder text for search input |
| `className` | `string` | `''` | Additional class names for the component |
| `filters` | `FilterConfig[]` | `[]` | Optional filter dropdowns |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds (0 to disable) |
| `searchAsYouType` | `boolean` | `false` | Whether to search automatically as user types |
| `searchButtonText` | `string` | `'Search'` | Text to display on search button |
| `filtersUpdateOnChange` | `boolean` | `false` | Whether to update filters automatically |
| `buttonVariant` | `'primary' \| 'secondary' \| 'minimal'` | `'primary'` | Button appearance style |

## Filter Configuration

```typescript
type FilterOption = {
  value: string;
  label: string;
};

type FilterConfig = {
  name: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
};
```

## Button Variants

- `primary`: Blue background with white text
- `secondary`: White background with gray border and dark text
- `minimal`: Transparent background with dark text

## Behavior

The SearchBar has two primary modes of operation:

### Button-Triggered Search Mode (`searchAsYouType={false}`)

- The search is only triggered when the user clicks the search button or presses Enter
- Changes to the search input or filters are tracked but not immediately applied
- A visual indicator appears on the search button when there are unsearched changes
- Useful for reducing API calls and giving users more control over when searches happen

### Search-As-You-Type Mode (`searchAsYouType={true}`)

- Search is triggered automatically as the user types (with debounce)
- Filter changes can trigger search automatically if `filtersUpdateOnChange={true}`
- No search button is needed, though it's still available for explicit submissions
- Useful for immediate feedback and a more dynamic user experience

## Filter Behavior

Filter behavior can be controlled separately:

- `filtersUpdateOnChange={true}`: Filter changes immediately trigger a search
- `filtersUpdateOnChange={false}`: Filter changes only apply when the search button is clicked

## Accessibility

- Proper aria labels for all interactive elements
- Form semantics for keyboard navigation
- Visual indicators for changes and loading states