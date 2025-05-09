# State Management Implementation

This document describes the implementation of the state management solution for the Vanity project, based on the evaluation in `STATE_MANAGEMENT.md`.

## Structure Overview

The state management solution has been implemented using a hybrid approach:

1. **TanStack Query** - For server state and data fetching
2. **Zustand** - For global UI state
3. **React's built-in hooks** - For component-local state

## Directory Structure

```
├── src/
│   ├── lib/
│   │   ├── query.ts                  # TanStack Query client configuration
│   │   ├── api/
│   │   │   ├── readings.ts           # Reading API query and mutation hooks
│   │   │   ├── quotes.ts             # Quote API query and mutation hooks
│   ├── store/
│   │   ├── theme.ts                  # Zustand store for theme state
│   │   ├── ui.ts                     # Zustand store for UI state
│   ├── app/
│   │   ├── providers.tsx             # Application providers wrapper
│   │   ├── hooks/
│   │   │   ├── useReadingsList.v2.ts # Enhanced readings list hook with TanStack Query
│   │   │   ├── useQuotesList.v2.ts   # Enhanced quotes list hook with TanStack Query
```

## Setup Details

### TanStack Query Setup

The TanStack Query setup includes:

1. **QueryClient configuration** (`src/lib/query.ts`)

   - Configured with sensible defaults for stale time, retries, and refetching behavior
   - Can be customized for specific queries

2. **Providers wrapper** (`src/app/providers.tsx`)

   - Wraps the application with QueryClientProvider
   - Includes ReactQueryDevtools in development mode

3. **API hooks** (`src/lib/api/readings.ts`, `src/lib/api/quotes.ts`)
   - Typed API for interacting with backend services
   - Handles data fetching, caching, and mutation
   - Includes error handling and loading states

### Zustand Stores

The Zustand implementation includes:

1. **Theme store** (`src/store/theme.ts`)

   - Manages dark/light mode preferences
   - Uses the persist middleware for localStorage persistence
   - Includes system preference detection

2. **UI store** (`src/store/ui.ts`)
   - Manages global UI state like sidebar visibility, modals, and search state
   - Simple API for components to interact with

### Enhanced List Hooks

The enhanced list hooks combine TanStack Query with local UI state:

1. **useReadingsList.v2.ts**

   - Manages readings data fetching with TanStack Query
   - Handles pagination, sorting, filtering, and searching
   - Provides a clean API for components

2. **useQuotesList.v2.ts**
   - Similar to useReadingsList but for quotes data
   - Customized for quote-specific filtering and sorting

## Usage Examples

### Using TanStack Query for Data Fetching

```tsx
import { useReadings } from '@/lib/api/readings';

function ReadingsPage() {
  const { data, isLoading, error } = useReadings({
    limit: 10,
    sortBy: 'title',
    sortOrder: 'asc',
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.data.map(reading => (
        <ReadingCard key={reading.id} reading={reading} />
      ))}
    </div>
  );
}
```

### Using Zustand for UI State

```tsx
import { useThemeStore, useThemeEffect } from '@/store/theme';

function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  // Apply theme class to document
  useThemeEffect();

  return <button onClick={toggleDarkMode}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</button>;
}
```

### Using Enhanced List Hooks

```tsx
import { useReadingsListV2 } from '@/app/hooks/useReadingsList.v2';

function ReadingsList() {
  const { items, isLoading, error, search, setSearch, page, totalPages, setPage } =
    useReadingsListV2();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />

      {items.map(reading => (
        <ReadingCard key={reading.id} reading={reading} />
      ))}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
```

## Migration Plan

The implementation includes both the original hooks and new versions to allow for a gradual migration:

1. **Immediate Benefits**

   - New components can use the new state management approach
   - TanStack Query provides immediate caching and data fetching improvements

2. **Gradual Migration**

   - Existing components can be migrated one by one
   - ThemeContext will be migrated to the Zustand theme store
   - Batch updates to ensure stability throughout the migration

3. **Final Steps**
   - Remove deprecated hooks once migration is complete
   - Update layout.tsx to use the new Providers component
   - Ensure full type safety and test coverage

## Next Steps

The next steps for state management implementation are:

1. **T31: Configure State Management Developer Tools**

   - Add Redux DevTools integration for Zustand
   - Configure additional TanStack Query DevTools options

2. **T32: Refactor Components to New State Management**
   - Migrate core components like ThemeProvider to use Zustand
   - Update list components to use TanStack Query versions
