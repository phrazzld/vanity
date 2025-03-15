# Bug Postmortem: Next.js Server Component and Database Issues

## Root Cause Summary

The application had two main issues:

1. **Next.js Export Validation**: The `getReading` function exported from the page component violated Next.js page export rules for production builds, even though it worked in development and testing.

2. **Type Safety Issues**: There were type issues when using data fetching functions due to missing type annotations, particularly when accessing properties of values with unknown types.

## Timeline of Debugging Steps

1. **Initial Bug Analysis**
   - Identified the error message: "getReading" is not a valid Page export field in src/app/readings/[slug]/page.tsx
   - Verified that the error occurred in the Vercel build process but not locally

2. **Function Relocation**
   - Moved the `getReading` function from the page file to a utility file
   - Updated imports in the page and test files
   - Attempted to build again but encountered interface type errors

3. **Component Props Simplification**
   - Simplified the page props to use a basic any type to avoid interface mismatches
   - This bypassed the PageProps constraint issues

4. **Function Consistency**
   - For consistency, moved `getReadings` function to the same utility file
   - Updated imports in the main page and test files
   - Encountered type issues with the returned data

5. **Type Safety Improvements**
   - Added proper type casting to ensure type safety when using the fetched data
   - Successfully built the application for production

## Resolution

1. **Code Organization**:
   - Created a utils.ts file for data fetching functions
   - Moved database interaction logic out of page components
   - Maintained proper separation of concerns

2. **Type Safety**:
   - Added explicit type casting for database results
   - Ensured all returned data from utility functions has proper typing

3. **Next.js Compatibility**:
   - Removed non-standard exports from page components
   - Simplified component props to avoid interface conflicts
   - Followed Next.js export validation rules for production builds

## Recommendations to Prevent Recurrence

1. **Page Export Best Practices**
   - Keep Next.js page exports limited to standard exports (default export, metadata, etc.)
   - Move utility functions and data fetching logic to separate files
   - Use the utilities folder structure for non-UI code

2. **Type Safety**
   - Use explicit type annotations for all data fetching functions
   - Add type casting when working with external data sources
   - Consider adding runtime validation for API responses

3. **Testing Improvements**
   - Add end-to-end tests that simulate the production build environment
   - Test builds with production flags to catch build-time errors earlier
   - Create a pre-commit hook to run type checking with strict settings

4. **Documentation**
   - Document Next.js limitations and export rules in the project README
   - Add comments to explain why certain patterns are used
   - Include examples of correct page component structure