# Vanity Application Best Practices

This document outlines the best practices for development and security within the Vanity application. It serves as a quick reference guide for developers working on the project.

## Table of Contents

1. [Security Practices](#security-practices)
2. [Architecture Patterns](#architecture-patterns)
3. [Code Style](#code-style)
4. [Testing Approach](#testing-approach)
5. [Development Workflow](#development-workflow)

## Security Practices

### Authentication and Authorization

- **Always** use the centralized authentication middleware for protected routes
- **Never** hardcode credentials in the codebase or expose them in client-side code
- For admin authentication, use the cookie-based session mechanism
- For API-to-API authentication, use the API token validation
- Implement the principle of least privilege in all access controls

### Data Protection

- **Always** use Prisma's query builder or parameterized queries for database operations
- **Never** use string concatenation to build SQL queries with user input
- **Always** implement CSRF protection for state-changing operations
- **Always** validate user inputs before processing them
- Use environment-specific validation and error handling

### Error Handling

- Use the centralized error handling utility for consistent error responses
- Mask sensitive details in production error messages
- Include detailed information in development for debugging
- Categorize errors with appropriate error types and status codes
- Ensure security-related errors don't leak sensitive information

### Secure Coding

- Keep dependencies updated to address security vulnerabilities
- Use HTTPS in production environments
- Implement proper cookie security (httpOnly, secure, sameSite)
- Follow the defense-in-depth security principle
- Use centralized security utilities instead of custom implementations

## Architecture Patterns

### Next.js App Router Structure

- Group related pages and components by feature
- Use server components for data fetching when possible
- Implement client components for interactive elements
- Keep API routes organized by domain/feature
- Use middleware for cross-cutting concerns like authentication

### State Management

- Use React Context for global state that spans multiple components
- Consider server components for static data to reduce client-side state
- Use hooks for component-specific state
- Avoid prop drilling by using context or composition
- Prefer smaller, focused contexts over a single large context

## Code Style

- Follow TypeScript best practices for type safety
- Use async/await for asynchronous operations
- Write self-documenting code with clear function and variable names
- Keep components small and focused on a single responsibility
- Use destructuring for cleaner props handling

## Testing Approach

- Write unit tests for utility functions and hooks
- Implement integration tests for API routes
- Use component testing for UI elements
- Include end-to-end tests for critical user flows
- Test error handling and edge cases thoroughly

## Development Workflow

- Use feature branches for new development
- Submit pull requests for code reviews
- Ensure all tests pass before merging
- Document significant changes
- Follow conventional commit messages