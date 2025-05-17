# T006: Node.js Version and Build Command Analysis

## Current Configuration Comparison

### Node.js Versions

| Environment       | Node.js Version | Location                                |
| ----------------- | --------------- | --------------------------------------- |
| GitHub Actions CI | v20             | `.github/workflows/ci.yml` line 21      |
| Vercel            | v20             | `vercel.json` line 8 (env.NODE_VERSION) |
| package.json      | Not specified   | No engines field                        |
| .nvmrc            | Not present     | File doesn't exist                      |

✅ **Status**: Node.js versions are already aligned (both using v20)

### Build Commands

#### GitHub Actions CI Build Process

```bash
1. npm ci                    # Install dependencies
2. npm run prisma:generate   # Generate Prisma client
3. npm run format:check      # Check Prettier formatting
4. npm run lint              # Run ESLint
5. npm run typecheck         # TypeScript type checking
6. npm run test:coverage     # Run tests with coverage
7. npm run build             # Next.js build
8. npm run build-storybook   # Storybook build
```

#### Vercel Build Process

```bash
1. npm ci                    # Install dependencies (installCommand)
2. npm run prisma:generate && NODE_OPTIONS='--max-old-space-size=4096' npm run build  # Build command
```

### Quality Checks Comparison

| Quality Check            | GitHub Actions CI          | Vercel                                      |
| ------------------------ | -------------------------- | ------------------------------------------- |
| Dependency Installation  | ✅ npm ci                  | ✅ npm ci                                   |
| Prisma Client Generation | ✅ Separate step           | ✅ In build command                         |
| Format Check             | ✅ npm run format:check    | ❌ Not performed                            |
| Linting                  | ✅ npm run lint            | ❌ Not performed                            |
| Type Check               | ✅ npm run typecheck       | ❌ Not performed                            |
| Tests                    | ✅ npm run test:coverage   | ❌ Not performed                            |
| Next.js Build            | ✅ npm run build           | ✅ npm run build                            |
| Storybook Build          | ✅ npm run build-storybook | ❌ Skipped (SKIP_STORYBOOK=true)            |
| Memory Optimization      | ❌ Not set                 | ✅ NODE_OPTIONS='--max-old-space-size=4096' |

## Findings

1. **Node.js versions are already aligned** - Both environments use Node.js v20
2. **Vercel skips quality checks** - Vercel only runs Prisma generation and Next.js build
3. **Memory optimization** - Vercel includes memory optimization for builds
4. **Storybook** - Vercel explicitly skips Storybook builds

## Recommendations

### Option 1: Keep Current Setup (Recommended)

- Vercel focuses on deployment-specific tasks
- CI handles comprehensive quality checks
- This separation of concerns is appropriate

**Rationale:**

- Quality checks (linting, formatting, tests) should gate PRs in CI
- Deployment builds should be fast and focused
- Memory optimization is only needed for resource-constrained Vercel environment

### Option 2: Add Some Quality Checks to Vercel

If we want additional safety in deployments, we could add:

```json
"buildCommand": "npm run typecheck && npm run prisma:generate && NODE_OPTIONS='--max-old-space-size=4096' npm run build"
```

### Option 3: Full CI Parity (Not Recommended)

Running all CI checks in Vercel would significantly slow deployments and duplicate work.

## Action Items

1. Add `.nvmrc` file to document Node.js version
2. Consider adding `engines` field to package.json
3. Document the deployment strategy in CONTRIBUTING.md
