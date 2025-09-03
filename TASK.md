# TASK: Fix Next.js SSRF Vulnerability

- [ ] **[SECURITY]** Fix Next.js SSRF vulnerability (CVE GHSA-4342-x723-ch2f) | **Effort: S** | Update to patched Next.js version

---

# Enhanced Specification

## Research Findings

### Critical Discovery: Wildcard Image Configuration Vulnerability

**IMMEDIATE SECURITY ISSUE IDENTIFIED**: The Next.js configuration contains wildcard `remotePatterns` that create a significant SSRF attack vector:

```typescript
// Current VULNERABLE configuration in next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**', // CRITICAL: Allows ANY HTTPS domain
      pathname: '**',
    },
    {
      protocol: 'http',
      hostname: '**', // CRITICAL: Allows ANY HTTP domain
      pathname: '**',
    },
  ];
}
```

This configuration allows attackers to use your image optimization endpoint to make requests to any external or internal URL, potentially accessing sensitive resources.

**IMPORTANT NOTE**: DigitalOcean Spaces is NOT used - that's outdated information. Actual image sources found in content:

- Amazon CDN (m.media-amazon.com, images-na.ssl-images-amazon.com)
- BigCommerce CDN (cdn11.bigcommerce.com)
- Pinterest (i.pinimg.com)
- Flixster (resizing.flixster.com)

### CVE-2022-39254 / GHSA-4342-x723-ch2f Analysis

**Vulnerability Details:**

- **Type**: Server-Side Request Forgery (SSRF) in Next.js Image Optimization
- **CVSS Score**: 7.5 (High) - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`
- **Affected Versions**: Next.js 10.0.0 through 12.3.1
- **Your Version**: 15.3.4 (likely already patched for original CVE)
- **Real Risk**: Wildcard configuration creates same vulnerability regardless of version

**Attack Mechanism:**

1. Attacker crafts request to `/_next/image?url=http://internal-service/`
2. Your wildcard configuration allows ANY domain
3. Next.js server makes request on attacker's behalf
4. Internal resources or cloud metadata could be exposed

### Codebase Integration Patterns Found

**Existing Security Infrastructure:**

- Comprehensive security headers in `vercel.json` (lines 15-45)
- Pre-push security scanning hooks in `.husky/pre-push-security`
- URL validation utility in `src/lib/utils/readingUtils.ts:114-138`
- Bundle size monitoring with strict limits (55kb main, 45kb framework)

**Image Usage Patterns:**

- Reading cover images from multiple external CDNs (Amazon, BigCommerce, Pinterest, Flixster)
- Local optimized images in `/public/images/readings/`
- Static export configuration limits some attack surfaces
- NEXT_PUBLIC_SPACES_BASE_URL environment variable is obsolete and should be removed

## Detailed Requirements

### Functional Requirements

1. **[FR-1] Restrict Image Domains**
   - **Description**: Replace wildcard patterns with specific allowed domains
   - **Acceptance Criteria**:
     - Only specified domains can be used for image optimization
     - All existing content images continue to load
     - No broken images in production

2. **[FR-2] Update Next.js Version**
   - **Description**: Ensure running latest patched Next.js version
   - **Acceptance Criteria**:
     - Next.js version >= 15.4.7
     - All existing functionality maintains compatibility
     - React 19.0.0 compatibility preserved

3. **[FR-3] Security Validation**
   - **Description**: Implement tests to verify SSRF protection
   - **Acceptance Criteria**:
     - Tests verify internal IPs are rejected
     - Tests verify redirect following is blocked
     - Security headers properly configured

### Non-Functional Requirements

- **Performance**: Bundle size must remain under configured limits (55kb main chunk)
- **Security**: Zero tolerance for SSRF vulnerabilities
- **Availability**: Zero-downtime deployment via Vercel preview deployments
- **Compatibility**: Maintain React 19.0.0 and Turbopack compatibility

## Architecture Decisions

### ADR-002: Fix Next.js SSRF Vulnerability

**Status**: Proposed  
**Date**: 2025-01-05  
**Confidence**: 95%

**Decision**: Update Next.js and restrict image domain patterns

**Context:**

- Wildcard image patterns create SSRF vulnerability
- Static site with public content (low data sensitivity)
- Vercel deployment provides safe rollback options

**Consequences:**

- **Positive**: Eliminates SSRF attack vector, improves security posture
- **Negative**: Potential breaking changes, requires image audit
- **Neutral**: Bundle size impact expected to be minimal

### Technology Stack

- **Next.js**: Update to 15.4.7+ (latest stable)
- **Image Sources**: Restrict to specific CDNs (Amazon, BigCommerce, Pinterest, Flixster) + local images
- **Deployment**: Vercel with preview deployments
- **Security**: CSP headers via meta tags (static export limitation)

## Implementation Strategy

### Phase 1: Image Domain Audit (10 mins)

```bash
# Find all external image sources in content
grep -r "coverImage:" content/readings/ | grep -E "https?://" | cut -d'"' -f2 | cut -d'/' -f3 | sort -u

# Expected domains based on actual content:
# - m.media-amazon.com
# - images-na.ssl-images-amazon.com
# - cdn11.bigcommerce.com
# - i.pinimg.com
# - resizing.flixster.com
```

### Phase 2: Configuration Update (15 mins)

```typescript
// next.config.ts - Replace wildcard patterns
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'm.media-amazon.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'images-na.ssl-images-amazon.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'cdn11.bigcommerce.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'i.pinimg.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'resizing.flixster.com',
      port: '',
      pathname: '/**',
    },
  ];
}
```

### Phase 3: Next.js Update (20 mins)

```bash
# Create feature branch
git checkout -b security/ssrf-fix

# Update Next.js
npm update next@latest

# Verify no breaking changes
npm run typecheck
npm run lint
npm run build
```

### Phase 4: Security Validation (15 mins)

```bash
# Test SSRF protection
npm test -- --testNamePattern="security"

# Manual verification
npm run dev
# Try loading images from allowed domains
# Verify blocked domains return 400
```

### MVP Definition

1. Wildcard patterns removed from configuration
2. Specific domains allowlisted
3. All existing images continue to work

## Integration Requirements

### Existing System Impact

- **Image Loading**: All reading cover images must continue working
- **CLI Tool**: Image optimization in CLI must respect new restrictions
- **Build Process**: Static generation must complete without errors

### Validation Points

```javascript
// Test internal IP blocking
GET /_next/image?url=http://169.254.169.254/&w=128 // Should return 400

// Test allowed domains
GET /_next/image?url=https://m.media-amazon.com/images/I/test.jpg&w=128 // Should return 200
GET /_next/image?url=https://cdn11.bigcommerce.com/test.jpg&w=128 // Should return 200

// Test disallowed external domain
GET /_next/image?url=https://evil.com/image.jpg&w=128 // Should return 400
```

## Testing Strategy

### Security Testing

```javascript
describe('SSRF Protection', () => {
  test('rejects internal IP addresses', async () => {
    const internalIPs = [
      '127.0.0.1',
      '169.254.169.254', // AWS metadata
      '10.0.0.1',
      '192.168.1.1',
    ];

    for (const ip of internalIPs) {
      const response = await fetch(`/_next/image?url=http://${ip}/&w=128`);
      expect(response.status).toBe(400);
    }
  });

  test('allows configured domains', async () => {
    const allowedDomains = [
      'https://m.media-amazon.com/test.jpg',
      'https://images-na.ssl-images-amazon.com/test.jpg',
      'https://cdn11.bigcommerce.com/test.jpg',
      'https://i.pinimg.com/test.jpg',
      'https://resizing.flixster.com/test.jpg',
    ];

    for (const url of allowedDomains) {
      const response = await fetch(`/_next/image?url=${url}&w=128`);
      expect(response.status).not.toBe(400);
    }
  });
});
```

### Regression Testing

- Run full test suite: `npm test`
- Verify bundle sizes: `npm run build`
- Check TypeScript: `npm run typecheck`
- Validate all reading images load

## Deployment Considerations

### Vercel Deployment Strategy

```bash
# 1. Push to feature branch for preview
git push origin security/ssrf-fix

# 2. Validate preview deployment
# - Check all images load correctly
# - Test SSRF protection
# - Verify no console errors

# 3. Merge to production
git checkout main
git merge security/ssrf-fix
git push origin main
```

### Rollback Plan

```bash
# Option 1: Git revert
git revert HEAD && git push

# Option 2: Vercel instant rollback
# Use Vercel dashboard → Deployments → Rollback

# Option 3: Emergency fix
git reset --hard HEAD~1
git push --force origin main
```

### Monitoring & Observability

- Monitor image 404 errors post-deployment
- Check for increased latency on image loads
- Verify no legitimate images are blocked

## Success Criteria

### Security Metrics

- [ ] No wildcard patterns in image configuration
- [ ] SSRF test suite passes 100%
- [ ] npm audit shows no high/critical vulnerabilities

### Functional Metrics

- [ ] All existing reading images load correctly
- [ ] Build completes without errors
- [ ] Bundle size within limits (55kb main chunk)

### Performance Metrics

- [ ] Deployment time < 2 minutes
- [ ] No increase in image load latency
- [ ] Core Web Vitals maintained

## Risk Analysis

### Technical Risks

- **Risk 1**: Missed external image domain → **Mitigation**: Comprehensive audit before changes
- **Risk 2**: React 19 compatibility → **Mitigation**: Test in preview deployment first
- **Risk 3**: Bundle size increase → **Mitigation**: Monitor with existing bundlesize config

### Operational Risks

- **Risk 1**: Production image breakage → **Mitigation**: Staged deployment via previews
- **Risk 2**: Rollback complexity → **Mitigation**: Multiple rollback options prepared

## Future Enhancements

### Post-Fix Security Hardening

1. Remove obsolete NEXT_PUBLIC_SPACES_BASE_URL environment variable
2. Implement Content Security Policy via meta tags
3. Add rate limiting for image optimization endpoint
4. Implement automated security scanning in CI/CD

### Long-term Improvements

1. Consider self-hosting images to eliminate external dependencies
2. Implement image proxy service for better control
3. Add security monitoring and alerting

## Validation Checklist

- [ ] All external image domains identified and documented (Amazon, BigCommerce, Pinterest, Flixster)
- [ ] Wildcard patterns removed from configuration
- [ ] Specific domains added to allowlist
- [ ] Next.js updated to latest stable version
- [ ] Security tests implemented and passing
- [ ] Preview deployment validated
- [ ] Production deployment successful
- [ ] All images loading correctly
- [ ] Bundle size within limits
- [ ] No console errors or warnings
