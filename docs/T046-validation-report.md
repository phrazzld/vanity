# T046 Security Pipeline Validation Report

## Summary

- **Total Tests**: 4
- **Passed**: 3
- **Failed**: 1
- **Success Rate**: 75%

## Test Results

### 1. Missing Expiration Dates

- **Expected**: FAIL
- **Actual**: FAIL
- **Status**: ✅ PASSED
- **Exit Code**: 2

**Output:**

```

> vanity@0.1.0 security:scan
> npm run build:audit-filter && node dist/scripts/audit-filter.js


> vanity@0.1.0 build:audit-filter
> tsc scripts/audit-filter.ts --esModuleInterop --resolveJsonModule --outDir dist/scripts --skipLibCheck

src/lib/audit-filter/npmAudit.normalizers.ts(37,7): error TS2322: Type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' is not assignable to type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
  Property 'info' is optional in type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' but required in type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
src/lib/audit-filter/npmAudit.normalizers.ts(71,7): error TS2322: Type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' is not assignable to type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
  Property 'info' is optional in type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' but required in type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
src/lib/audit-filter/validationErrorFormatter.ts(32,32): error TS2802: Type 'Set<string>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
src/lib/audit-filter/validationErrorFormatter.ts(39,8): error TS2802: Type 'Set<number>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.

```

### 2. Invalid Date Formats

- **Expected**: FAIL
- **Actual**: FAIL
- **Status**: ✅ PASSED
- **Exit Code**: 2

**Output:**

```

> vanity@0.1.0 security:scan
> npm run build:audit-filter && node dist/scripts/audit-filter.js


> vanity@0.1.0 build:audit-filter
> tsc scripts/audit-filter.ts --esModuleInterop --resolveJsonModule --outDir dist/scripts --skipLibCheck

src/lib/audit-filter/npmAudit.normalizers.ts(37,7): error TS2322: Type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' is not assignable to type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
  Property 'info' is optional in type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' but required in type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
src/lib/audit-filter/npmAudit.normalizers.ts(71,7): error TS2322: Type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' is not assignable to type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
  Property 'info' is optional in type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' but required in type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
src/lib/audit-filter/validationErrorFormatter.ts(32,32): error TS2802: Type 'Set<string>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
src/lib/audit-filter/validationErrorFormatter.ts(39,8): error TS2802: Type 'Set<number>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.

```

### 3. Expired Entries

- **Expected**: FAIL
- **Actual**: FAIL
- **Status**: ✅ PASSED
- **Exit Code**: 2

**Output:**

```

> vanity@0.1.0 security:scan
> npm run build:audit-filter && node dist/scripts/audit-filter.js


> vanity@0.1.0 build:audit-filter
> tsc scripts/audit-filter.ts --esModuleInterop --resolveJsonModule --outDir dist/scripts --skipLibCheck

src/lib/audit-filter/npmAudit.normalizers.ts(37,7): error TS2322: Type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' is not assignable to type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
  Property 'info' is optional in type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' but required in type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
src/lib/audit-filter/npmAudit.normalizers.ts(71,7): error TS2322: Type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' is not assignable to type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
  Property 'info' is optional in type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' but required in type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
src/lib/audit-filter/validationErrorFormatter.ts(32,32): error TS2802: Type 'Set<string>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
src/lib/audit-filter/validationErrorFormatter.ts(39,8): error TS2802: Type 'Set<number>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.

```

### 4. Valid Control Case

- **Expected**: PASS
- **Actual**: FAIL
- **Status**: ❌ FAILED
- **Exit Code**: 2

**Output:**

```

> vanity@0.1.0 security:scan
> npm run build:audit-filter && node dist/scripts/audit-filter.js


> vanity@0.1.0 build:audit-filter
> tsc scripts/audit-filter.ts --esModuleInterop --resolveJsonModule --outDir dist/scripts --skipLibCheck

src/lib/audit-filter/npmAudit.normalizers.ts(37,7): error TS2322: Type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' is not assignable to type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
  Property 'info' is optional in type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' but required in type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
src/lib/audit-filter/npmAudit.normalizers.ts(71,7): error TS2322: Type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' is not assignable to type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
  Property 'info' is optional in type '{ info?: number; low?: number; moderate?: number; high?: number; critical?: number; total?: number; }' but required in type '{ info: number; low: number; moderate: number; high: number; critical: number; total: number; }'.
src/lib/audit-filter/validationErrorFormatter.ts(32,32): error TS2802: Type 'Set<string>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
src/lib/audit-filter/validationErrorFormatter.ts(39,8): error TS2802: Type 'Set<number>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.

```

## Validation Status

❌ **1 tests failed** - Security pipeline needs attention

Generated: 2025-06-04T00:11:41.785Z
