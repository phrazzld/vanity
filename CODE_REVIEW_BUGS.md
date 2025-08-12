# Critical Bug Review

## 🚨 CRITICAL ISSUES (MUST FIX)

### [Uncaught Exception on Invalid Date] - CRITICAL

- **Location**: `src/app/components/readings/ReadingCard.tsx:32-36`
- **Bug Type**: crash
- **What Happens**: The `formatDate` function calls `new Date(date)` and immediately chains `.toLocaleDateString()`. If the `date` prop is a string that cannot be parsed (e.g., an empty string `''` or corrupted data from an API), `new Date()` returns an `Invalid Date` object. Calling `toLocaleDateString()` on this object throws an uncaught `RangeError`, which crashes the component's render.
- **Impact**: A single reading item with a malformed `finishedDate` from the backend API will crash the entire readings page, making it unusable for the user.
- **Fix**: Add a validity check after creating the `Date` object and before formatting it.

```typescript
function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Add this check to prevent a crash
  if (isNaN(dateObj.getTime())) {
    return ''; // Return a safe value for invalid dates
  }

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}
```

## ⚠️ HIGH RISK BUGS

### [Hover Overlay Inaccessible on Touch Devices] - HIGH

- **Location**: `src/app/components/readings/ReadingCard.tsx:93-94`
- **Bug Type**: logic-error / accessibility-regression
- **Risk**: The component's hover state is exclusively handled by `onMouseEnter` and `onMouseLeave`, which do not fire on most touch devices. This makes the overlay containing the book's title, author, and status completely inaccessible to mobile and tablet users.
- **Scenario**: A user on a phone or tablet taps a book card. Nothing happens. The essential information within the overlay is never displayed, rendering the component's primary interactive feature useless for a large portion of users.
- **Fix**: Restore touch event handlers to toggle the hover state, similar to the previous implementation.

```jsx
// In ReadingCard component
<div
  //... other props
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onTouchStart={() => setIsHovered(true)}
  // Add a delay on touch-end to allow users to see the info
  onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
  title={`${title} by ${author}`}
>
```

### [Accessibility Regression for Screen Readers] - HIGH

- **Location**: `src/app/components/readings/ReadingCard.tsx:95`
- **Bug Type**: logic-error / accessibility-regression
- **Risk**: The descriptive `aria-label` from the previous version, which announced the book's full details including its status, has been removed. The new `title` attribute is not a reliable substitute and is often ignored by screen readers.
- **Scenario**: A user navigating with a screen reader will only hear "Test Book by Test Author" but will not know the crucial status ("Currently Reading", "Finished Dec 2022", or "Paused"), making the list of readings far less useful.
- **Fix**: Restore the descriptive `aria-label` to the main container `div` to provide full context to assistive technologies.

```jsx
// In ReadingCard component
<div
  //... other props
  title={`${title} by ${author}`}
  aria-label={`Book: ${title} by ${author}, Status: ${statusText}`}
>
```

## 🔍 POTENTIAL ISSUES

### [Reduced Debuggability on Image Error] - MEDIUM

- **Location**: `src/app/components/readings/ReadingCard.tsx:133-134`
- **Concern**: The `onError` handler for the image component now logs a generic warning (`Failed to load image for "${title}"`) without including the `coverImageSrc` that failed. The previous implementation included this URL, which is critical for debugging broken image links.
- **Conditions**: This occurs whenever a book cover image fails to load from the server.
- **Mitigation**: Add the `coverImageSrc` variable back to the `console.warn` message to improve ease of debugging.

```jsx
onError={() => {
  // Restore the image source to the warning message
  console.warn(`Failed to load image for "${title}": ${coverImageSrc}`);
  setImageError(true);
}}
```

### [Incorrect Jest Coverage Exclusion Pattern] - MEDIUM

- **Location**: `jest.config.js:27`
- **Concern**: The new exclusion pattern `'!src/**/*.v[0-9].{js,jsx,ts,tsx}'` only matches a single digit after `.v`. It will not exclude versioned files with more than one digit, such as `ReadingCard.v10.tsx`.
- **Conditions**: If a file is ever versioned with two or more digits, it will be incorrectly included in coverage reports, potentially causing CI failures or skewed metrics.
- **Mitigation**: Modify the glob pattern to correctly handle one or more digits.

```diff
-    '!src/**/*.v[0-9].{js,jsx,ts,tsx}', // Exclude backup/versioned files
+    '!src/**/*.v[0-9]*.{js,jsx,ts,tsx}', // Exclude backup/versioned files
```

## ✅ SUMMARY

- Critical Issues: 1 (must fix before merge)
- High Risk Bugs: 2 (should fix)
- Potential Issues: 2 (consider fixing)

Overall Risk Assessment: **BLOCKED**

The component has a critical bug that will crash the application if it receives an invalid date string from the backend. Furthermore, major functional and accessibility regressions have been introduced that render the component unusable on touch devices and for screen reader users. These issues must be addressed before merging.
