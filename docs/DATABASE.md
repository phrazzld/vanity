# Database Setup Instructions

## Creating a Neon Postgres Database

1. Sign up at [neon.tech](https://neon.tech)
2. After creating an account, create a new Postgres database instance:
   - Click "New Project"
   - Name your project (e.g., "vanity")
   - Select a region closest to your users
   - Click "Create Project"

3. Once your database is created:
   - Neon will display a connection string that looks like: `postgres://username:password@host:port/dbname?sslmode=require`
   - Save this connection string, as you'll need it for your `.env` file
   - You can always retrieve the connection string later from your project dashboard

## Connection Details

Your connection string will be used in the project's `.env` file as:

```
DATABASE_URL="your_neon_connection_string"
```

## Security Notes

- Never commit your connection string to version control
- Ensure `.env` is in your `.gitignore` file
- For Vercel deployment, you'll add this as an environment variable in the Vercel dashboard

## Database Management

- You can manage your database using the Neon web console
- Run SQL queries directly in the SQL Editor
- Monitor database performance in the Monitoring tab