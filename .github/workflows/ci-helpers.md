# CI Helper Documentation

This document provides additional context for CI failures.

## Common CI Failure Fixes

### 📦 Dependency Installation Failures

**Symptoms:**

- `npm ci` fails
- `EACCES` permission errors
- Registry connection issues

**Fixes:**

1. Delete `node_modules` and run `npm ci` locally
2. Ensure `package-lock.json` is up to date
3. Check npm registry access
4. Verify Node.js version matches CI (v20)

### 🎨 Formatting Issues

**Quick Fix:**

```bash
npm run format
git add -A
git commit -m "style: fix formatting"
git push
```

**Prevention:**

- Enable format-on-save in VS Code
- Use the recommended VS Code settings
- Install Prettier extension

### 🔍 Linting Errors

**Common Issues:**

- Unused variables: prefix with `_` (e.g., `_unusedVar`)
- Missing semicolons: Prettier should handle this
- Import order: Use auto-fix

**Fix Commands:**

```bash
npm run lint:fix    # Auto-fix what's possible
npm run lint        # See remaining issues
```

### 📝 TypeScript Errors

**Common Issues:**

- Missing type annotations
- Type mismatches
- Implicit `any` types

**Best Practices:**

- Always specify return types
- Use strict mode
- Avoid `any`, use `unknown` instead

### 🧪 Test Failures

**Debugging Steps:**

1. Run locally: `npm test`
2. Run specific test: `npm test -- <pattern>`
3. Update snapshots: `npm test -- -u`
4. Check coverage: `npm run test:coverage`

**Coverage Requirements:**

- Global: 85%
- Core modules (api/, lib/): 90%

### 🔨 Build Failures

**Common Causes:**

- Missing environment variables
- TypeScript errors
- Import issues
- Memory limitations

**Debug Commands:**

```bash
npm run build       # Local build
npm run typecheck   # Check types only
```

### 📚 Storybook Build Issues

**Debug Steps:**

1. Run Storybook locally: `npm run storybook`
2. Check story syntax
3. Verify component imports
4. Review `.storybook/` config files

## Getting Help

If you're stuck:

1. Check the error message carefully
2. Run the failing command locally
3. Review relevant documentation
4. Ask in the team chat
5. Create an issue if it's a persistent problem

## Useful Links

- [Contributing Guide](../../CONTRIBUTING.md)
- [Development Setup](../../docs/DEVELOPMENT_SETUP.md)
- [Development Philosophy](../../docs/DEVELOPMENT_PHILOSOPHY.md)
- [TypeScript Appendix](../../docs/DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md)
