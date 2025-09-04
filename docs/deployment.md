# Deployment Configuration

## Security Headers

The application implements comprehensive security headers configured in `vercel.json` for deployment on Vercel. These headers are essential for protecting against common web vulnerabilities.

### Configuration Overview

All security headers are applied to all routes via the pattern `"source": "/(.*)"`.

### Headers Explained

#### Content-Security-Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' https:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self'
```

- **Purpose**: Controls which resources the browser is allowed to load
- **Key Settings**:
  - `default-src 'self'`: Only allow resources from the same origin by default
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: Allows inline scripts (required for Next.js static export)
  - `style-src 'self' 'unsafe-inline'`: Allows inline styles (required for Tailwind CSS)
  - `img-src 'self' data: https: blob:`: Allows images from self, data URIs, any HTTPS source, and blob URLs
  - `frame-ancestors 'none'`: Prevents clickjacking by disallowing the site in iframes
  - `base-uri 'self'`: Restricts the base URL to same origin
  - `form-action 'self'`: Forms can only submit to same origin

#### Strict-Transport-Security (HSTS)

```
max-age=31536000; includeSubDomains
```

- **Purpose**: Forces HTTPS connections for one year
- **Protection**: Prevents protocol downgrade attacks and cookie hijacking
- **Note**: Once deployed, the site will only be accessible via HTTPS

#### X-Frame-Options

```
DENY
```

- **Purpose**: Prevents the site from being embedded in iframes
- **Protection**: Defends against clickjacking attacks
- **Note**: More restrictive than CSP's frame-ancestors for broader browser support

#### X-Content-Type-Options

```
nosniff
```

- **Purpose**: Prevents browsers from MIME-sniffing responses
- **Protection**: Blocks attacks based on incorrect content-type detection

#### Referrer-Policy

```
strict-origin-when-cross-origin
```

- **Purpose**: Controls how much referrer information is sent with requests
- **Protection**: Prevents leaking sensitive URL information to third parties

#### Permissions-Policy

```
camera=(), microphone=(), geolocation=(), interest-cohort=()
```

- **Purpose**: Disables browser features that aren't needed
- **Protection**: Reduces attack surface by explicitly denying access to sensitive APIs
- **Note**: Also opts out of Google's FLoC tracking

### Testing Security Headers

After deployment, validate the security headers configuration:

1. **Manual Testing**:
   - Open browser DevTools Network tab
   - Load the deployed site
   - Check response headers for any page

2. **Automated Testing**:
   - Visit [securityheaders.com](https://securityheaders.com)
   - Enter your production URL
   - Target: A+ rating

3. **Command Line Testing**:
   ```bash
   curl -I https://your-domain.vercel.app
   ```

### Deployment Process

1. **Local Testing**: Headers can't be tested locally with `npm run dev`
2. **Preview Deployment**: Push to a branch to test headers in Vercel preview
3. **Production**: Merge to main branch for production deployment

### Troubleshooting

**If CSP blocks resources:**

- Check browser console for CSP violations
- Update the appropriate directive in vercel.json
- Test in preview deployment before production

**If site doesn't load after HSTS:**

- HSTS is cached by browsers for the specified duration
- Clear browser cache or use incognito mode for testing
- Ensure SSL certificate is properly configured

### Notes

- These headers are configured at the Vercel platform level, not in Next.js
- Static export mode doesn't support runtime header configuration
- CSP includes `'unsafe-inline'` and `'unsafe-eval'` for Next.js compatibility
- Consider tightening CSP once all inline scripts are identified and can use hashes

## Rollback Procedures

When a deployment introduces critical issues, use these procedures to quickly restore service to a known-good state.

### Method 1: Vercel Dashboard Rollback (Fastest - <1 minute)

**When to use**: Immediate rollback needed for production issues

1. **Access Vercel Dashboard**:

   ```
   https://vercel.com/[your-username]/vanity
   ```

2. **Navigate to Deployments**:
   - Click "Deployments" tab in project view
   - Find the last known-good deployment (marked with green checkmark)

3. **Promote Previous Deployment**:
   - Click the three dots (⋮) menu on the desired deployment
   - Select "Promote to Production"
   - Confirm the promotion

4. **Verify Rollback**:
   - Production URL updates within seconds
   - Check application functionality
   - Monitor error logs in Vercel dashboard

### Method 2: Git Revert (Clean History - ~2-3 minutes)

**When to use**: Need to maintain clean git history and trigger CI/CD

1. **Create Revert Commit**:

   ```bash
   # Revert the last commit
   git revert HEAD

   # Or revert a specific commit
   git revert <commit-hash>
   ```

2. **Push to Main Branch**:

   ```bash
   git push origin main
   ```

3. **Monitor Deployment**:
   - Vercel automatically triggers new deployment
   - Check build logs in Vercel dashboard
   - Verify production site once deployed

### Method 3: Emergency Force Push (Last Resort - ~2-3 minutes)

**When to use**: Multiple bad commits need removal, git revert is complex

⚠️ **WARNING**: This rewrites history and can affect other developers

1. **Reset to Known-Good State**:

   ```bash
   # Reset to previous commit
   git reset --hard HEAD~1

   # Or reset to specific commit
   git reset --hard <known-good-commit-hash>
   ```

2. **Force Push**:

   ```bash
   git push --force origin main
   ```

3. **Notify Team**:
   - Inform all developers of the force push
   - They need to reset their local branches:
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

### Rollback Decision Tree

```
Critical Production Issue Detected
├─ Is immediate rollback needed? (< 1 min)
│  └─ YES → Use Vercel Dashboard Rollback
│
├─ Need to preserve git history?
│  └─ YES → Use Git Revert Method
│
└─ Multiple commits to remove?
   └─ YES → Use Emergency Force Push (with team notification)
```

### Pre-Rollback Checklist

Before initiating rollback:

- [ ] Document the issue (error messages, affected features)
- [ ] Capture current deployment ID from Vercel
- [ ] Save any relevant logs or metrics
- [ ] Notify stakeholders of planned rollback
- [ ] Identify the last known-good deployment

### Post-Rollback Actions

After successful rollback:

1. **Verify Service Restoration**:
   - Test critical user flows
   - Check monitoring dashboards
   - Confirm error rates return to normal

2. **Root Cause Analysis**:
   - Review deployment logs
   - Check git diff between versions
   - Identify the breaking change

3. **Create Fix**:
   - Branch from last known-good commit
   - Implement and test fix thoroughly
   - Deploy to preview environment first

4. **Document Incident**:
   - Create incident report
   - Update runbooks if needed
   - Share learnings with team

### Rollback Testing

Periodically test rollback procedures in non-production:

1. **Preview Environment Test**:

   ```bash
   # Deploy a test branch
   git checkout -b rollback-test
   git push origin rollback-test

   # Practice rollback in Vercel preview
   # Then clean up
   git branch -d rollback-test
   git push origin --delete rollback-test
   ```

2. **Local Simulation**:

   ```bash
   # Create local backup branch
   git branch backup-main

   # Simulate bad commit
   git commit --allow-empty -m "Test bad commit"

   # Practice revert
   git revert HEAD

   # Restore
   git reset --hard backup-main
   git branch -d backup-main
   ```

### Monitoring for Rollback Triggers

Watch for these indicators that may require rollback:

- **Error Metrics**:
  - 5xx error rate > 1%
  - JavaScript errors in browser console
  - Build or deployment failures

- **Performance Degradation**:
  - Page load time > 3 seconds
  - First Contentful Paint > 2 seconds
  - Bundle size increase > 20%

- **Functional Issues**:
  - Images not loading (check CDN allowlist)
  - Navigation failures
  - Data not rendering

### Rollback Communication Template

```markdown
**INCIDENT: Production Rollback Required**

**Time Detected**: [timestamp]
**Affected Service**: vanity production site
**Issue**: [brief description]
**Impact**: [user-facing impact]

**Action Taken**:

- Initiating rollback via [method]
- Rolling back to deployment [ID/hash]
- ETA for restoration: [time]

**Next Steps**:

- Root cause analysis
- Fix development
- Staged re-deployment

**Contact**: [your name/handle]
```
