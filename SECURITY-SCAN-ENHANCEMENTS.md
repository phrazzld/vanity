# Security Scanning Enhancements

This document outlines recommended security scanning tools and enhancements to strengthen the current security_scan job in our CI pipeline.

## Current Security Scanning

The existing CI workflow includes a security_scan job that primarily:

1. Builds a custom audit-filter script
2. Runs npm audit with a vulnerability allowlist system

While this provides basic protection against known vulnerabilities in dependencies, modern security best practices recommend a more comprehensive approach.

## Recommended Security Tools

### 1. Static Application Security Testing (SAST)

**Tool Recommendations:**

#### ESLint Security Plugins

- **eslint-plugin-security**: Identifies potential security hotspots in JavaScript/TypeScript code
- **@typescript-eslint/eslint-plugin**: Can enforce security-related rules

Implementation:

```yaml
- name: Run security linting
  run: |
    npm install --no-save eslint-plugin-security
    npx eslint --plugin security --config .eslintrc.security.js src/
```

#### CodeQL Analysis

- GitHub's native static analysis tool
- Identifies vulnerabilities including SQL injection, XSS, etc.

Implementation:

```yaml
jobs:
  codeql-analysis:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

### 2. Secrets Scanning

**Tool Recommendations:**

#### TruffleHog

- Scans for credentials, API keys, and tokens in code
- Works with git history to find previously committed secrets

Implementation:

```yaml
- name: Check for secrets with TruffleHog
  run: |
    pip install trufflehog
    trufflehog --regex --entropy=False --max_depth=50 .
```

#### Git-secrets

- Prevents committing passwords, API keys, and other sensitive information

Implementation:

```yaml
- name: Check for secrets with git-secrets
  run: |
    git clone https://github.com/awslabs/git-secrets.git
    cd git-secrets && make install && cd ..
    git secrets --register-aws
    git secrets --scan
```

### 3. Dependency Scanning

**Tool Recommendations:**

#### Trivy

- Comprehensive vulnerability scanner for containers and applications
- Detects vulnerabilities in dependencies, OS packages, etc.

Implementation:

```yaml
- name: Scan dependencies with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    format: 'table'
    exit-code: '1'
    severity: 'CRITICAL,HIGH'
```

#### Snyk

- Advanced dependency vulnerability scanning
- Can automatically create fix PRs

Implementation:

```yaml
- name: Run Snyk to check for vulnerabilities
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    command: test
```

### 4. CycloneDX Software Bill of Materials (SBOM)

Generate an SBOM to track all dependencies and identify supply chain risks:

```yaml
- name: Generate CycloneDX SBOM
  run: |
    npm install -g @cyclonedx/cyclonedx-npm
    cyclonedx-npm --output sbom.xml
```

### 5. Security Testing for Next.js Specifics

**Tool Recommendations:**

#### next-secure-headers

- Check for proper security headers implementation

Implementation:

```yaml
- name: Check Next.js security headers
  run: |
    curl -s -I https://$DEPLOY_URL | grep -E 'Strict-Transport-Security|Content-Security-Policy|X-Content-Type-Options'
```

## Implementation Plan

### Phase 1: Essential Security Tools

1. Add ESLint security plugins to identify code-level vulnerabilities
2. Implement secrets scanning with TruffleHog
3. Enhance dependency scanning beyond npm audit

### Phase 2: Advanced Security Integration

1. Set up CodeQL analysis
2. Implement SBOM generation with CycloneDX
3. Add Snyk continuous monitoring

### Phase 3: Pre-commit and Developer Tooling

1. Implement security checks in pre-commit hooks
2. Create developer documentation for security best practices
3. Set up automated security fix PRs

## Recommended CI Workflow Updates

Here's a sketch of how to enhance the existing security_scan job:

```yaml
security_scan:
  name: Security Vulnerability Scan
  runs-on: ubuntu-latest
  needs: build-and-test

  steps:
    # Existing steps...

    - name: Run ESLint security scan
      run: |
        npm install --no-save eslint-plugin-security
        npx eslint --plugin security --config .eslintrc.security.js src/

    - name: Check for secrets
      run: |
        pip install trufflehog
        trufflehog --regex --entropy=False --max_depth=50 .

    - name: Run dependency scanning
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        format: 'table'
        exit-code: '1'
        severity: 'CRITICAL,HIGH'

    - name: Generate SBOM
      run: |
        npm install -g @cyclonedx/cyclonedx-npm
        cyclonedx-npm --output sbom.xml

    - name: Upload SBOM
      uses: actions/upload-artifact@v4
      with:
        name: sbom
        path: sbom.xml
```

## Integration with Pre-Push Hook (T020)

To satisfy task T020 from TODO.md, we can implement a streamlined version of these security checks in a pre-push Git hook:

```bash
#!/bin/bash
# Pre-push hook for security scanning

# Run npm audit with allowlist filtering
echo "Running security scan..."
npm run security:scan || {
  echo "❌ Security vulnerabilities detected!"
  echo "Run 'npm run security:scan' locally for details"
  exit 1
}

# Run quick ESLint security scan
npx eslint --plugin security --config .eslintrc.security.js src/ || {
  echo "❌ Security issues found in code!"
  exit 1
}

# Perform quick secret scan
if command -v trufflehog &> /dev/null; then
  trufflehog --regex --entropy=False --max_depth=10 . || {
    echo "❌ Potential secrets detected in code!"
    exit 1
  }
fi

exit 0
```

## Resources and References

- [OWASP Top 10 for Web Applications](https://owasp.org/www-project-top-ten/)
- [GitHub Advanced Security documentation](https://docs.github.com/en/github/getting-started-with-github/about-github-advanced-security)
- [Snyk documentation](https://docs.snyk.io/)
- [TruffleHog documentation](https://github.com/trufflesecurity/trufflehog)
- [CycloneDX SBOM standard](https://cyclonedx.org/)
- [NIST Secure Software Development Framework](https://csrc.nist.gov/Projects/ssdf)
