# Testing Patterns

This document outlines the standard testing patterns to use in the Vanity project.

## Using the Test Utilities

We provide custom test utilities in `src/test-utils/index.ts` to make testing components with theme context and other common patterns easier.

### Importing

Always import from the test-utils package instead of directly from @testing-library/react:

```tsx
import {
  renderWithTheme, // Custom render with theme context
  screen,
  waitFor,
  setupUser, // Pre-configured userEvent setup
  mockFetch, // Helper for mocking fetch calls
} from '@/test-utils';
```

### Rendering Components with Theme Context

Most components in our application will use the `ThemeContext`. Use `renderWithTheme` to automatically wrap components with our `TestThemeProvider`:

```tsx
// Basic usage - defaults to light mode
renderWithTheme(<MyComponent />);

// Testing in dark mode
renderWithTheme(<MyComponent />, { themeMode: 'dark' });

// You can still pass all standard render options
renderWithTheme(<MyComponent />, {
  themeMode: 'dark',
  container: document.body, // standard render option
});
```

### Setting Up User Events

Use the `setupUser` helper to create a consistent user event instance:

```tsx
const user = setupUser();
// or with options
const user = setupUser({ delay: 100 });
```

## Component Testing

```tsx
// Import test utils from our utilities
import { renderWithTheme, screen, waitFor, setupUser } from '@/test-utils';
import MyComponent from '../MyComponent';

// Setup mocks if needed
jest.mock('some-dependency', () => ({
  someFunction: jest.fn(),
}));

describe('MyComponent', () => {
  // Optional setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Optional teardown
  afterEach(() => {
    // Clean up if needed
  });

  it('renders correctly', () => {
    renderWithTheme(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('renders correctly in dark mode', () => {
    renderWithTheme(<MyComponent />, { themeMode: 'dark' });
    // Theme-specific assertions...
    expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'dark');
  });

  it('handles user interaction', async () => {
    const user = setupUser();
    renderWithTheme(<MyComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(screen.getByText('Button Clicked')).toBeInTheDocument();
  });

  it('shows loading state and handles API calls', async () => {
    renderWithTheme(<MyComponent />);

    // Check initial loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check for data display
    expect(screen.getByText('Data item 1')).toBeInTheDocument();
  });
});
```

## Hook Testing

When testing hooks, especially those that use context, you need to wrap the hook with the appropriate providers. Our test utilities include a `renderHookWithTheme` function for this purpose:

```tsx
import { renderHookWithTheme, act } from '@/test-utils';
import useMyHook from '../useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHookWithTheme(() => useMyHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('updates state when function is called', () => {
    const { result } = renderHookWithTheme(() => useMyHook());

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });

  it('works with dark mode', () => {
    const { result } = renderHookWithTheme(() => useMyHook(), { themeMode: 'dark' });
    // Now test dark mode specific behavior
    expect(result.current.isDarkMode).toBe(true);
  });
});
```

## API Route Testing

```tsx
import { GET, POST } from '../my-api-route';
import * as db from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock the database module
jest.mock('@/lib/db', () => ({
  getData: jest.fn(),
  createData: jest.fn(),
}));

describe('/api/my-endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns data successfully', async () => {
      // Setup mock data
      const mockData = [{ id: 1, name: 'Test' }];
      (db.getData as jest.Mock).mockResolvedValueOnce(mockData);

      // Create request
      const req = new NextRequest('http://localhost:3000/api/my-endpoint');

      // Call handler
      const response = await GET(req);

      // Check response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockData);

      // Verify database function was called
      expect(db.getData).toHaveBeenCalledTimes(1);
    });

    it('handles errors correctly', async () => {
      // Mock error
      (db.getData as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      // Create request
      const req = new NextRequest('http://localhost:3000/api/my-endpoint');

      // Call handler
      const response = await GET(req);

      // Check error response
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });
});
```

## Database Testing

```tsx
import { prisma } from '@/lib/prisma';
import { myDatabaseFunction } from '../my-database-module';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    modelName: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Database Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches data correctly', async () => {
    // Setup mock return value
    const mockData = [{ id: 1, name: 'Test' }];
    (prisma.modelName.findMany as jest.Mock).mockResolvedValueOnce(mockData);

    // Call the function
    const result = await myDatabaseFunction();

    // Check result
    expect(result).toEqual(mockData);

    // Verify Prisma was called correctly
    expect(prisma.modelName.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Object),
      })
    );
  });
});
```

## Testing with Theme Context

Since our application uses a theme context for dark/light mode, many components will need access to this context during tests. Here's how to handle theme-dependent components:

### Components That Use `useTheme` Hook

```tsx
import { renderWithTheme, screen } from '@/test-utils';
import ThemeAwareComponent from '../ThemeAwareComponent';

describe('ThemeAwareComponent', () => {
  it('renders correctly in light mode', () => {
    renderWithTheme(<ThemeAwareComponent />);
    // Test light mode rendering
    expect(screen.getByText('Light Mode Content')).toBeInTheDocument();
  });

  it('renders correctly in dark mode', () => {
    renderWithTheme(<ThemeAwareComponent />, { themeMode: 'dark' });
    // Test dark mode rendering
    expect(screen.getByText('Dark Mode Content')).toBeInTheDocument();
  });
});
```

### Testing Theme Toggle Functionality

```tsx
import { renderWithTheme, screen, setupUser } from '@/test-utils';
import ThemeToggleComponent from '../ThemeToggleComponent';

describe('ThemeToggleComponent', () => {
  it('toggles theme when button is clicked', async () => {
    const user = setupUser();
    renderWithTheme(<ThemeToggleComponent />);

    // Initial state (light mode)
    let themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-theme', 'light');

    // Click toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    // Check if theme changed to dark mode
    themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-theme', 'dark');
  });
});
```

## Best Practices

1. **Use the custom test utilities** - Always use `renderWithTheme` instead of plain `render` for components.
2. **Test behavior, not implementation** - Focus on what the component does, not how it does it.
3. **Test in both light and dark mode** - When component rendering depends on theme.
4. **One assertion per test** - When possible, keep tests focused on a single behavior.
5. **Use meaningful test descriptions** - Test names should describe the behavior being tested.
6. **Isolation** - Tests should be independent and not affect each other.
7. **Mock external dependencies** - Tests should not rely on external services.
8. **Use Testing Library queries in this order of preference**:
   - `getByRole` (most preferred)
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`
   - `getByDisplayValue`
   - `getByAltText`
   - `getByTitle`
   - `getByTestId` (least preferred)
9. **Use `setupUser()` over `fireEvent`** when possible - It simulates real user interactions more accurately.
10. **Use `data-testid` attributes sparingly** - Prefer to test by role, text, or label over test IDs.

## Coverage Requirements

All code should aim for at least 85% test coverage:

- 85% for statements
- 85% for branches
- 85% for functions
- 85% for lines

Critical paths such as API routes and database modules should aim for 90% coverage.
