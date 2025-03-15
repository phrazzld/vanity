# TODO

## Assumptions
- The project has been successfully migrated from hardcoded data to a Neon Postgres database
- The application is deployed and functioning on Vercel
- The current structure follows Next.js 15+ conventions with React server components
- Authentication will be implemented for the admin interface without existing auth infrastructure

## 1. Cleanup and Refactoring

### 1.1 Remove Leftover Files

- [x] Remove src/app/readings/data.ts file
  - Description: Delete the hardcoded READINGS array that's been replaced by database queries
  - Dependencies: Verify TypewriterQuotes component no longer imports from this file
  - Priority: High

- [x] Remove src/app/quotes.ts file
  - Description: Delete the hardcoded QUOTES array that's been replaced by database queries
  - Dependencies: Verify all components use database queries instead
  - Priority: High

- [x] Remove temporary migration files
  - Description: Delete .env.migration and logs_result.json files used during database transition
  - Dependencies: None (ensure they're properly added to .gitignore)
  - Priority: Medium

### 1.2 Code Cleanup

- [x] Remove debugging statements
  - Description: Clean up console.log statements and commented-out code in src/app/readings/page.tsx and utils.ts
  - Dependencies: None
  - Priority: Medium

- [x] Review dependencies in package.json
  - Description: Identify and remove any unused dependencies added for migration (e.g., ts-node if no longer needed)
  - Dependencies: None
  - Priority: Low

- [x] Run npm prune
  - Description: Remove unlisted dependencies from node_modules
  - Dependencies: Updated package.json
  - Priority: Low

### 1.3 Refactor Database Access

- [x] Create dedicated database directory
  - Description: Create src/lib/db directory for database-related utilities
  - Dependencies: None
  - Priority: High

- [x] Move reading utilities
  - Description: Move database access functions from src/app/readings/utils.ts to src/lib/db/readings.ts
  - Dependencies: src/lib/db directory
  - Priority: High

- [x] Move quote utilities
  - Description: Move quote database functions to src/lib/db/quotes.ts
  - Dependencies: src/lib/db directory
  - Priority: High

- [x] Enhance error handling
  - Description: Add robust error handling to database functions with appropriate error messages and logging
  - Dependencies: Refactored database utility files
  - Priority: Medium

### 1.4 Create Type Definitions

- [x] Create types directory
  - Description: Add src/types directory for shared interfaces
  - Dependencies: None
  - Priority: High

- [x] Define Reading interface
  - Description: Create src/types/reading.ts with Reading interface
  - Dependencies: src/types directory
  - Priority: High

- [x] Define Quote interface
  - Description: Create src/types/quote.ts with Quote interface
  - Dependencies: src/types directory
  - Priority: High

- [x] Update imports
  - Description: Ensure all components use the new type definitions
  - Dependencies: Type definition files
  - Priority: Medium

### 1.5 Improve Code Organization

- [x] Organize components
  - Description: Move reading-related components to src/app/components/readings/ subdirectory
  - Dependencies: None
  - Priority: Medium

- [ ] Extract inline styles
  - Description: Move inline styles from src/app/readings/page.tsx to CSS modules or Tailwind classes
  - Dependencies: None
  - Priority: Medium

- [x] Add JSDoc comments
  - Description: Document key functions with JSDoc comments in database utility files
  - Dependencies: Refactored database utility files
  - Priority: Low

- [ ] Update README.md
  - Description: Add section on project structure and database integration
  - Dependencies: Completed refactoring
  - Priority: Low

## 2. Database Management Tool

### 2.1 Setup Authentication

- [x] Install NextAuth.js
  - Description: Add next-auth dependency with npm install next-auth
  - Dependencies: None
  - Priority: High

- [x] Configure NextAuth
  - Description: Create src/app/api/auth/[...nextauth]/route.ts file with credentials provider
  - Dependencies: next-auth installation
  - Priority: High

- [x] Add environment variables
  - Description: Update .env with NEXTAUTH_SECRET and NEXTAUTH_URL variables
  - Dependencies: NextAuth configuration
  - Priority: High

### 2.2 Create Admin Page

- [x] Create admin route
  - Description: Add src/app/admin/page.tsx with session protection
  - Dependencies: NextAuth setup
  - Priority: High

- [x] Add admin layout
  - Description: Create simple layout with navigation between readings and quotes management
  - Dependencies: Admin route
  - Priority: Medium

### 2.3 Implement CRUD API Routes

- [x] Create readings API routes
  - Description: Implement src/app/api/readings/route.ts with GET, POST, PUT, DELETE methods
  - Dependencies: Database utility functions
  - Priority: High

- [x] Create quotes API routes
  - Description: Implement src/app/api/quotes/route.ts with GET, POST, PUT, DELETE methods
  - Dependencies: Database utility functions
  - Priority: High

- [x] Add server-side validation
  - Description: Ensure API routes validate input data before database operations
  - Dependencies: API routes implementation
  - Priority: Medium

### 2.4 Build Admin Forms

- [ ] Install form utilities
  - Description: Add react-hook-form dependency for form handling
  - Dependencies: None
  - Priority: Medium

- [x] Create Reading form
  - Description: Implement form for adding/editing readings with validation
  - Dependencies: API routes
  - Priority: High

- [x] Create Quote form
  - Description: Implement form for adding/editing quotes with validation
  - Dependencies: API routes
  - Priority: High

- [x] Add feedback notifications
  - Description: Implement success/error notifications for form operations
  - Dependencies: Form implementations
  - Priority: Medium

- [x] Implement deletion confirmation
  - Description: Add confirmation dialog for delete operations
  - Dependencies: Form implementations
  - Priority: Medium

## 3. Readings Page Redesign

### 3.1 Enhance Layout

- [ ] Install masonry layout library
  - Description: Add react-masonry-css dependency for fluid grid layout
  - Dependencies: None
  - Priority: High

- [ ] Implement masonry grid
  - Description: Replace current grid with masonry layout in src/app/readings/page.tsx
  - Dependencies: react-masonry-css
  - Priority: High

- [ ] Add responsive breakpoints
  - Description: Configure proper column counts for different viewport sizes
  - Dependencies: Masonry implementation
  - Priority: Medium

### 3.2 Improve Visual Design

- [ ] Define color scheme
  - Description: Update tailwind.config.ts with custom color palette
  - Dependencies: None
  - Priority: High

- [ ] Redesign ReadingCard component
  - Description: Enhance card design with shadows, hover effects, and improved typography
  - Dependencies: Updated color scheme
  - Priority: High

- [ ] Install animation library
  - Description: Add framer-motion dependency for animations
  - Dependencies: None
  - Priority: Medium

- [ ] Add entry animations
  - Description: Implement staggered animations when cards appear on screen
  - Dependencies: framer-motion
  - Priority: Medium

### 3.3 Improve UX

- [ ] Add sticky sidebar navigation
  - Description: Implement year-based sidebar navigation with smooth scrolling
  - Dependencies: None
  - Priority: Medium

- [ ] Implement search functionality
  - Description: Add search bar to filter readings by title, author, etc.
  - Dependencies: None
  - Priority: High

- [ ] Add filtering options
  - Description: Implement filters for year, completion status, etc.
  - Dependencies: Search implementation
  - Priority: Medium

### 3.4 Optimize Performance

- [ ] Configure image optimization
  - Description: Update next.config.ts with proper image settings for remote images
  - Dependencies: None
  - Priority: High

- [ ] Implement lazy loading
  - Description: Add lazy loading for images and content below the fold
  - Dependencies: None
  - Priority: Medium

- [ ] Add loading states
  - Description: Implement skeleton loaders during data fetching
  - Dependencies: None
  - Priority: Medium

## Summary
- Total tasks: 42
- High priority: 19
- Medium priority: 18
- Low priority: 5