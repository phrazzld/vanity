#!/bin/bash
# Complete migration deployment script

echo "=== VANITY SITE DATABASE MIGRATION ==="
echo "This script will run the complete database migration process:"
echo "1. Run Prisma schema migrations"
echo "2. Migrate reading data"
echo "3. Migrate quotes with proper escape handling"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  echo "Please set it to your production database URL before running this script."
  echo "Example: export DATABASE_URL=\"postgresql://user:password@host:port/database?sslmode=require\""
  exit 1
fi

echo "Using database: ${DATABASE_URL:0:25}..."
echo ""

# Step 1: Run Prisma migrations
echo "=== STEP 1: Applying database schema migrations ==="
npx prisma migrate deploy
if [ $? -ne 0 ]; then
  echo "ERROR: Prisma schema migration failed."
  exit 1
fi
echo "✅ Schema migrations applied successfully."
echo ""

# Step 2: Migrate readings data
echo "=== STEP 2: Migrating readings data ==="
node scripts/migrate-data.js
if [ $? -ne 0 ]; then
  echo "ERROR: Readings migration failed."
  exit 1
fi
echo "✅ Readings migration completed successfully."
echo ""

# Step 3: Migrate quotes data
echo "=== STEP 3: Migrating quotes data with escape handling ==="
node scripts/migrate-quotes.js
if [ $? -ne 0 ]; then
  echo "ERROR: Quotes migration failed."
  exit 1
fi
echo "✅ Quotes migration completed successfully."
echo ""

echo "=== MIGRATION COMPLETE ==="
echo "All database migrations have been applied successfully."
echo "Don't forget to verify your data in the application!"