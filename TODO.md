# TODO

## SQL Injection Prevention
- [x] Fix SQL injection in reading.ts getReading() method
  - Description: Replace raw SQL query with Prisma's query builder
  - Dependencies: None
  - Priority: High

- [x] Fix SQL injection in reading.ts getReadings() method
  - Description: Replace raw SQL query with Prisma or parameterized queries
  - Dependencies: None
  - Priority: High

- [x] Fix SQL injection in quotes.ts getQuote() method
  - Description: Replace raw SQL with proper parameterized queries
  - Dependencies: None
  - Priority: High

- [x] Fix SQL injection in quotes.ts getQuotes() method
  - Description: Replace raw SQL with proper parameterized queries
  - Dependencies: None
  - Priority: High

- [x] Audit remaining database queries for SQL injection
  - Description: Review all database operations to ensure parameterized queries
  - Dependencies: None
  - Priority: High

## Password Security
- [x] Install bcrypt package
  - Description: Add bcrypt for password hashing
  - Dependencies: None
  - Priority: High

- [x] Implement password hashing in auth.ts
  - Description: Modify auth.ts to use bcrypt for comparing passwords against stored hash
  - Dependencies: bcrypt package
  - Priority: High

- [x] Update environment variable documentation
  - Description: Update .env.example to indicate ADMIN_PASSWORD should be hashed
  - Dependencies: Password hashing implementation
  - Priority: Medium

## CSRF Protection
- [x] Create CSRF token generation utility
  - Description: Create a simple utility to generate and validate CSRF tokens
  - Dependencies: None
  - Priority: High

- [x] Add CSRF token to login form
  - Description: Modify login page to include CSRF token in form submission
  - Dependencies: CSRF token generation utility
  - Priority: High

- [x] Add CSRF validation to auth endpoints
  - Description: Add validation to ensure CSRF token is valid for form submissions
  - Dependencies: CSRF token generation utility
  - Priority: High

- [ ] Add CSRF protection to API routes
  - Description: Protect API routes that modify data with CSRF validation
  - Dependencies: CSRF token generation utility
  - Priority: High

## Cookie Security
- [x] Improve cookie configuration for admin_authenticated
  - Description: Set more secure cookie attributes (path, secure, sameSite)
  - Dependencies: None
  - Priority: Medium

- [x] Improve cookie configuration for admin_user
  - Description: Set more secure cookie attributes (path, secure, sameSite)
  - Dependencies: None
  - Priority: Medium

## Input Validation
- [x] Enhance input validation for readings API
  - Description: Improve validateReadingInput function with more robust validation
  - Dependencies: None
  - Priority: Medium

- [ ] Add input validation for quotes API
  - Description: Create or enhance validation for quote inputs
  - Dependencies: None
  - Priority: Medium

## API Authorization
- [ ] Implement API token validation
  - Description: Add validation for API Bearer tokens using environment variable
  - Dependencies: New API_TOKEN environment variable
  - Priority: Low

- [ ] Update environment variables for API token
  - Description: Add API_TOKEN to environment variables
  - Dependencies: None
  - Priority: Low

## Error Handling
- [ ] Create centralized error handling utility
  - Description: Implement simple error handler that masks details in production
  - Dependencies: None
  - Priority: Low

- [ ] Implement error handling in API routes
  - Description: Use the centralized error handler in API routes
  - Dependencies: Error handling utility
  - Priority: Low

## Testing
- [ ] Create tests for SQL injection prevention
  - Description: Verify SQL injection vulnerabilities are fixed
  - Dependencies: SQL injection fixes
  - Priority: Medium

- [ ] Create tests for CSRF protection
  - Description: Verify CSRF protection is working
  - Dependencies: CSRF implementation
  - Priority: Medium

- [ ] Create tests for password hashing
  - Description: Verify password hashing works correctly
  - Dependencies: Password hashing implementation
  - Priority: Medium

## Documentation
- [ ] Update documentation with security changes
  - Description: Document security improvements and configurations
  - Dependencies: Implementation of security features
  - Priority: Low

## Assumptions & Clarifications
- This plan assumes a single-user admin panel without multi-user capabilities
- The authentication system will remain simple (not using NextAuth.js)
- API authorization will use a simple token approach rather than full JWT implementation
- Error handling will be simplified for the single-user context