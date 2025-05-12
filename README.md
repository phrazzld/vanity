# Vanity

[![CI](https://github.com/phrazzld/vanity/actions/workflows/ci.yml/badge.svg)](https://github.com/phrazzld/vanity/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

A personal website built with Next.js, featuring a collection of readings, travel map, and quotes with a minimalist design aesthetic. The project emphasizes type safety, accessibility, and maintainable code architecture.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development Scripts](#development-scripts)
- [Project Structure](#project-structure)
- [Development Philosophy](#development-philosophy)
- [Accessibility](#accessibility)
- [State Management](#state-management)
- [Testing Strategy](#testing-strategy)
- [Git Workflow](#git-workflow)
- [Versioning](#versioning)
- [Continuous Integration](#continuous-integration)
- [Documentation](#documentation)

## Features

- **Readings Collection**: Showcase books and readings with cover images, organized by year and category
- **Travel Map**: Interactive map using Leaflet to display travel locations with custom markers and popups
- **Quote Display**: Animated typewriter effect for displaying quotes with randomization
- **Admin Interface**: Content management system for readings and quotes with authentication
- **Responsive Design**: Optimized for all device sizes using Tailwind's responsive utilities
- **Dark Mode**: Fully implemented dark mode support with theme persistence
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation, semantic HTML, and ARIA attributes
- **State Management**: Hybrid approach with TanStack Query for server state and Zustand for UI state
- **Type Safety**: Strict TypeScript throughout with Prisma-generated types for database models

## Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.4
- **Component Library**: Custom React 19 components
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query v5 (server state) + Zustand v5 (UI state)
- **Maps**: Leaflet/React-Leaflet v5

### Backend

- **API Routes**: Next.js API Routes with Next-Auth v5
- **Database**: PostgreSQL via Neon
- **ORM**: Prisma v6
- **Authentication**: Next-Auth with credential provider
- **Logging**: Winston for structured JSON logging

### Testing & Quality

- **Testing**: Jest with React Testing Library
- **Accessibility Testing**: jest-axe + eslint-plugin-jsx-a11y
- **Component Development**: Storybook v8 with A11y addon
- **Linting**: ESLint v9 with Next.js and TypeScript configs
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Git

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/phrazzld/vanity.git
   cd vanity
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   # Create a .env file with:
   DATABASE_URL="your_neon_connection_string"
   ADMIN_USERNAME="your_admin_username"
   ADMIN_PASSWORD="your_admin_password"
   NEXT_PUBLIC_SPACES_BASE_URL="your_image_hosting_url"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret"
   ```

4. Generate Prisma client and apply migrations

   ```bash
   npm run prisma:generate
   npm run migrate:deploy
   ```

5. Start the development server

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

### Troubleshooting

- **Database Connection Issues**: Ensure your DATABASE_URL is correctly formatted and the database server is accessible.
- **Authentication Issues**: Check that NEXTAUTH_SECRET and NEXTAUTH_URL are properly set.
- **Prisma Errors**: Run `npx prisma studio` to view and manage your database directly.
- **Build Errors**: Check for TypeScript errors with `npm run typecheck`.

## Development Scripts

### Core Development

- `npm run dev` - Start development server with Turbopack
- `npm run dev:log` - Start development server with logging to logs/dev.log
- `npm run logs` - View development logs
- `npm run logs:watch` - Watch development logs in real-time
- `npm run build` - Build for production (includes Prisma generation)
- `npm run start` - Start production server

### Testing

- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:snapshot` - Run snapshot tests only
- `npm run test:snapshot:update` - Update snapshot tests

### Code Quality

- `npm run lint` - Run ESLint on specified files
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting without making changes
- `npm run typecheck` - Run TypeScript type checking

### Database

- `npm run prisma:generate` - Generate Prisma client
- `npm run migrate:deploy` - Apply Prisma migrations
- `npm run migrate:data` - Migrate readings data
- `npm run migrate:quotes` - Migrate quotes data
- `npm run migrate:all` - Run full data migration

### Storybook

- `npm run storybook` - Start Storybook dev server
- `npm run build-storybook` - Build Storybook
- `npm run test-storybook` - Run Storybook tests

### Release

- `npm run release` - Generate new version based on conventional commits
- `npm run release:patch` - Generate a new patch version (0.0.x)
- `npm run release:minor` - Generate a new minor version (0.x.0)
- `npm run release:major` - Generate a new major version (x.0.0)
- `npm run release:dry-run` - Preview what the next version would look like

## Project Structure

```
/
├── prisma/                  # Database schema and migrations
│   ├── migrations/          # Database migration files
│   └── schema.prisma        # Prisma schema definition
├── public/                  # Static assets
│   ├── images/              # Project images
│   └── ...                  # Other static files
├── scripts/                 # Utility scripts for data migration, etc.
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # Admin panel pages
│   │   ├── api/             # API routes
│   │   ├── components/      # React components
│   │   │   ├── keyboard/    # Keyboard navigation components
│   │   │   ├── quotes/      # Quote-related components
│   │   │   └── readings/    # Reading-related components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   ├── lib/                 # Core library code
│   │   ├── api/             # API client functions
│   │   ├── db/              # Database access functions
│   │   └── prisma.ts        # Prisma client instance
│   ├── store/               # Zustand store definitions
│   └── types/               # TypeScript type definitions
├── docs/                    # Documentation files
├── .env.example             # Example environment variables
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

### Key Files

- [`prisma/schema.prisma`](prisma/schema.prisma) - Database schema
- [`src/app/layout.tsx`](src/app/layout.tsx) - Root layout with providers
- [`src/app/page.tsx`](src/app/page.tsx) - Home page
- [`src/lib/db/readings.ts`](src/lib/db/readings.ts) - Reading data access
- [`src/lib/db/quotes.ts`](src/lib/db/quotes.ts) - Quote data access
- [`src/app/api/readings/route.ts`](src/app/api/readings/route.ts) - Readings API
- [`src/app/api/quotes/route.ts`](src/app/api/quotes/route.ts) - Quotes API
- [`src/store/theme.ts`](src/store/theme.ts) - Theme state management
- [`tailwind.config.ts`](tailwind.config.ts) - Design token configuration

## Development Philosophy

This project follows a set of core principles to ensure maintainable, secure, and high-quality code:

### Core Principles

1. **Simplicity First**: Resist unnecessary complexity and over-engineering
2. **Modularity is Mandatory**: Small, focused components with clear responsibilities
3. **Testability by Design**: Code structured for comprehensive testing
4. **Explicit Intent**: Clear, readable code with explicit dependencies
5. **Secure by Default**: Security integrated into the development process
6. **Automate Everything**: Extensive automation for consistency and efficiency

For detailed information, see [DEVELOPMENT_PHILOSOPHY.md](docs/DEVELOPMENT_PHILOSOPHY.md).

### Code Style

- Strict TypeScript with explicit types and minimal use of `any`
- Feature-focused organization rather than technical layers
- Functional components with explicit return types
- Detailed JSDoc comments for components and functions
- Consistent naming conventions (PascalCase for components, camelCase for utilities)

## Accessibility

This project is committed to WCAG 2.1 AA compliance, ensuring the application is usable by people with various disabilities:

### Key Accessibility Features

- Semantic HTML structure with appropriate ARIA attributes
- Keyboard navigation support throughout the application
- Color contrast ratios that meet WCAG standards
- Focus management for modals and interactive elements
- Screen reader compatibility with descriptive alt text and labels

### Keyboard Navigation

The project includes comprehensive keyboard navigation utilities:

- Focus trapping for modals and dialogs
- Arrow key navigation within components
- Skip links to bypass navigation elements
- Focus management and restoration

For more details, see [KEYBOARD_NAVIGATION.md](docs/KEYBOARD_NAVIGATION.md) and [ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

## State Management

The project uses a hybrid approach to state management:

- **Server State**: TanStack Query for data fetching, caching, and synchronization
- **UI State**: Zustand for simple, lightweight global state management
- **Local State**: React's useState and useReducer for component-specific state

This approach separates concerns and provides optimal solutions for different types of state. For details, see [STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md).

## Testing Strategy

The project follows a comprehensive testing approach:

- **Unit Tests**: For utility functions and isolated logic
- **Component Tests**: Using React Testing Library with user-centric approach
- **Integration Tests**: For API routes and data flow
- **Accessibility Tests**: Using jest-axe for automated accessibility checks
- **Snapshot Tests**: For UI regression testing

Guidelines:

- Test behavior, not implementation
- Mock external dependencies only (not internal collaborators)
- Focus on user interactions rather than implementation details

## Git Workflow

### Branch Naming Conventions

- Main branches: `main` or `master`
- Feature branches: `feature/feature-name`
- Bug fix branches: `fix/bug-description`
- Documentation branches: `docs/what-was-documented`
- Refactoring branches: `refactor/what-was-refactored`
- Release branches: `release/vX.Y.Z` (semantic versioning)
- Development branches: `dev` or `develop`
- Planning branches: `plan/plan-description`

### Git Hooks

- **Pre-commit Hooks**: Lint, format, typecheck, and detect sensitive data
- **Post-commit Hooks**: Generate documentation (glance)
- **Pre-push Hooks**: Run tests and enforce branch naming conventions

## Versioning

This project uses semantic versioning based on [Conventional Commits](https://www.conventionalcommits.org/):

- **Patch Version (0.0.x)**: Automatically incremented for `fix:` commits
- **Minor Version (0.x.0)**: Automatically incremented for `feat:` commits
- **Major Version (x.0.0)**: Automatically incremented for commits with `BREAKING CHANGE:` or `feat!:`

The versioning system is managed by [standard-version](https://github.com/conventional-changelog/standard-version), which:

1. Increments the version in package.json based on commit types
2. Generates/updates the CHANGELOG.md file
3. Creates a git tag for the new version

## Continuous Integration

This project uses GitHub Actions for continuous integration:

- **Lint**: Ensures code adheres to project standards
- **Type Check**: Verifies TypeScript type correctness
- **Test**: Runs the full test suite
- **Build**: Verifies the project builds successfully
- **Storybook**: Builds Storybook to ensure component documentation is valid

CI runs on each push to main and on pull requests. Check the [.github/workflows](https://github.com/phrazzld/vanity/actions/workflows/ci.yml) directory for details.

## Documentation

### Project Documentation

- [DEVELOPMENT_PHILOSOPHY.md](docs/DEVELOPMENT_PHILOSOPHY.md) - Core development principles
- [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) - Accessibility guidelines and implementation
- [STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md) - State management approach
- [DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md) - Design system tokens
- [RESPONSIVE_DESIGN.md](docs/RESPONSIVE_DESIGN.md) - Responsive design approach
- [KEYBOARD_NAVIGATION.md](docs/KEYBOARD_NAVIGATION.md) - Keyboard navigation utilities

### Automatically Generated Documentation

The project uses the `glance` tool to automatically generate technical overviews of code directories in `glance.md` files.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
