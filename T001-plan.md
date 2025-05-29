# T001 Plan: Refactor `audit-filter.ts` for testability

## Overview

This plan outlines the approach to refactor the `audit-filter.ts` script to make it more testable while maintaining the same functionality. The refactoring will follow the core principles from our Development Philosophy, especially focusing on Simplicity, Modularity, Design for Testability, and Explicit Dependencies.

## Approach

### 1. Architecture

We'll adopt a clear separation of concerns by:

1. **Core Logic Module**: Create a new `src/lib/audit-filter/core.ts` module containing pure, side-effect-free business logic
2. **CLI Wrapper**: Transform the existing `scripts/audit-filter.ts` into a thin wrapper that handles I/O, process management, and orchestration

This approach directly aligns with our Development Philosophy's "Strict Separation of Concerns" principle, isolating core business logic from infrastructure concerns.

### 2. Core Logic Module

The core module will:

- Contain all pure business logic as standalone, exported functions
- Accept data as explicit parameters and return structured results
- Have no direct dependencies on `fs`, `child_process`, `console`, or `process`
- Inject dependencies like the current date for testing date-sensitive logic
- Export interfaces for all data structures

Key functions:

```typescript
// Main orchestration function
export function analyzeAuditReport(
  npmAuditJson: string,
  allowlistJson: string | null,
  currentDate: Date
): AnalysisResult;

// Supporting pure functions
export function parseNpmAuditJson(jsonString: string): ParsedAuditReport;
export function parseAndValidateAllowlist(jsonString: string | null): AllowlistEntry[];
export function isAllowlistEntryExpired(entry: AllowlistEntry, currentDate: Date): boolean;
export function willExpireSoon(
  entry: AllowlistEntry,
  currentDate: Date,
  daysThreshold: number
): boolean;
export function filterVulnerabilities(
  auditReport: ParsedAuditReport,
  allowlist: AllowlistEntry[],
  currentDate: Date
): AnalysisResult;
```

### 3. CLI Wrapper

The CLI wrapper will:

- Handle all I/O operations (file reading, npm audit execution)
- Manage the process lifecycle (exit codes)
- Use structured logging for all output
- Orchestrate calls to the core logic module
- Have minimal business logic of its own

Key responsibilities:

```typescript
// Read the allowlist file
const allowlistContent = readAllowlistFile(ALLOWLIST_PATH);

// Execute npm audit
const auditOutput = executeNpmAudit();

// Get current date
const currentDate = new Date();

// Analyze using core logic
const analysisResult = analyzeAuditReport(auditOutput, allowlistContent, currentDate);

// Log results using structured logger
logResults(analysisResult);

// Exit with appropriate code
process.exit(determineExitCode(analysisResult));
```

### 4. Data Interfaces

We'll define clear TypeScript interfaces to enhance type safety and clarity:

```typescript
interface AllowlistEntry {
  id: string;
  package: string;
  reason: string;
  expires?: string;
  reviewedOn?: string;
  notes?: string;
}

interface Advisory {
  id: number | string;
  module_name: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  url: string;
  vulnerable_versions: string;
}

interface NpmAuditResult {
  advisories: { [key: string]: Advisory };
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
  };
}

interface VulnerabilityInfo {
  id: string | number;
  package: string;
  severity: string;
  title: string;
  url: string;
  allowlistStatus: 'new' | 'expired' | 'allowed';
  reason?: string;
  expiresOn?: string;
}

interface AnalysisResult {
  vulnerabilities: VulnerabilityInfo[];
  allowedVulnerabilities: VulnerabilityInfo[];
  expiredAllowlistEntries: VulnerabilityInfo[];
  expiringEntries: VulnerabilityInfo[];
  isSuccessful: boolean;
}
```

### 5. Testing Strategy

1. **Unit Tests for Core Logic**:

   - Test each pure function with various inputs
   - Test date-sensitive logic with controlled date inputs
   - Cover edge cases like malformed inputs, missing fields
   - No mocking of `fs` or `child_process` needed

2. **Integration Tests for CLI Wrapper**:
   - Mock direct dependencies: `fs.readFileSync`, `child_process.execSync`, and `process.exit`
   - Verify correct handling of file reading and npm audit execution
   - Validate appropriate exit codes for different scenarios
   - Check proper logging based on analysis results

## Implementation Steps

1. **Create Directory Structure**:

   ```
   src/
     lib/
       audit-filter/
         core.ts         # Pure business logic
         core.test.ts    # Unit tests
         types.ts        # Shared type definitions
   ```

2. **Extract Core Logic**:

   - Create and implement the core module with pure functions
   - Define all necessary TypeScript interfaces
   - Ensure proper error handling for invalid inputs

3. **Refactor CLI Wrapper**:

   - Update `scripts/audit-filter.ts` to use the core module
   - Replace direct `fs` and `child_process` calls
   - Replace `console.log/error` with structured logging
   - Maintain the same command-line interface

4. **Implement Tests**:

   - Write comprehensive unit tests for core logic
   - Add integration tests for the CLI wrapper

5. **Update Build Configuration**:

   - Ensure TypeScript compilation includes the new files
   - Update `package.json` scripts if needed

6. **Documentation**:
   - Add JSDoc comments to all exported functions
   - Document the design decisions and rationale
   - Update any relevant project documentation

## Validation

1. **Functionality**: Ensure the refactored script produces identical results to the original
2. **Test Coverage**: Verify >90% test coverage for the core logic
3. **Code Quality**: Run linters and formatters to ensure code quality
4. **Behavior**: Confirm identical exit codes and logging for all scenarios

This refactoring will significantly improve the testability of the security audit functionality while maintaining the same behavior, aligning with our development principles of simplicity, modularity, and explicit dependencies.
