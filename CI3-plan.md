# CI3: Standardize TypeScript Configuration for Tests

## Task Classification

- **Classification:** Complex
- This task requires understanding and modifying how TypeScript configurations interact across different environments. It involves multi-file changes, requires design decisions about TypeScript configuration, and carries risk if the configurations are incompatible.

## Problem Analysis

### Current Configuration Files

1. **tsconfig.json** - Base configuration with strict settings enabled

   - Contains strict settings including `noUncheckedIndexedAccess`
   - Used for Next.js application code

2. **tsconfig.test.json** - Test-specific configuration

   - Extends tsconfig.json
   - Disables `noUnusedLocals` and `noUnusedParameters`
   - Includes Jest types
   - Only includes test files

3. **tsconfig.strict.json** - Strict checking configuration

   - Extends tsconfig.json
   - Explicitly enables strict checks
   - Excludes test files

4. **tsconfig.typecheck.json** - Pre-commit typecheck configuration

   - Extends tsconfig.json
   - Disables strict checks for pre-commit
   - Excludes test files

5. **jest.config.js**

   - Configures Jest for running tests
   - Uses next/jest to load Next.js config

6. **.storybook/main.ts**
   - Enables TypeScript checking for Storybook (`check: true`)

### Issues Identified

1. Test files are explicitly excluded from `tsconfig.strict.json` and `tsconfig.typecheck.json`
2. Test files operate under different TypeScript rules via `tsconfig.test.json`
3. Storybook uses its own TypeScript configuration which appears to use the main tsconfig
4. Recent TypeScript strict mode errors in tests indicate a mismatch between environments

## Implementation Plan

### 1. Standardize TypeScript Rules for Tests

1. **Update tsconfig.test.json**

   - Keep disabling `noUnusedLocals` and `noUnusedParameters` (needed for test mocks)
   - Explicitly enable `noUncheckedIndexedAccess` to match the main config
   - Ensure strict null checks are applied to tests

2. **Create jest-specific tsconfig** (if needed)
   - Create a separate `tsconfig.jest.json` that Jest will use specifically for tests
   - This can help isolate test-specific configuration

### 2. Update Jest Configuration

1. **Modify jest.config.js**
   - Ensure Jest uses the correct TypeScript configuration
   - Consider adding explicit configuration for ts-jest if necessary

### 3. Configure Storybook TypeScript Rules

1. **Update .storybook/main.ts**
   - Ensure Storybook uses the same TypeScript checking configuration
   - Modify checkTs options if necessary to align with main config

### 4. Update Test Running Scripts

1. **Modify test scripts in package.json**
   - Ensure they use consistent TypeScript rules
   - Add comments documenting the TypeScript configuration being used

### 5. Testing and Validation

1. **Test with Different Commands**
   - Run tests with Jest
   - Build Storybook
   - Run TypeScript checking
   - Ensure all environments use consistent rules

## Expected Outcomes

1. Tests will be subject to consistent TypeScript checking rules across all environments
2. Storybook builds will check types using the same rules as the main application
3. The `noUncheckedIndexedAccess` rule will be applied consistently
4. Future TypeScript errors will be caught consistently in all environments

## Implementation Details

### Implementation Steps

1. **Step 1: Create unified TypeScript test configuration**

   ```json
   // tsconfig.test.json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": {
       "jsx": "react-jsx",
       "types": ["jest", "node", "@testing-library/jest-dom"],
       // Allow unused vars in tests for mocks and test setup
       "noUnusedLocals": false,
       "noUnusedParameters": false,
       // Keep strict array and object access checking
       "noUncheckedIndexedAccess": true
     },
     "include": [
       "**/*.test.ts",
       "**/*.test.tsx",
       "src/**/__tests__/**/*.ts",
       "src/**/__tests__/**/*.tsx",
       "src/test-utils/**",
       "tests/**",
       "jest.setup.js"
     ],
     "exclude": ["node_modules"]
   }
   ```

2. **Step 2: Update tsconfig.strict.json and tsconfig.typecheck.json**

   - Ensure both include test files appropriately

3. **Step 3: Update Storybook TypeScript configuration**

   ```typescript
   // .storybook/main.ts
   typescript: {
     check: true,
     checkOptions: {
       tsconfig: path.resolve(__dirname, '../tsconfig.json'),
     },
     reactDocgen: 'react-docgen-typescript'
   }
   ```

4. **Step 4: Verify all TypeScript configurations are working together**
   - Run tests, build app, and build Storybook to ensure consistency
