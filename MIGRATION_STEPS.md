# Migration Steps

## Prerequisites
- Neon Postgres database created (as outlined in DATABASE.md)
- Environment variables configured in .env file
- Prisma already installed and initialized

## Running the Initial Migration

After setting up your database, you'll need to run the initial migration to create the database tables according to your schema:

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init
```

This will:
1. Create a migrations directory with SQL scripts
2. Apply the migration to your database
3. Generate updated Prisma client

## Running the Data Migration Script

After the database tables are created, you can run the data migration script to transfer data from the hardcoded arrays to the database:

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run the migration script
npx ts-node scripts/migrateData.ts
```

## Verifying the Migration

You can verify that the data has been correctly migrated by:

1. Using Prisma Studio to view the database contents:
   ```bash
   npx prisma studio
   ```

2. Running the application locally to check that readings and quotes are displayed correctly:
   ```bash
   npm run dev
   ```

## Vercel Deployment

Before deploying to Vercel, make sure to:

1. Add the DATABASE_URL environment variable in your Vercel project settings
2. Deploy your application to Vercel
3. Verify that the application works correctly with the database

## Cleanup

After successful deployment and verification, you can clean up the codebase by removing the static data files:
- src/app/readings/data.ts
- src/app/quotes.ts

These files are no longer needed as data is now stored in the database.