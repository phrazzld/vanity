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
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 18 or higher
  - We recommend using [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager) to manage Node.js versions
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
