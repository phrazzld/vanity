# Database Migration Lessons Learned

## Issue
We successfully deployed our Next.js application with PostgreSQL integration to Vercel, but encountered errors where our data wasn't showing up. The logs showed errors like:

```
relation "Quote" does not exist
relation "Reading" does not exist
```

## Cause
When deploying a database-backed application, Prisma migrations don't automatically run during deployment. The app was trying to query tables that hadn't been created yet.

## Solution

### 1. Run Database Migrations Manually
We ran the Prisma migrations manually using:
```bash
DATABASE_URL=your_production_db_url npx prisma migrate deploy
```

### 2. Run Data Migration Script
We created a robust script to extract and migrate the data from TypeScript files to the database:
```bash
DATABASE_URL=your_production_db_url npm run migrate:data
```

### 3. Environment Variable Management
- We had issues with the `.env` file format (quotes in DATABASE_URL)
- Created a clean `.env.migration` file with properly formatted values

## Migration Script Challenges

### Data Extraction Challenges
- Readings data was spread across multiple arrays (by year)
- TypeScript objects needed conversion to proper JSON
- Date objects required special handling
- Quotes with internal quotation marks and apostrophes required special parsing

### String Content Parsing
- Regex-based approaches failed with complex string data (nested quotes, apostrophes)
- Line-by-line parsing proved more reliable for structured data
- Explicit handling of escape sequences was critical:
  - `\"` → `"` (quoted text within strings)
  - `\'` → `'` (apostrophes)
  - `\\` → `\` (backslashes)
  - `\n` → newlines
  - `\t` → tabs

### Error Handling
- Added error handling to prevent entire migration failing due to a single record
- Added verbose logging to track progress

## Best Practices for Future Migrations

### Separate Migration from Deployment
Don't tie migrations directly to every deployment. Instead:
1. Run migrations as a separate step
2. Only run when schema changes
3. Check that migrations completed successfully before deployment

### Database Setup Scripts
1. Create reusable migration scripts
2. Document the migration process
3. Test migrations in development environment first

### Environment Management
1. Store proper DATABASE_URL format in environment variables
2. Use separate .env files for different environments
3. Document required environment variables

## Migration Verification
- After migrations, verify data integrity with sample queries
- Implement monitoring to detect data access errors
- Have a rollback plan for failed migrations

## Conclusion
Database migrations require careful planning and manual intervention. By separating migrations from deployments and creating robust migration scripts, we can ensure smooth transitions to database-backed applications.