# Vanity

A personal website built with Next.js, featuring a collection of readings, travel map, and quotes with a minimalist design aesthetic.

## Features

- **Readings Collection**: Showcase books and readings with cover images
- **Travel Map**: Interactive map using Leaflet to display travel locations
- **Quote Display**: Animated typewriter effect for displaying quotes
- **Admin Interface**: Content management system for readings and quotes
- **Responsive Design**: Optimized for all device sizes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Neon
- **ORM**: Prisma
- **Authentication**: Next-Auth
- **Testing**: Jest with React Testing Library
- **Maps**: Leaflet/React-Leaflet

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository

   ```
   git clone https://github.com/phrazzld/vanity.git
   cd vanity
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set up environment variables

   ```
   # Create a .env file with:
   DATABASE_URL="your_neon_connection_string"
   ADMIN_USERNAME="your_admin_username"
   ADMIN_PASSWORD="your_admin_password"
   NEXT_PUBLIC_SPACES_BASE_URL="your_image_hosting_url"
   ```

4. Generate Prisma client

   ```
   npm run prisma:generate
   ```

5. Run database migrations

   ```
   npm run migrate:deploy
   ```

6. Start the development server
   ```
   npm run dev
   ```

## Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run dev:log` - Start development server with logging
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting without making changes
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint-staged` - Run pre-commit checks (formatting, linting, type checking, sensitive data detection, and large file detection)
- `npm run release` - Generate a new version based on conventional commits
- `npm run release:patch` - Generate a new patch version (0.0.x)
- `npm run release:minor` - Generate a new minor version (0.x.0)
- `npm run release:major` - Generate a new major version (x.0.0)
- `npm run release:dry-run` - Preview what the next version release would look like

## Data Management

- `npm run migrate:data` - Migrate readings data
- `npm run migrate:quotes` - Migrate quotes data
- `npm run migrate:all` - Run full data migration

## Project Structure

- `/src/app` - Next.js application routes and pages
- `/src/app/components` - Reusable React components
- `/src/app/api` - API routes for data operations
- `/src/lib/db` - Database operations
- `/src/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations
- `/docs` - Project documentation
- `/public` - Static assets

## Git Hooks and Security

This project uses Git hooks to enforce code quality and prevent sensitive data from being committed:

- **Pre-commit Hooks**: Before each commit, the following checks are run:

  - ESLint - Ensures code adheres to project standards
  - Prettier - Verifies consistent code formatting
  - TypeScript - Checks for type errors
  - Sensitive Data Detection - Prevents accidental commit of API keys, tokens, or secrets
  - Large File Detection - Blocks files > 5MB to keep the repository lean

- **Post-commit Hooks**: After each commit, these tasks run asynchronously:

  - Code Documentation Generation - Runs `glance ./` to update directory overview files
  - Documentation is only regenerated when necessary (based on file changes)

- **Pre-push Hooks**: Before pushing to the remote repository:
  - Complete Test Suite - Runs all tests to ensure code quality
  - Branch Naming Convention - Enforces standardized branch naming

### Branch Naming Conventions

The pre-push hook enforces the following branch naming patterns:

- Main branches: `main` or `master`
- Feature branches: `feature/feature-name`
- Bug fix branches: `fix/bug-description`
- Documentation branches: `docs/what-was-documented`
- Refactoring branches: `refactor/what-was-refactored`
- Release branches: `release/vX.Y.Z` (semantic versioning)
- Development branches: `dev` or `develop`
- Planning branches: `plan/plan-description`

This ensures consistent naming across the project and improves integration with tools that rely on branch names.

### Working with Large Files

For files exceeding 5MB:

- Consider using Git LFS (Large File Storage)
- Store assets externally and reference their URLs
- Split large data files into smaller chunks

### Avoiding Sensitive Data

Never commit:

- API keys or tokens
- Passwords or secrets
- Private keys or certificates
- Environment files (except example templates)

Instead:

- Use environment variables
- Store secrets in a secure vault
- Document required environment variables in `.env.example`

## Versioning

This project uses semantic versioning based on [Conventional Commits](https://www.conventionalcommits.org/):

- **Patch Version (0.0.x)**: Automatically incremented for `fix:` commits
- **Minor Version (0.x.0)**: Automatically incremented for `feat:` commits
- **Major Version (x.0.0)**: Automatically incremented for commits with `BREAKING CHANGE:` or `feat!:`

The versioning system is managed by [standard-version](https://github.com/conventional-changelog/standard-version), which:

1. Increments the version in package.json based on commit types
2. Generates/updates the CHANGELOG.md file
3. Creates a git tag for the new version

### Release Process

To create a new release:

1. Make sure all changes are committed with conventional commit messages
2. Run one of the following commands:
   - `npm run release` - Let the system determine the version increment
   - `npm run release:patch` - Force a patch version increment
   - `npm run release:minor` - Force a minor version increment
   - `npm run release:major` - Force a major version increment
3. Push changes and tags to the repository with `git push --follow-tags origin <branch>`

## Documentation

### Automatically Generated Documentation

This project uses the `glance` tool to automatically generate technical overviews of code directories:

- **What it does**: Analyzes code directories and creates `glance.md` files with summaries of:

  - High-level purpose and architecture
  - Key file roles and responsibilities
  - Major dependencies and patterns
  - Implementation details
  - Special gotchas and constraints
  - Recommendations for improvement

- **When it runs**: Automatically after each commit through a post-commit hook

  - Runs asynchronously (won't block your workflow)
  - Only regenerates when necessary based on file changes

- **Viewing documentation**: Look for `glance.md` files in major directories
  - These provide up-to-date technical overviews of each module
  - Great for onboarding new developers or understanding unfamiliar areas of the codebase

### Additional Documentation

More documentation can be found in the repository:

- `DATABASE.md` - Database setup instructions
- `TEST_STRATEGY.md` - Testing approach and guidelines
- `MIGRATION_STEPS.md` - Data migration procedures
- `COMMIT_CONVENTION.md` - Commit message guidelines and standards
