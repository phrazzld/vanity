# SQL Injection Prevention

This document describes how SQL injection attacks are prevented in the Vanity application.

## Background

SQL injection is a type of security vulnerability that occurs when untrusted data is used to construct SQL queries. If successful, an attacker can:

- Bypass authentication
- Access, modify, or delete data in a database
- Execute administrative operations on the database

## How We Prevent SQL Injection

The Vanity application uses multiple layers of defense to prevent SQL injection:

### 1. Prisma ORM

The primary protection against SQL injection comes from using Prisma's type-safe query builder. Prisma automatically handles parameter sanitization and prevents direct SQL manipulation.

#### Example:

```typescript
// SAFE: Using Prisma's query builder
const reading = await prisma.reading.findUnique({
  where: { slug },
  select: { id: true, title: true, author: true }
});
```

### 2. Parameterized Queries

For complex queries where Prisma's standard query builder is insufficient, we use parameterized queries instead of string concatenation.

#### Example:

```typescript
// SAFE: Using parameterized queries
const query = `
  SELECT * FROM "Quote" 
  WHERE text ILIKE $1
`;

const result = await prisma.$queryRawUnsafe(
  query,
  `%${search}%`  // Parameter passed separately from the query
);
```

### 3. Input Validation

All user inputs are validated before being used in database operations:

- Numeric parameters (like `id`, `limit`, `offset`) are converted to numbers
- Enum parameters (like `sortBy`, `sortOrder`) are validated against allowed values
- String inputs are properly handled without allowing malicious characters to change query structure

#### Example:

```typescript
// Input validation
const validatedLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
const validatedOffset = Math.max(0, Number(offset) || 0);
const validatedSortBy = ['date', 'title', 'author'].includes(sortBy) ? sortBy : 'date';
```

### 4. Query Structure Protection

Instead of directly embedding user input into SQL strings, we:

- Use Prisma's built-in methods whenever possible
- Use parameterized queries for raw SQL
- Validate and sanitize all inputs

## Vulnerable Code We've Fixed

The application previously contained some vulnerable code patterns that have been fixed:

### Before:

```typescript
// VULNERABLE: Direct string concatenation
const slug = req.query.slug;
const query = `
  SELECT * FROM "Reading"
  WHERE slug = '${slug}'  // Direct insertion of user input!
`;
const reading = await prisma.$queryRawUnsafe(query);
```

### After:

```typescript
// SAFE: Using Prisma's type-safe methods
const slug = req.query.slug;
const reading = await prisma.reading.findUnique({
  where: { slug },
  select: { id: true, title: true, author: true }
});
```

## Testing for SQL Injection Vulnerabilities

We have implemented comprehensive tests to verify our SQL injection protections:

1. **Unit Tests**: Test that our database functions use Prisma's methods properly
2. **API Tests**: Verify that our API routes handle potentially malicious input safely
3. **Integration Tests**: Validate that actual database interactions are protected

To run tests specifically for SQL injection prevention:

```bash
npm test -- --testPathPattern=sql-injection
```

## Best Practices

When developing database functionality:

1. Always use Prisma's query builder methods instead of raw SQL when possible
2. If raw SQL is necessary, always use parameterized queries
3. Validate all user inputs before using them in queries
4. Never use string concatenation to build SQL queries with user input
5. Use the principle of least privilege for database connections

## References

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Prisma Security Documentation](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#sql-injection)