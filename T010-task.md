# T010 Task Definition

## Task ID

T010

## Title

Improve npm audit output parsing

## Original Ticket Text

- **Action:**
  1. Make parsing more robust against different npm audit formats
  2. Handle format variations gracefully
- **Done-when:**
  1. Parser handles various npm versions' output
  2. Tests verify compatibility with multiple formats
- **Depends-on:** [T001]

## Implementation Approach Analysis Prompt

You are tasked with improving the npm audit output parsing in the audit-filter module to handle different npm audit formats and format variations gracefully. The current implementation expects a very specific structure and may fail with different npm versions.

### Current State Analysis

The existing `parseNpmAuditJson` function in `src/lib/audit-filter/core.ts` expects:

- `advisories` as an object (not array)
- `metadata.vulnerabilities` with specific numeric fields
- Rigid structure validation that throws errors for any deviation

### Research Requirements

1. **Format Variations**: Research how npm audit output has changed across npm versions
2. **Structure Differences**: Identify what fields might be optional, different types, or missing
3. **Backward Compatibility**: Determine which npm versions need to be supported
4. **Error Handling**: How to gracefully handle unknown or missing fields

### Implementation Considerations

1. **Flexible Parsing**: Design parsing logic that can handle multiple format variations
2. **Graceful Degradation**: When fields are missing, provide sensible defaults or warnings
3. **Type Safety**: Maintain TypeScript safety while being more flexible
4. **Test Coverage**: Create tests for different npm audit output formats
5. **Validation Strategy**: Balance validation with flexibility

### Acceptance Criteria

- Parser successfully handles npm audit output from different npm versions
- Graceful handling of missing or differently structured fields
- Comprehensive test suite covering multiple format variations
- No breaking changes to existing functionality
- Clear error messages when parsing truly fails

### Technical Constraints

- Must maintain existing TypeScript interfaces where possible
- Should not break existing tests
- Follow project's error handling patterns
- Maintain performance characteristics
