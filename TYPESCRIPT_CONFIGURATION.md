# TypeScript Configuration Guide

> **Note:** This documentation was created as part of the CI3 task to standardize TypeScript configuration across environments.

This document provides an overview of the TypeScript configuration in this project and how it's applied across different environments.

## Configuration Files

### 1. `tsconfig.json` - Base Configuration

This is the main TypeScript configuration file that all other configuration files extend. It includes:

- Strict type checking options (`strict: true`)
- Null checks (`strictNullChecks: true`)
- Index access safety (`noUncheckedIndexedAccess: true`)
- Path aliases (`@/*` mapped to `./src/*`)

### 2. `tsconfig.test.json` - Test Configuration

Specifically for testing files:

- Extends the base `tsconfig.json`
- Includes Jest types
- Relaxes certain rules for tests:
  - `noUnusedLocals: false` - Allows unused variables in test files (useful for mocks)
  - `noUnusedParameters: false` - Allows unused parameters in test files (useful for test helpers)
- Maintains strict array and object access checking:
  - `noUncheckedIndexedAccess: true`
  - `strictNullChecks: true`

### 3. `tsconfig.strict.json` - Strict Checking

For enforcing strict rules during development:

- Extends the base `tsconfig.json`
- Explicitly enables all strict checks to catch potential issues earlier

### 4. `tsconfig.typecheck.json` - Pre-commit Checking

Used during pre-commit hooks:

- Extends the base `tsconfig.json`
- Temporarily disables some strict checks to allow faster commits
- Note that full strict checks still run in CI

## Environment-Specific Configuration

### Next.js Development Server

- Uses `tsconfig.json` with Next.js plugin

### Jest Tests

- Uses `tsconfig.test.json` configuration
- Has special handling for JSX and Jest types

### Storybook

- Uses a dedicated `.storybook/tsconfig.json` that extends the base configuration
- Ensures consistent type checking with the main application
- Maintains the `noUncheckedIndexedAccess` setting for strict array and object access

## Commands

- `npm run typecheck` - Quick type checking for pre-commit
- `npm run typecheck:strict` - Full strict type checking
- `npm run typecheck:test` - Type check test files only

## TypeScript Best Practices

1. **Always handle potential undefined values**

   ```typescript
   // Wrong ❌
   const value = array[0];

   // Correct ✅
   const value = array[0] ?? defaultValue;
   // or
   if (array.length > 0) {
     const value = array[0];
     // Use value safely
   }
   ```

2. **Properly type function parameters and return values**

   ```typescript
   // Wrong ❌
   function formatValue(value) {
     return `${value}!`;
   }

   // Correct ✅
   function formatValue(value: string): string {
     return `${value}!`;
   }
   ```

3. **Use type assertions sparingly**

   ```typescript
   // Avoid when possible ⚠️
   const value = data as SomeType;

   // Better approach ✅
   if (isValidType(data)) {
     const value: SomeType = data;
     // Use value safely
   }
   ```

4. **DOM element access should always include null checking**

   ```typescript
   // Wrong ❌
   const elements = container.querySelectorAll('.item');
   fireEvent.click(elements[0]);

   // Correct ✅
   const elements = container.querySelectorAll('.item');
   if (elements.length > 0) {
     const firstElement = elements[0];
     if (firstElement) {
       fireEvent.click(firstElement);
     }
   }
   ```
