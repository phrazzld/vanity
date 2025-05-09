# State Management Code Examples

This document provides sample code examples for the recommended state management approach using TanStack Query and Zustand.

## TanStack Query Example

### Setting up the QueryClient

```tsx
// src/lib/query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Provider Setup

```tsx
// src/app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### API Hooks for Readings

```tsx
// src/lib/api/readings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Reading } from '@/types/reading';

interface ReadingsParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

async function fetchReadings(params: ReadingsParams) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`/api/readings?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch readings');
  }
  return response.json();
}

export function useReadings(params: ReadingsParams = {}) {
  return useQuery({
    queryKey: ['readings', params],
    queryFn: () => fetchReadings(params),
  });
}

async function fetchReadingById(id: string) {
  const response = await fetch(`/api/readings/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reading');
  }
  return response.json();
}

export function useReading(id: string) {
  return useQuery({
    queryKey: ['reading', id],
    queryFn: () => fetchReadingById(id),
    enabled: !!id,
  });
}

async function createReading(data: Omit<Reading, 'id'>) {
  const response = await fetch('/api/readings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create reading');
  }

  return response.json();
}

export function useCreateReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReading,
    onSuccess: () => {
      // Invalidate the readings list query to refetch data
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}
```

### Using the Query Hooks in Components

```tsx
// Example usage in a component
'use client';

import { useReadings } from '@/lib/api/readings';

export function ReadingsListWithQuery() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useReadings({
    search,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    sortBy: 'title',
    sortOrder: 'asc',
  });

  if (isLoading) return <ReadingListSkeleton />;
  if (error) return <div>Error loading readings</div>;

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />
      <ReadingsList readings={data.data} />
      <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
```

## Zustand Example

### Theme Store

```tsx
// src/store/theme.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      isDarkMode: false,
      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: isDark => set({ isDarkMode: isDark }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Hook to handle system preference and apply theme class
export function useThemeEffect() {
  const { isDarkMode, setDarkMode } = useThemeStore();

  // Apply dark mode class when state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for system preference changes
  useEffect(() => {
    // Initialize from system preference if store doesn't have a value
    const isStoreInitialized = useThemeStore.persist.hasHydrated();

    if (!isStoreInitialized) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!useThemeStore.persist.hasHydrated()) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);
}
```

### UI State Store

```tsx
// src/store/ui.ts
import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>(set => ({
  // Sidebar state
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Modal state
  activeModal: null,
  openModal: modalId => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
```

### Using Zustand Stores in Components

```tsx
// DarkModeToggle.tsx
'use client';

import { useThemeStore, useThemeEffect } from '@/store/theme';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  // Apply theme class and handle system preference
  useThemeEffect();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
```

## Combined Approach Example

For complete list views that combine UI state, filters, and data fetching:

```tsx
// src/app/hooks/useReadingsList.ts
import { useState } from 'react';
import { useReadings } from '@/lib/api/readings';

export function useReadingsList() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Generate query params based on state
  const queryParams = {
    search: search || undefined,
    sortBy,
    sortOrder,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };

  // Use TanStack Query for data fetching
  const { data, isLoading, error, refetch } = useReadings(queryParams);

  // Handle sort toggling
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return {
    // Data from query
    items: data?.data || [],
    totalItems: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,

    // State
    search,
    sortBy,
    sortOrder,
    page,
    pageSize,

    // Actions
    setSearch,
    toggleSort,
    setPage,
    setPageSize,
    refreshData: refetch,
  };
}
```

Using this combined approach in a component:

```tsx
// src/app/readings/page.tsx
'use client';

import { useReadingsList } from '@/hooks/useReadingsList';

export default function ReadingsPage() {
  const { items, isLoading, error, search, setSearch, page, totalPages, setPage } =
    useReadingsList();

  if (isLoading) return <ReadingListSkeleton />;
  if (error) return <div>Error loading readings</div>;

  return (
    <div>
      <h1>Readings</h1>
      <SearchBar value={search} onChange={setSearch} />
      <ReadingsList readings={items} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
```

This approach provides a clean, maintainable solution that leverages the strengths of both TanStack Query for data fetching and React's built-in hooks for UI state, with the option to move more complex state to Zustand as needed.
