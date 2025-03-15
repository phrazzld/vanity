# TODO

## Assumptions
- We're migrating from hardcoded data in TypeScript files to a Neon Postgres database
- The project will be deployed on Vercel, requiring a serverless-compatible database
- The existing data structure in the code files should be preserved in the database schema
- No additional features beyond data migration are required at this time

## Database Setup

- [x] Create Neon Postgres database account
  - Description: Sign up at neon.tech and create a new Postgres database instance
  - Dependencies: None
  - Priority: High

- [x] Install and initialize Prisma
  - Description: Install required Prisma packages and initialize with PostgreSQL provider
  - Dependencies: None
  - Priority: High
  
- [x] Configure environment variables
  - Description: Create .env file with DATABASE_URL and add to .gitignore
  - Dependencies: Neon database creation
  - Priority: High

## Schema Definition

- [x] Define Reading model in schema.prisma
  - Description: Create Reading model with all fields matching the current data structure
  - Dependencies: Prisma initialization
  - Priority: High

- [x] Define Quote model in schema.prisma
  - Description: Create Quote model with text and author fields
  - Dependencies: Prisma initialization
  - Priority: High

- [x] Run initial migration
  - Description: Execute Prisma migrate to create database tables
  - Dependencies: Schema definition
  - Priority: High

## Data Migration

- [x] Create migration script
  - Description: Develop a script to transfer data from hardcoded arrays to database
  - Dependencies: Database schema, Prisma client generation
  - Priority: High

- [x] Execute data migration
  - Description: Run the migration script and verify data in Neon database
  - Dependencies: Migration script
  - Priority: High

## Application Code Updates

- [x] Create Prisma client instance
  - Description: Create src/lib/prisma.ts to export PrismaClient instance
  - Dependencies: Prisma setup
  - Priority: Medium

- [x] Update readings list page
  - Description: Modify src/app/readings/page.tsx to fetch data from database
  - Dependencies: Prisma client setup
  - Priority: Medium

- [x] Update reading detail page
  - Description: Modify src/app/readings/[slug]/page.tsx to fetch single reading from database
  - Dependencies: Prisma client setup
  - Priority: Medium

- [x] Update quotes component
  - Description: Modify TypewriterQuotes.tsx to fetch quotes from database
  - Dependencies: Prisma client setup
  - Priority: Medium

## Deployment

- [x] Configure Vercel environment variables
  - Description: Add DATABASE_URL to Vercel project settings
  - Dependencies: Neon database setup
  - Priority: Low

- [x] Deploy and test
  - Description: Push changes and verify functionality on Vercel
  - Dependencies: All code changes
  - Priority: Low

## Cleanup

- [ ] Remove static data files
  - Description: Delete data.ts and quotes.ts after successful deployment
  - Dependencies: Verified deployment (completed with successful data migration)
  - Priority: Low (can be kept as a backup until verified in production)

## Summary
- Total tasks: 15
- High priority: 7
- Medium priority: 4
- Low priority: 4