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
   
   For better security, use a bcrypt hashed password instead of plaintext:
   ```
   # Generate a secure password hash
   node scripts/generate-hash.js your_secure_password
   
   # Then use the generated hash in your .env file
   ADMIN_PASSWORD="$2b$10$hash_value_here"
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

## Documentation

Core documentation can be found in these key files:

- `BEST-PRACTICES.md` - Development and security best practices
- `/docs/SECURITY.md` - Comprehensive security architecture and implementation
- `/docs/DATABASE.md` - Database setup and management instructions
- `/docs/TEST_STRATEGY.md` - Testing approach and guidelines

Additional technical documentation can be found in the `/docs` directory for specific implementation details.