# T020 Implementation Plan

## Task: Add security scan to pre-push hook

### Analysis

The pre-push-security script already exists and provides comprehensive security scanning:

- Vulnerability checking via audit-filter.js
- Secret pattern detection
- Clear error messages and guidance

The current pre-push hook includes many checks but lacks security scanning.

### Implementation Approach

Following the **Simplicity First** and **Automation is Mandatory** principles from DEVELOPMENT_PHILOSOPHY.md:

1. **Integration Point**: Add security scan after TypeScript type check but before Edge Runtime compatibility check

   - This maintains logical flow: format → lint → typecheck → security → runtime → tests
   - Security issues should be caught early in the validation chain

2. **Implementation Method**: Execute the existing pre-push-security script

   - Avoid duplication by reusing the existing comprehensive security logic
   - Maintain single source of truth for security scanning

3. **Fast Feedback**: Security scan already has good UX with clear messages
   - Preserves existing skip mechanism via SKIP_SECURITY_SCAN environment variable
   - Provides actionable error messages

### Code Change

Add the following section to `.husky/pre-push` after TypeScript check:

```bash
# ========================================
# Security vulnerability scan
# ========================================
echo "🔒 Running security vulnerability scan..."
if .husky/pre-push-security; then
  echo "✅ Security scan passed"
else
  exit 1
fi
```

### Success Criteria

- [x] Security scan runs as part of pre-push workflow
- [x] Clear error messages guide developers on failures
- [x] Maintains existing skip mechanism for emergencies
- [x] No duplication of security logic
