# T007 Implementation Plan

## Task

**T007 · Feature · P0: Implement schema validation for allowlist file**

## Objective

Replace manual field validation with formal JSON schema validation using AJV to provide better error messages and maintainable validation logic.

## Implementation Approach

### 1. Architecture Decision

- Use AJV (already available) for JSON schema validation
- Separate schema definition into dedicated module for clarity
- Create custom error formatter for clear, actionable error messages
- Integrate at the parsing stage to replace manual validation

### 2. Implementation Steps

#### 2.1 Add ajv-formats dependency

```bash
npm install --save-dev ajv-formats
```

#### 2.2 Create schema definition

**File: `src/lib/audit-filter/allowlist.schema.ts`**

- Define comprehensive JSON schema for allowlist array
- Use strict validation with `additionalProperties: false`
- Include date format validation for `expires` and `reviewedOn`
- Export typed schema constant

#### 2.3 Create error formatter

**File: `src/lib/audit-filter/validationErrorFormatter.ts`**

- Process AJV error objects into clear messages
- Include specific field paths and error descriptions
- Maintain existing error message quality

#### 2.4 Integrate into core validation

**File: `src/lib/audit-filter/core.ts`**

- Initialize AJV with formats support
- Compile schema at module level
- Replace manual validation in `parseAndValidateAllowlist()`
- Remove redundant manual field checks

#### 2.5 Update tests

- Modify existing validation tests
- Add comprehensive schema validation test cases
- Test error message formatting
- Ensure all existing tests pass

### 3. Key Design Principles

- **Modularity**: Separate schema, formatting, and validation concerns
- **Simplicity**: Declarative schema validation replaces imperative checks
- **Testability**: Each module can be tested in isolation
- **Explicit**: Schema serves as documentation and validation

### 4. Files to Modify

- `src/lib/audit-filter/allowlist.schema.ts` (new)
- `src/lib/audit-filter/validationErrorFormatter.ts` (new)
- `src/lib/audit-filter/core.ts` (modify)
- `src/lib/audit-filter/__tests__/core.test.ts` (modify)
- `package.json` (add ajv-formats dependency)
