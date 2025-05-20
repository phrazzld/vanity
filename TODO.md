# TODO: Integrate Automated Security Vulnerability Scanning into CI Pipeline

## Overview

Implement a simpler approach to dependency security scanning using the native package manager audit functionality (`npm audit` now, with future migration to `pnpm audit`), focusing on failing builds when high or critical vulnerabilities are introduced.

## CI Integration

- [x] **T001 · Feature · P0: Add Security Scan Job to CI Workflow**

  - **Action:**
    1. Add a `security_scan` job to `.github/workflows/ci.yml` that runs after installing dependencies
    2. Configure it as a required check for PRs to `main`
  - **Done-when:**
    1. Security scan job definition is added to CI workflow
    2. Job is configured as a required status check for merging PRs
  - **Verification:**
    1. Review workflow file for correct job configuration
  - **Depends-on:** None

- [ ] **T002 · Feature · P0: Implement npm Audit in CI Pipeline**

  - **Action:**
    1. Add step to CI job: `npm audit --audit-level=high`
    2. Configure job to fail if exit code is non-zero (audit found vulnerabilities)
    3. Set this as a required status check for PRs
  - **Done-when:**
    1. CI step executes npm audit with high severity threshold
    2. Builds fail when high/critical vulnerabilities are detected
  - **Verification:**
    1. CI logs show successful execution of npm audit scan
  - **Depends-on:** [T001]

- [ ] **T003 · Feature · P2: Create allowlist script for known vulnerabilities**

  - **Action:**
    1. Create a simple script (e.g., `scripts/audit-filter.js`) that runs `npm audit --json` and filters results
    2. Configure script to exit with error only for non-allowlisted high/critical issues
    3. Add configuration file for managing the allowlist with justifications
  - **Done-when:**
    1. Script correctly filters out allowlisted vulnerabilities
    2. Script maintains security by failing on new high/critical issues
  - **Verification:**
    1. Test script with known vulnerabilities
    2. Verify it passes with allowlisted vulnerabilities but fails with new ones
  - **Depends-on:** [T002]

- [ ] **T004 · Chore · P1: Update CI to use audit filter script**
  - **Action:**
    1. Modify CI workflow to use the audit filter script instead of direct npm audit
    2. Ensure CI fails only on non-allowlisted high/critical vulnerabilities
  - **Done-when:**
    1. CI uses audit filter script successfully
  - **Verification:**
    1. CI passes with allowlisted vulnerabilities
    2. CI fails with new high/critical vulnerabilities
  - **Depends-on:** [T003]

## Developer Experience

- [ ] **T005 · Feature · P2: Add NPM Scripts for Local Security Scanning**

  - **Action:**
    1. Add to `package.json` scripts section:
       ```json
       "security:audit": "npm audit --audit-level=high",
       "security:scan": "npm run security:audit"
       ```
  - **Done-when:**
    1. Scripts are present in package.json and executable
  - **Verification:**
    1. Run `npm run security:scan` locally and confirm it executes audit
  - **Depends-on:** None

- [ ] **T006 · Documentation · P2: Document developer workflow for security scanning**
  - **Action:**
    1. Add instructions for running security scans locally
    2. Document process for dealing with found vulnerabilities
  - **Done-when:**
    1. Documentation exists for local security scanning workflow
  - **Verification:**
    1. Follow documentation to perform a local security scan
  - **Depends-on:** [T005]

## Documentation & Policies

- [ ] **T007 · Documentation · P1: Create Security Vulnerability Management Guide**

  - **Action:**
    1. Create `docs/SECURITY_VULNERABILITY_MANAGEMENT.md` including:
       - Purpose of dependency scanning
       - How to interpret audit results
       - Remediation process and guidelines
       - Process for handling false positives or temporarily allowing vulnerabilities
       - Local scan instructions
  - **Done-when:**
    1. Comprehensive document is created with all sections
  - **Verification:**
    1. Document reviewed for completeness and clarity
  - **Depends-on:** [T003]

- [ ] **T008 · Documentation · P2: Update README with Security Scan Information**

  - **Action:**
    1. Add subsection in README under "CI" or "Quality Gates" about security scanning
    2. Link to vulnerability management documentation
  - **Done-when:**
    1. README contains clear information about security scanning in CI
  - **Verification:**
    1. Review README to ensure information is clear and accurate
  - **Depends-on:** [T007]

- [ ] **T009 · Documentation · P2: Update CONTRIBUTING.md with Security Guidelines**
  - **Action:**
    1. Add information about security scanning requirements
    2. Recommend running local scans before creating PRs
    3. Link to vulnerability management documentation
  - **Done-when:**
    1. Contributors are informed about security requirements
  - **Verification:**
    1. Review CONTRIBUTING.md for clarity and completeness
  - **Depends-on:** [T007]

## Baseline & Vulnerability Management

- [ ] **T010 · Chore · P1: Perform Initial Scan and Document Baseline**

  - **Action:**
    1. Run `npm audit` on main branch
    2. Document all existing high/critical vulnerabilities
    3. Prioritize immediate remediation vs. allowlisting with justification
  - **Done-when:**
    1. Baseline report is generated and documented
    2. Remediation priorities are established
  - **Verification:**
    1. Baseline report exists with clear findings
  - **Depends-on:** None

- [ ] **T011 · Chore · P1: Configure Initial Vulnerability Allowlist**
  - **Action:**
    1. For vulnerabilities that cannot be immediately fixed, add to allowlist
    2. Include justification and timeline for each allowlisted vulnerability
    3. Commit allowlist configuration to repository
  - **Done-when:**
    1. Allowlist is created with proper documentation for each entry
    2. Configuration is committed to repository
  - **Verification:**
    1. Review allowlist for proper documentation and justification
  - **Depends-on:** [T003, T010]

## Testing & Validation

- [ ] **T012 · Test · P1: Verify CI Pass Case - No New Vulnerabilities**

  - **Action:**
    1. Create test branch with no new vulnerabilities
    2. Push and trigger CI run
  - **Done-when:**
    1. Security scan stage passes
  - **Verification:**
    1. CI logs show successful security scan
  - **Depends-on:** [T002]

- [ ] **T013 · Test · P1: Verify CI Fail Case - New High/Critical Vulnerability**

  - **Action:**
    1. Create test branch with a dependency known to have high vulnerability
    2. Push and trigger CI run
  - **Done-when:**
    1. CI fails at the security scan stage
    2. Error output clearly indicates the vulnerability
  - **Verification:**
    1. CI logs show vulnerability as cause of failure
  - **Depends-on:** [T002]

- [ ] **T014 · Test · P2: Verify CI Handles Allowlisted Vulnerabilities Correctly**
  - **Action:**
    1. Create test branch with only vulnerabilities that are in allowlist
    2. Push and trigger CI run
  - **Done-when:**
    1. CI passes despite presence of allowlisted vulnerabilities
  - **Verification:**
    1. CI logs show vulnerabilities were detected but allowed per configuration
  - **Depends-on:** [T004, T011]

## Future PNPM Migration Support

- [ ] **T015 · Documentation · P3: Document PNPM Audit Migration Plan**

  - **Action:**
    1. Document how to migrate from npm audit to pnpm audit in CI
    2. Include command differences and configuration changes
  - **Done-when:**
    1. Documentation for future pnpm audit migration exists
  - **Verification:**
    1. Review documentation for accuracy and completeness
  - **Depends-on:** None

- [ ] **T016 · Chore · P3: Create PNPM Audit CI Example**
  - **Action:**
    1. Create example CI configuration using pnpm audit
    2. Document in comments how it differs from npm audit implementation
  - **Done-when:**
    1. Example configuration exists for future reference
  - **Verification:**
    1. Review example for correctness
  - **Depends-on:** [T015]

## Risk Assessment

| Risk                                          | Likelihood | Impact | Mitigation                                                                          |
| --------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------- |
| False positives from npm audit                | Medium     | Medium | Implement allowlist mechanism with proper justification and review                  |
| Audit doesn't catch all vulnerability types   | Medium     | High   | Document that this is only dependency scanning; consider later adding code scanning |
| Developer resistance to security gates        | Medium     | Medium | Clear documentation. Make local testing easy. Provide vulnerability education.      |
| Initial baseline showing many vulnerabilities | High       | Medium | Document phased remediation approach. Focus on preventing regression.               |
| Vulnerabilities in transitive dependencies    | High       | Medium | Set appropriate thresholds and document remediation strategies.                     |
