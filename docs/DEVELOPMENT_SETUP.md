# Development Setup Guide

This guide provides comprehensive instructions for setting up your development environment for the Vanity project. Following these steps will ensure a consistent environment across the team and help you get started quickly.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Storybook](#storybook)
- [Security Audit Filter](#security-audit-filter)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 20 or higher (specified in `.nvmrc`)
  - We recommend using [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager) to manage Node.js versions
  - To use the correct version: `nvm use` (after installing nvm)
- **npm**: Usually comes with Node.js
- **Git**: For version control
- **Docker**: To run the PostgreSQL database locally (optional, but recommended)
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) for macOS and Windows
  - [Docker Engine](https://docs.docker.com/engine/install/) for Linux

### Recommended IDE Setup

- **Visual Studio Code** with the following extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
  - Jest

### Required Accounts

For full functionality, you'll need:

- **GitHub account**: For repository access
- **Neon.tech account**: For PostgreSQL database (for production or cloud development)
  - You can also use a local Docker PostgreSQL instance for development

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/phrazzld/vanity.git
cd vanity
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Git Hooks

The project uses Husky for Git hooks, which should be set up automatically during `npm install`. These hooks ensure code quality by running linters, formatters, and tests before commits and pushes.

#### What Our Git Hooks Do

The project has the following Git hooks in place:

1. **Pre-commit Hook**: Runs automatically before each commit to:

   - Format code using Prettier
   - Run ESLint to check for code quality issues
   - Check for large files (>5MB) and suggest using Git LFS
   - Run TypeScript type checking
   - Block commits with sensitive data or formatting issues

2. **Commit-msg Hook**: Validates commit messages against the Conventional Commits format

3. **Pre-push Hook**: Runs before pushing to remote to:

   - Enforce branch naming conventions
   - Run the complete test suite
   - Prevent pushing if tests fail

4. **Post-commit Hook**: Runs asynchronously after commit to:
   - Update documentation with the Glance tool (non-blocking)

#### Verifying Git Hooks Installation

To verify that Git hooks are properly installed:

```bash
# Check if Husky is set up
ls -la .husky/

# You should see these files:
# - pre-commit
# - commit-msg
# - pre-push
# - post-commit

# Verify commitlint is configured
cat commitlint.config.js

# Test a commit message
echo "feat: test message" | npx commitlint
```

If hooks are missing or not working, reinstall them:

```bash
# Reinstall Husky
npm run prepare

# Or manually install
npx husky install
```

#### Testing Pre-commit Hooks

#### Testing Code Quality Checks

To test if your pre-commit hooks are working correctly:

1. Make a test file with formatting issues:

```javascript
// test.js
const foo = { bar: 'baz', qux: 1 }; // Bad formatting
```

2. Try to commit it:

```bash
git add test.js
git commit -m "test: testing hooks"
```

You should see the pre-commit hook run and automatically fix the formatting.

#### Testing Commit Message Validation

To test commit message validation:

```bash
# This should fail (invalid type)
git commit -m "bad: invalid commit type"

# This should succeed
git commit -m "feat: add new feature"

# This should succeed with scope
git commit -m "fix(api): resolve authentication issue"
```

Valid commit types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

#### Troubleshooting Git Hooks

If Git hooks aren't running:

1. **Check Git version**: Ensure you have Git 2.9 or later
2. **Verify core.hooksPath**: Git should be configured to use Husky's hooks:

```bash
git config core.hooksPath
# Should output: .husky
```

3. **Check file permissions**: Hooks must be executable:

```bash
chmod +x .husky/*
```

4. **Common Issues**:
   - **Hooks not running**: Try running `npm run prepare` again
   - **Formatting conflicts**: Ensure your editor isn't fighting with Prettier
   - **Type errors blocking commits**: Fix TypeScript errors before committing
   - **Large files blocked**: Use Git LFS or exclude large files

## Environment Configuration

### 1. Create Environment Files

Create a `.env.local` file in the project root for local development based on the provided `.env.example`:

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

Open `.env.local` and update the following variables:

```
# For local development with Docker
DATABASE_URL="postgres://postgres:postgres@localhost:5432/vanity"

# Base URL for cover images
NEXT_PUBLIC_SPACES_BASE_URL="https://your-image-host.com"

# Admin authentication credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# NextAuth configuration (required for authentication)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_secret_here" # Generate a secure random string
```

For `NEXTAUTH_SECRET`, you can generate a secure random string using:

```bash
openssl rand -base64 32
```

## Database Setup

You can use either a local PostgreSQL database with Docker or a cloud-based solution like Neon.tech.

### Option 1: Local PostgreSQL with Docker

1. Start the PostgreSQL container:

```bash
docker-compose up -d
```

This will start a PostgreSQL instance with the following configuration:

- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `vanity`

2. Apply database migrations:

```bash
npx prisma migrate deploy
```

3. (Optional) Seed the database with sample data:

```bash
node scripts/seed-database.js
```

### Option 2: Cloud Database with Neon.tech

1. Create a new PostgreSQL database on [Neon.tech](https://neon.tech/)
2. Get your database connection string from Neon dashboard
3. Update your `.env.local` file with the connection string:

```
DATABASE_URL="postgres://username:password@host:port/dbname?sslmode=require"
```

4. Apply database migrations:

```bash
npx prisma migrate deploy
```

### Prisma Studio (Database Management UI)

You can use Prisma Studio to view and edit your database:

```bash
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can browse and modify your data.

## Running the Application

### Development Server

Start the development server with:

```bash
npm run dev
```

This will start the Next.js development server with Turbopack at http://localhost:3000

### Development Server with Logging

If you want to see detailed logs during development:

```bash
npm run dev:log
```

This will start the development server and save logs to `logs/dev.log`. You can view these logs with:

```bash
# View logs
npm run logs

# Watch logs in real-time
npm run logs:watch
```

## Development Workflow

### Code Structure

The project follows a feature-focused organization rather than technical layers:

```
src/
├── app/                 # Next.js App Router
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes
│   ├── components/      # React components
│   │   ├── keyboard/    # Keyboard navigation components
│   │   ├── quotes/      # Quote-related components
│   │   └── readings/    # Reading-related components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── lib/                 # Core library code
│   ├── api/             # API client functions
│   ├── db/              # Database access functions
│   └── prisma.ts        # Prisma client instance
├── store/               # Zustand store definitions
└── types/               # TypeScript type definitions
```

### Making Changes

1. Create a new branch for your feature or fix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

2. Make your changes following the [Development Philosophy](DEVELOPMENT_PHILOSOPHY.md)
3. Run linting and type checking as you work:

```bash
# Run ESLint
npm run lint

# Run TypeScript type checking
npm run typecheck

# Format code with Prettier
npm run format
```

4. Commit your changes using the Conventional Commits format:

```bash
git commit -m "feat: add new component"
# or
git commit -m "fix: resolve issue with auth"
```

### Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Testing

The project uses Jest with React Testing Library for testing. All tests are co-located with the code they test in `__tests__` directories.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only snapshot tests
npm run test:snapshot

# Update snapshots
npm run test:snapshot:update
```

### Writing Tests

- Follow the test patterns documented in `src/test-utils/test-patterns.md`
- Use React Testing Library to test components through user interactions
- Write tests for both happy paths and error states
- Mock only external dependencies, not internal collaborators

## Storybook

Storybook is used for developing and documenting UI components in isolation.

### Running Storybook

```bash
npm run storybook
```

This will start Storybook at http://localhost:6006

### Building Storybook

```bash
npm run build-storybook
```

### Testing Storybook

```bash
npm run test-storybook
```

### Storybook Build Requirements

To ensure your Storybook contributions work correctly in CI and prevent build failures:

#### TypeScript Requirements

Storybook has its own TypeScript configuration (`.storybook/tsconfig.json`) that:

- Includes story files (`*.stories.ts`, `*.stories.tsx`) and Storybook configuration
- Excludes test files to prevent compilation issues
- Uses strict TypeScript checking for story components

#### Pre-commit Validation

The pre-commit hook automatically checks Storybook TypeScript compilation when story files are modified:

```bash
# Manual check (same as pre-commit hook runs)
npx tsc --noEmit --project .storybook/tsconfig.json
```

This check only runs when you stage story files or Storybook configuration changes, keeping commits fast.

#### Build Validation

The pre-push hook runs a full Storybook build verification:

```bash
# Manual full build check (same as pre-push hook runs)
npm run build-storybook
```

#### Common TypeScript Issues in Stories

1. **Component prop types**: Ensure story args match component prop interfaces
2. **Import paths**: Use project path aliases (`@/`) consistently
3. **Story metadata**: Provide proper `Meta` and `StoryObj` types

#### Troubleshooting Storybook Builds

If Storybook builds fail:

1. Run the TypeScript check: `npx tsc --noEmit --project .storybook/tsconfig.json`
2. Fix any TypeScript errors in story files
3. Ensure story files follow the naming convention: `*.stories.{ts,tsx}`
4. Check that component imports are correct and accessible

## Troubleshooting

### Common Issues

#### Database Connection Issues

If you encounter database connection errors:

1. Check if your PostgreSQL container is running:

```bash
docker ps
```

2. Verify your connection string in `.env.local`
3. Try restarting the database:

```bash
docker-compose restart
```

#### Prisma Client Issues

If you have issues with Prisma Client:

```bash
# Regenerate Prisma Client
npx prisma generate
```

#### Next.js Build Errors

For Next.js build errors:

1. Check TypeScript errors:

```bash
npm run typecheck
```

2. Clear Next.js cache:

```bash
rm -rf .next
```

#### Git Hook Issues

If you encounter problems with Git hooks:

```bash
# Reinstall Husky
npm run prepare
```

For more detailed information about Git hooks setup and troubleshooting, see the [Git Hooks Setup section](#3-set-up-git-hooks).

## CI/CD Setup

### Local CI Check Simulation

To run the same checks locally that CI runs:

```bash
# Run all CI checks in sequence
npm run format:check && npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run build-storybook
```

Or create a custom script in your `package.json`:

```json
"scripts": {
  "ci:local": "npm run format:check && npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run build-storybook"
}
```

### VS Code Integration

The project includes VS Code settings for optimal development experience:

- **Format on Save**: Automatically formats with Prettier
- **ESLint Integration**: Shows linting errors in real-time
- **TypeScript Checking**: Real-time type checking

To use these settings:

1. Install recommended extensions (when prompted)
2. Use the workspace settings in `.vscode/settings.json`

### GitHub Actions Workflow

The CI pipeline runs on:

- Every push to `main` or `master` branches
- Every pull request targeting these branches

See `.github/workflows/ci.yml` for the complete workflow configuration.

## Security Audit Filter

The project includes an automated security vulnerability scanner that runs as part of the CI pipeline and can be executed locally. This scanner checks npm audit results against an allowlist of approved vulnerabilities.

### Security Script Build Process

The security audit filter is implemented as a TypeScript script (`scripts/audit-filter.ts`) that compiles to JavaScript before execution. The build process uses a dedicated TypeScript configuration optimized for standalone script compilation.

#### Build Configuration

- **Source**: `scripts/audit-filter.ts`
- **TypeScript Config**: `tsconfig.scripts.json`
- **Output**: `dist/scripts/audit-filter.js`
- **Dependencies**: Core logic in `src/lib/audit-filter/`

#### TypeScript Configuration for Security Scripts

The `tsconfig.scripts.json` file provides specialized compilation settings for security scripts:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": ".",
    "skipLibCheck": true,
    "strict": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["scripts/audit-filter.ts", "src/lib/audit-filter/**/*.ts", "src/lib/logger.ts"],
  "exclude": ["node_modules", "**/*.test.ts", "**/__tests__/**"]
}
```

**Key Configuration Notes**:

- Uses CommonJS modules for Node.js compatibility
- Includes only necessary source files for standalone compilation
- Excludes test files to prevent compilation issues
- Uses project-relative path mapping for internal imports

### Local Testing and Development

#### Available npm Scripts

```bash
# Build the security audit filter script
npm run build:audit-filter

# Run security scan (builds and executes)
npm run security:scan

# Comprehensive local testing (recommended)
npm run security:test
```

#### Local Testing Workflow

For comprehensive validation before pushing to CI:

```bash
# Test the complete security audit filter workflow
npm run security:test
```

This command:

1. Builds the TypeScript script from clean state
2. Verifies the compiled output exists
3. Runs the complete security scan
4. Validates all components work together

#### Manual Testing Steps

For debugging or detailed validation:

```bash
# 1. Clean build
rm -f dist/scripts/audit-filter.js
npm run build:audit-filter

# 2. Verify compilation output
ls -la dist/scripts/audit-filter.js

# 3. Test execution
node dist/scripts/audit-filter.js

# 4. Test with npm wrapper
npm run security:scan
```

### Troubleshooting Security Scan Build Issues

#### Common Build Problems

1. **TypeScript Compilation Failures**

   **Error**: `tsc` fails with module resolution errors

   **Solutions**:

   - Verify `tsconfig.scripts.json` exists and is properly configured
   - Check that all import paths in `scripts/audit-filter.ts` are correct
   - Ensure dependencies in `src/lib/audit-filter/` compile successfully
   - Run `npm run build:audit-filter` to see detailed error messages

2. **Missing Compiled Output**

   **Error**: `dist/scripts/audit-filter.js` not created after build

   **Solutions**:

   - Check TypeScript configuration `outDir` setting
   - Verify `scripts/audit-filter.ts` is included in compilation
   - Look for silent compilation failures in build output
   - Test locally: `npm run build:audit-filter && ls -la dist/scripts/`

3. **Runtime Import Errors**

   **Error**: Module resolution failures when executing compiled script

   **Solutions**:

   - Verify all dependencies are properly resolved in `tsconfig.scripts.json`
   - Check that relative imports use correct paths
   - Ensure `src/lib/audit-filter/core.ts` and dependencies compile correctly
   - Test import resolution: `node -e "require('./dist/scripts/audit-filter.js')"`

#### CI-Specific Issues

1. **Build Verification Failures**

   CI includes dedicated verification steps that check:

   - Compiled script exists at expected path
   - Script is executable and runs without errors
   - All dependencies are properly resolved

   **Debugging**:

   ```bash
   # Local CI simulation
   npm run build:audit-filter
   test -f dist/scripts/audit-filter.js && echo "✅ File exists" || echo "❌ File missing"
   node dist/scripts/audit-filter.js && echo "✅ Execution success" || echo "❌ Runtime error"
   ```

2. **Permission Issues**

   **Error**: Script not executable in CI environment

   **Solution**: CI automatically handles this with `chmod +x` if needed

#### Allowlist Configuration Issues

1. **Invalid JSON Syntax**

   **Error**: Allowlist file parsing fails

   **Solutions**:

   - Validate `.audit-allowlist.json` syntax
   - Check for trailing commas, missing quotes
   - Test: `cat .audit-allowlist.json | jq .`

2. **Schema Validation Failures**

   **Error**: Allowlist entries don't match required schema

   **Solutions**:

   - Ensure all entries have required fields: `id`, `package`, `reason`, `expires`
   - Use ISO 8601 date format for `expires` field
   - Check expiration dates are not in the past

#### Advanced Debugging

For complex issues, enable debug logging:

```bash
# Run with debug output
DEBUG=audit-filter:* npm run security:scan

# Check raw npm audit output
npm audit --json | jq .

# Validate allowlist schema
node -e "
const { allowlistSchema } = require('./dist/src/lib/audit-filter/allowlist.schema.js');
const allowlist = require('./.audit-allowlist.json');
console.log('Valid:', allowlistSchema.safeParse(allowlist));
"
```

### Security Scan Integration

The security audit filter integrates with the development workflow at multiple points:

- **Pre-push Hook**: Runs security scan before pushing code
- **CI Pipeline**: Validates security in dedicated CI job
- **Local Development**: Available via npm scripts for testing

This multi-layered approach ensures security vulnerabilities are caught early and consistently across all environments.

## Troubleshooting CI/CD Issues

### Common CI Failures and Solutions

#### 1. Dependency Installation Failures

**Error**: `npm ci` fails in CI

**Solutions**:

- Ensure `package-lock.json` is committed and up to date
- Run `npm ci` locally to reproduce the issue
- Check if you have access to all npm registries
- Try deleting `node_modules` and `package-lock.json`, then run `npm install`

#### 2. Prisma Client Generation Failures

**Error**: Prisma client generation fails

**Solutions**:

- Check `prisma/schema.prisma` for syntax errors
- Run `npm run prisma:generate` locally
- Ensure database URL is properly configured (not needed for generation)

#### 3. TypeScript Errors Only in CI

**Error**: Type errors that don't appear locally

**Solutions**:

- Run `npm run typecheck` locally
- Check if `tsconfig.json` includes all necessary files
- Ensure your local TypeScript version matches CI
- Clear TypeScript cache: `rm -rf node_modules/.cache/typescript`

#### 4. Test Coverage Failures

**Error**: Coverage below threshold

**Solutions**:

- Run `npm run test:coverage` locally
- Check coverage requirements in `jest.config.js`
- Add tests for uncovered code
- Global minimum: 85%
- Core logic (api/, lib/) minimum: 90%

#### 5. Build Memory Issues

**Error**: JavaScript heap out of memory

**Solutions**:

- Increase Node.js memory limit: `NODE_OPTIONS='--max-old-space-size=8192' npm run build`
- Check for memory leaks in build process
- Optimize imports and bundle size

### Environment-Specific Issues

#### Local vs CI Environment Differences

1. **Environment Variables**:

   - CI doesn't have `.env.local` - uses GitHub secrets
   - Check which variables are required for build

2. **Node.js Version**:

   - Ensure local version matches CI (v20)
   - Use `nvm use` to switch to correct version

3. **Platform Differences**:
   - CI runs on Ubuntu
   - Local might be macOS or Windows
   - File path and case sensitivity issues

#### Debugging CI Failures

1. **Check CI Logs**:

   - Each step provides detailed error messages
   - Look for the specific command that failed

2. **Reproduce Locally**:

   ```bash
   # Clean environment
   rm -rf node_modules .next

   # Fresh install
   npm ci

   # Run failing command
   npm run [command]
   ```

3. **Compare Environments**:

   ```bash
   # Check Node version
   node --version

   # Check npm version
   npm --version

   # Check installed packages
   npm list
   ```

## Additional Resources

- [README.md](../README.md): Project overview and features
- [DEVELOPMENT_PHILOSOPHY.md](DEVELOPMENT_PHILOSOPHY.md): Core development principles
- [DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md](DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md): TypeScript-specific standards
- [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md): State management approach
- [DESIGN_TOKENS.md](DESIGN_TOKENS.md): Design system tokens
- [ACCESSIBILITY.md](ACCESSIBILITY.md): Accessibility guidelines
- [KEYBOARD_NAVIGATION.md](KEYBOARD_NAVIGATION.md): Keyboard navigation utilities
- [Next.js Documentation](https://nextjs.org/docs): Official Next.js documentation
- [Prisma Documentation](https://www.prisma.io/docs): Official Prisma documentation
- [TanStack Query Documentation](https://tanstack.com/query/latest): Official TanStack Query documentation
- [Zustand Documentation](https://zustand-demo.pmnd.rs/): Official Zustand documentation
