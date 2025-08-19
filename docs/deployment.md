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
