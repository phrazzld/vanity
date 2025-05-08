# Component Test Patterns

This document provides guidelines and patterns for testing React components in the Vanity project. It aims to establish consistent, maintainable, and effective testing practices across the codebase.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Categories](#testing-categories)
   - [UI/Presentational Components](#uipresentational-components)
   - [Interactive Components](#interactive-components)
   - [Data-Driven Components](#data-driven-components)
3. [Core Testing Patterns](#core-testing-patterns)
   - [Rendering Tests](#rendering-tests)
   - [User Interaction Tests](#user-interaction-tests)
   - [Theme/Context Integration](#themecontext-integration)
   - [Asynchronous Testing](#asynchronous-testing)
4. [Test Structure and Organization](#test-structure-and-organization)
5. [Test Utilities](#test-utilities)
6. [Common Patterns and Examples](#common-patterns-and-examples)

## Testing Philosophy

Our testing approach is built around these core principles:

1. **User-centric**: Tests should reflect how users interact with our components, not implementation details.
2. **Maintainability**: Tests should be resilient to refactoring and implementation changes.
3. **Readability**: Tests should clearly communicate their intent through descriptive test names and assertions.
4. **Reliability**: Tests should consistently produce the same results and avoid flakiness.

## Testing Categories

### UI/Presentational Components

These components primarily render UI based on props without complex state or behavior.

#### Key Testing Strategies:

1. **Render Testing**: Verify the component renders correctly with various prop combinations.
2. **Visual States**: Test different visual states (loading, error, empty, etc.).
3. **Theme Integration**: Test appearance in both light and dark mode.
4. **Accessibility**: Verify accessibility attributes and proper semantic HTML structure.

#### Example: Testing a Static Card Component

```tsx
import { renderWithTheme, screen } from '@/test-utils';
import Card from '../Card';

describe('Card Component', () => {
  it('renders with title and content', () => {
    renderWithTheme(
      <Card title="Test Title">
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders correctly in dark mode', () => {
    renderWithTheme(
      <Card title="Dark Mode Card">
        <p>Content in dark mode</p>
      </Card>,
      { themeMode: 'dark' }
    );
    
    // Verify the theme provider is in dark mode
    expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'dark');
    
    // If card has specific dark mode styling, test those as well
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
    // You can test specific classes or styles if applicable
  });
});
```

### Interactive Components

These components manage user input and respond to user interactions.

#### Key Testing Strategies:

1. **User Interactions**: Test mouse clicks, keyboard input, form submission, etc.
2. **State Changes**: Verify component state updates correctly after interactions.
3. **Callbacks**: Ensure proper callbacks are triggered with correct arguments.
4. **Accessibility**: Test keyboard navigation and focus management.

#### Example: Testing a Button Component

```tsx
import { renderWithTheme, screen, setupUser } from '@/test-utils';
import Button from '../Button';

describe('Button Component', () => {
  const onClickMock = jest.fn();
  
  beforeEach(() => {
    onClickMock.mockClear();
  });

  it('calls onClick when clicked', async () => {
    const user = setupUser();
    renderWithTheme(<Button onClick={onClickMock}>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', async () => {
    const user = setupUser();
    renderWithTheme(<Button disabled onClick={onClickMock}>Disabled Button</Button>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    
    await user.click(button);
    expect(onClickMock).not.toHaveBeenCalled();
  });

  it('supports keyboard interaction', async () => {
    const user = setupUser();
    renderWithTheme(<Button onClick={onClickMock}>Keyboard Button</Button>);
    
    const button = screen.getByRole('button', { name: /keyboard button/i });
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{enter}');
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
```

### Data-Driven Components

These components fetch, display, and manipulate data, often with loading states and error handling.

#### Key Testing Strategies:

1. **Data Fetching**: Mock API calls and test different response scenarios.
2. **Loading States**: Verify loading indicators display correctly.
3. **Error Handling**: Test error state rendering and recovery.
4. **Data Transformations**: Ensure data is processed and displayed correctly.

#### Example: Testing a Data Fetching Component

```tsx
import { renderWithTheme, screen, waitFor, mockFetch } from '@/test-utils';
import UserProfile from '../UserProfile';

describe('UserProfile Component', () => {
  it('shows loading state initially', () => {
    renderWithTheme(<UserProfile userId="123" />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays user data when fetch succeeds', async () => {
    // Mock successful API response
    const userData = { id: '123', name: 'John Doe', email: 'john@example.com' };
    mockFetch(userData);
    
    renderWithTheme(<UserProfile userId="123" />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Verify user data is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    // Mock failed API response
    const mockError = { error: 'Failed to fetch user data' };
    mockFetch(mockError, 500);
    
    renderWithTheme(<UserProfile userId="123" />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Verify error state is displayed
    expect(screen.getByText(/error loading profile/i)).toBeInTheDocument();
  });
});
```

## Core Testing Patterns

### Rendering Tests

Verify that components render correctly with various props.

```tsx
it('renders correctly with required props', () => {
  renderWithTheme(<Component requiredProp="value" />);
  
  // Check for expected elements
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});

it('renders correctly with all props', () => {
  renderWithTheme(
    <Component 
      requiredProp="value"
      optionalProp="optional"
      anotherProp={123}
    />
  );
  
  // Check for expected elements with all props
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
  expect(screen.getByText('optional')).toBeInTheDocument();
});
```

### User Interaction Tests

Test user interactions using the `setupUser` utility from `@testing-library/user-event`.

```tsx
it('responds to user interaction', async () => {
  const handleChange = jest.fn();
  const user = setupUser();
  
  renderWithTheme(<Input onChange={handleChange} />);
  
  const input = screen.getByRole('textbox');
  await user.type(input, 'test input');
  
  expect(handleChange).toHaveBeenCalledTimes(10); // Once per character
  expect(input).toHaveValue('test input');
});
```

### Theme/Context Integration

Test components in both light and dark themes using `renderWithTheme`.

```tsx
it('renders correctly in light mode', () => {
  renderWithTheme(<ThemeAwareComponent />);
  
  // Default is light mode
  expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'light');
  // Check light-mode specific elements
});

it('renders correctly in dark mode', () => {
  renderWithTheme(<ThemeAwareComponent />, { themeMode: 'dark' });
  
  expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'dark');
  // Check dark-mode specific elements
});
```

### Asynchronous Testing

Test asynchronous behavior using `waitFor`, `findBy*` queries, or by mocking timers.

```tsx
// Using waitFor
it('updates after async operation', async () => {
  renderWithTheme(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});

// Using findBy queries
it('eventually shows data', async () => {
  renderWithTheme(<AsyncComponent />);
  
  expect(await screen.findByText('Loaded')).toBeInTheDocument();
});

// Using fake timers
it('updates after delay', async () => {
  jest.useFakeTimers();
  renderWithTheme(<DelayedComponent />);
  
  // Fast-forward time
  jest.advanceTimersByTime(1000);
  
  expect(screen.getByText('Updated')).toBeInTheDocument();
  
  jest.useRealTimers();
});
```

## Test Structure and Organization

Follow this structured approach for organizing component tests:

```tsx
describe('ComponentName', () => {
  // Setup code, mocks and cleanup
  const mockFn = jest.fn();
  
  beforeEach(() => {
    mockFn.mockClear();
  });
  
  afterEach(() => {
    // Cleanup if needed
  });

  // Basic rendering tests
  describe('rendering', () => {
    it('renders correctly with default props', () => { /* ... */ });
    it('renders correctly with all props', () => { /* ... */ });
    it('renders in dark mode correctly', () => { /* ... */ });
  });

  // Interaction tests
  describe('user interactions', () => {
    it('responds to clicks', async () => { /* ... */ });
    it('handles keyboard navigation', async () => { /* ... */ });
  });

  // Specific functionality tests
  describe('specific functionality', () => {
    it('filters items correctly', () => { /* ... */ });
    it('sorts data in ascending order', () => { /* ... */ });
  });
});
```

## Test Utilities

Our project provides several utilities in `src/test-utils/index.ts` to make testing easier:

- `renderWithTheme`: Renders components with ThemeContext support
- `renderHookWithTheme`: Tests hooks with ThemeContext support
- `setupUser`: Creates a pre-configured user-event instance
- `mockFetch`: Mocks the global fetch for API testing
- `createMockResponse`: Creates mock response objects for testing
- `waitForCondition`: Waits for a specific condition to be met

## Common Patterns and Examples

### Testing Form Components

```tsx
it('validates form input', async () => {
  const user = setupUser();
  const handleSubmit = jest.fn();
  
  renderWithTheme(<Form onSubmit={handleSubmit} />);
  
  // Try submitting empty form
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(handleSubmit).not.toHaveBeenCalled();
  expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  
  // Fill in required field
  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  
  // Submit form now that it's valid
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
    name: 'John Doe'
  }));
});
```

### Testing Components with Animations

```tsx
it('applies animation classes correctly', async () => {
  const user = setupUser();
  renderWithTheme(<AnimatedComponent />);
  
  const element = screen.getByTestId('animated-element');
  expect(element).not.toHaveClass('animate-in');
  
  // Trigger animation
  await user.click(screen.getByRole('button', { name: /animate/i }));
  expect(element).toHaveClass('animate-in');
});
```

### Testing Components with Debounce

```tsx
it('debounces input changes', async () => {
  jest.useFakeTimers();
  const onSearchMock = jest.fn();
  const user = setupUser();
  
  renderWithTheme(<SearchBar onSearch={onSearchMock} debounceMs={300} />);
  
  // Type in search input
  await user.type(screen.getByRole('textbox'), 'test');
  
  // Callback shouldn't be called immediately
  expect(onSearchMock).not.toHaveBeenCalled();
  
  // Advance timers by debounce time
  jest.advanceTimersByTime(300);
  
  // Now the callback should be called
  expect(onSearchMock).toHaveBeenCalledTimes(1);
  expect(onSearchMock).toHaveBeenCalledWith('test', expect.anything());
  
  jest.useRealTimers();
});
```

### Testing Components with Portal/Modal

```tsx
it('renders modal when triggered', async () => {
  const user = setupUser();
  renderWithTheme(<ModalComponent />);
  
  // Modal should be closed initially
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  
  // Open the modal
  await user.click(screen.getByRole('button', { name: /open modal/i }));
  
  // Modal should be rendered
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  // Close the modal
  await user.click(screen.getByRole('button', { name: /close/i }));
  
  // Modal should be removed
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```