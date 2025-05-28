# T008 Implementation Plan: Validate required fields and date formats

## Task Overview

Update the allowlist schema to enforce strict validation for required fields and ISO 8601 UTC date format.

## Implementation Approach

1. **Update allowlist.schema.ts**:

   - Change the date format validation from `'date'` to `'date-time'` for ISO 8601 format
   - This will validate formats like "2024-01-01T00:00:00Z" or "2024-01-01T00:00:00+00:00"
   - Both `expires` and `reviewedOn` fields should use this format

2. **Update affected tests**:

   - Update test data in allowlist.schema.test.ts to use ISO 8601 UTC format
   - Update any other test files that create allowlist entries

3. **Verify validation behavior**:
   - Ensure invalid date formats are properly rejected
   - Ensure all required fields are enforced (already implemented)

## Key Files to Modify

- `/src/lib/audit-filter/allowlist.schema.ts`
- `/src/lib/audit-filter/__tests__/allowlist.schema.test.ts`
- Any other test files using allowlist entries

## Adherence to Development Philosophy

- Following TypeScript strict type safety principles
- Ensuring explicit validation rules
- Maintaining test coverage for all validation scenarios
