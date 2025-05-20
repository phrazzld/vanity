# Implementation Plan: Fix Component Test TypeScript Errors (CI2)

## Problem Summary

The CI pipeline is failing during Storybook build due to TypeScript strict mode errors in component test files. These errors relate to:

1. DOM element access without null checks (e.g., `readingItems[0]` in ReadingsList.test.tsx)
2. Array access without null checks (e.g., `sampleReadings[0]` in YearSection.test.tsx)
3. Unused imports and variables (e.g., ThemeProvider, waitFor, within)
4. Missing Jest custom matcher implementations (e.g., toMatchThemeSnapshots)

The errors are being caught by TypeScript's strict mode, particularly with `noUncheckedIndexedAccess: true` which requires array access to be properly null-checked.

## Step-by-Step Implementation Plan

### 1. Fix SearchBar.test.tsx

#### Current Issues:

- Unused imports: `waitFor` is imported but not used

#### Implementation:

```typescript
// Before
import { renderWithTheme, screen, waitFor, setupUser, act } from '@/test-utils';

// After
import { renderWithTheme, screen, setupUser, act } from '@/test-utils';
```

### 2. Fix ReadingsList.test.tsx

#### Current Issues:

- **Line ~152**: `fireEvent.click(readingItems[0]);` - Error TS2345: Element | undefined is not assignable to Window | Document | Node | Element
- **Unused Imports**: `ThemeProvider` is imported but not used

#### Implementation:

1. Add null check for DOM element access in the click test:

   ```typescript
   // Before
   const readingItems = container.querySelectorAll('[role="button"]');
   fireEvent.click(readingItems[0]);

   // After
   const readingItems = container.querySelectorAll('[role="button"]');
   if (readingItems.length > 0) {
     const firstReadingItem = readingItems[0];
     if (firstReadingItem) {
       fireEvent.click(firstReadingItem);
       expect(mockHandleSelectReading).toHaveBeenCalledWith(mockReadings[0]);
     } else {
       throw new Error('First reading item is undefined');
     }
   } else {
     throw new Error('No reading items with role="button" found');
   }
   ```

2. Remove unused import or replace with a comment:

   ```typescript
   // Before
   import { ThemeProvider } from '../../../context/ThemeContext';

   // After
   // We're not directly using ThemeProvider here, just its mock
   // So we don't need to import it
   ```

### 3. Fix QuotesList.test.tsx

#### Current Issues:

- **Line ~95**: `fireEvent.click(quoteItems[0]);` - Error TS2345: Element | undefined is not assignable to Window | Document | Node | Element

#### Implementation:

```typescript
// Before
const quoteItems = container.querySelectorAll('[role="button"]');
if (quoteItems.length > 0) {
  fireEvent.click(quoteItems[0]);
  expect(mockHandleSelectQuote).toHaveBeenCalledWith(mockQuotes[0]);
} else {
  throw new Error('No quote items with role="button" found');
}

// After
const quoteItems = container.querySelectorAll('[role="button"]');
if (quoteItems.length > 0) {
  const firstQuoteItem = quoteItems[0];
  if (firstQuoteItem) {
    fireEvent.click(firstQuoteItem);
    expect(mockHandleSelectQuote).toHaveBeenCalledWith(mockQuotes[0]);
  } else {
    throw new Error('First quote item is undefined');
  }
} else {
  throw new Error('No quote items with role="button" found');
}
```

### 4. Fix ReadingCard.test.tsx

#### Current Issues:

- **Line ~18**: Unused import `within` is declared but not used

#### Implementation:

```typescript
// Before
import { renderWithTheme, screen, setupUser, within } from '@/test-utils';

// After
import { renderWithTheme, screen, setupUser } from '@/test-utils';
```

### 5. Fix Pagination.test.tsx

#### Current Issues:

- **Line ~50**: `fireEvent.click(buttons[0]);` - Error TS2345: Element | undefined is not assignable to Window | Document | Node | Element

#### Implementation:

```typescript
// Before
const buttons = screen.getAllByRole('button');
expect(buttons.length).toBeGreaterThan(0);

// Click one of the buttons
fireEvent.click(buttons[0]);

// After
const buttons = screen.getAllByRole('button');
expect(buttons.length).toBeGreaterThan(0);

// Click one of the buttons - using non-null assertion since we already checked length above
const firstButton = buttons[0];
if (firstButton) {
  fireEvent.click(firstButton);
} else {
  throw new Error('No buttons found, but expected at least one');
}
```

### 6. Fix test-utils/index.tsx (Add Jest Matcher)

#### Current Issues:

- Missing implementation for `toMatchThemeSnapshots` custom matcher that's used in DarkModeToggle.snapshot.test.tsx

#### Implementation:

```typescript
// Add this to the end of test-utils/index.tsx
// Custom matcher for testing theme differences
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchThemeSnapshots: (darkRender: any) => R;
    }
  }
}

// Add the matcher to Jest's expect
expect.extend({
  toMatchThemeSnapshots(received, comparison) {
    const pass = received.cleanHtml !== comparison.cleanHtml;

    if (pass) {
      return {
        message: () => `Expected theme snapshots to be different and they are.`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected theme snapshots to be different, but they are the same.`,
        pass: false,
      };
    }
  },
});
```

### 7. Testing & Verification

1. Run tests to ensure they still pass:

   ```bash
   npm test
   ```

2. Run Storybook build to verify all fixes:

   ```bash
   npm run build-storybook
   ```

3. Conduct a lint check to ensure code quality:
   ```bash
   npm run lint
   ```

### 8. Commit Changes

Commit with conventional commit format:

```bash
git commit -m "fix(tests): fix TypeScript strict mode errors in component tests

- Added null checks for DOM element access in ReadingsList, QuotesList, and Pagination
- Removed unused imports across test files
- Implemented toMatchThemeSnapshots custom matcher
- Fixed all TypeScript errors that were breaking Storybook build

These changes ensure TypeScript strict mode compatibility while
maintaining test functionality. Fixes Storybook build failures in CI."
```

## Principles Applied

1. **Maximize Language Strictness**: Properly handling TypeScript strict mode errors rather than suppressing them
2. **Explicit is Better than Implicit**: Making null/undefined checks explicit
3. **Design for Testability**: Ensuring tests remain robust in a strict typing environment
4. **Simplicity First**: Using straightforward null checks rather than complex type manipulations

## Risk Assessment

- **Low Risk**: Changes are isolated to test files and don't affect production code
- **Test Behavior**: Null checks could alter test behavior if tests were incorrectly relying on unintentional access to undefined elements
- **Prevention**: Test runs will verify that functionality remains intact
