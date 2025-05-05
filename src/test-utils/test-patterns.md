# Testing Patterns

This document outlines the standard testing patterns to use in the Vanity project.

## Component Testing

```tsx
// Import test utils
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Prefer userEvent over fireEvent when possible
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
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(screen.getByText('Button Clicked')).toBeInTheDocument();
  });

  it('shows loading state and handles API calls', async () => {
    render(<MyComponent />);

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

```tsx
import { renderHook, act } from '@testing-library/react';
import useMyHook from '../useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('updates state when function is called', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
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

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how it does it.
2. **One assertion per test** - When possible, keep tests focused on a single behavior.
3. **Use meaningful test descriptions** - Test names should describe the behavior being tested.
4. **Isolation** - Tests should be independent and not affect each other.
5. **Mock external dependencies** - Tests should not rely on external services.
6. **Use Testing Library queries in this order of preference**:
   - `getByRole` (most preferred)
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`
   - `getByDisplayValue`
   - `getByAltText`
   - `getByTitle`
   - `getByTestId` (least preferred)
7. **Use `userEvent` over `fireEvent`** when possible - It simulates real user interactions more accurately.
8. **Use `data-testid` attributes sparingly** - Prefer to test by role, text, or label over test IDs.

## Coverage Requirements

All code should aim for at least 85% test coverage:

- 85% for statements
- 85% for branches
- 85% for functions
- 85% for lines

Critical paths such as API routes and database modules should aim for 90% coverage.
