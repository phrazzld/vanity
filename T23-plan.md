# T23: Set Up React Testing Library Configuration - Implementation Plan

## Task Analysis
This task involves creating a dedicated test setup for React Testing Library with ThemeProvider and necessary mocks. Currently, the project already has some testing infrastructure in place, but it appears fragmented and inconsistent across component tests.

The main issues that need to be addressed:
1. No centralized test renderer with ThemeProvider wrapper
2. Inconsistent mocking approaches (e.g., ThemeContext is mocked differently in different tests)
3. No standardized approach for testing components that use theme context
4. No centralized test utilities for common testing patterns

## Current State
The project has:
- Jest configured with next/jest
- jest.setup.js with some basic configuration and mocks
- A test-utils directory with basic utilities but no comprehensive test renderer
- Component tests that individually mock ThemeContext or wrap components

## Implementation Plan

### 1. Enhance the Test Utils Module
Create a comprehensive test utility module in `src/test-utils/index.ts` that:
- Provides a custom render function that wraps components with ThemeProvider
- Includes options to customize the ThemeProvider (light/dark mode)
- Re-exports all necessary testing library functions for convenience

### 2. Create Mock Implementations
- Create proper mocks for browser APIs used in ThemeContext (localStorage, matchMedia)
- Set up any other required mocks for common dependencies

### 3. Update Documentation
- Add a testing guide in `src/test-utils/test-patterns.md` with examples
- Document the proper usage of the test utilities

### 4. Update Example Tests
- Update one or two existing component tests to use the new utilities as examples

## Detailed Implementation

1. **Enhanced Render Function**:
```typescript
// Custom render function that includes providers
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    themeMode?: 'light' | 'dark';
    // Add other context providers if needed
  }
) {
  const { themeMode = 'light', ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestThemeProvider initialTheme={themeMode}>
        {children}
      </TestThemeProvider>
    ),
    ...renderOptions,
  });
}
```

2. **Mock Implementations**:
```typescript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false, // default to light mode
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

3. **Test Theme Provider**:
```typescript
function TestThemeProvider({ 
  children, 
  initialTheme = 'light' 
}: { 
  children: React.ReactNode; 
  initialTheme?: 'light' | 'dark';
}) {
  // Simplified ThemeProvider that doesn't use browser APIs
  const [isDarkMode, setIsDarkMode] = useState(initialTheme === 'dark');

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## Classification
This is a **Simple** task that involves enhancing existing utilities and consolidating testing patterns. It's primarily focused on improving developer experience rather than implementing new functionality. The changes are well-defined and contained within the testing infrastructure.