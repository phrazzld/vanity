# TODO

## Assumptions
- The project uses Next.js with TypeScript
- API endpoints for readings and quotes already exist and can be modified
- The application has an existing dark mode implementation
- The admin UI follows a two-column layout pattern
- No database schema changes are required

## Data Access Layer

- [x] Update types definitions for API query parameters
  - Explicit Description: Create TypeScript interfaces for ReadingsQueryParams and QuotesQueryParams with search, filter, sort, and pagination properties
  - Dependencies: None
  - Priority: High

- [x] Enhance readings API endpoint with search and filtering
  - Explicit Description: Modify the `/api/readings` endpoint to accept and process search terms, status filters, sorting parameters, and pagination
  - Dependencies: Query parameter type definitions
  - Priority: High

- [x] Enhance quotes API endpoint with search and filtering
  - Explicit Description: Modify the `/api/quotes` endpoint to accept and process search terms, sorting parameters, and pagination
  - Dependencies: Query parameter type definitions
  - Priority: High

## UI Components

- [x] Implement reusable SearchBar component
  - Explicit Description: Create a generic SearchBar component with text input, clear button, and optional filter dropdowns that follows the app's styling patterns
  - Dependencies: None
  - Priority: High

- [x] Implement Pagination component
  - Explicit Description: Create a reusable Pagination component with page navigation, items per page selector, and item count display
  - Dependencies: None
  - Priority: Medium

- [x] Implement debounced search utility
  - Explicit Description: Create a utility function that debounces search input to prevent excessive API calls
  - Dependencies: None
  - Priority: High

- [x] Enhance ReadingsList component with sorting and search highlights
  - Explicit Description: Update the existing readings list to support column sorting, search term highlighting, and empty state handling
  - Dependencies: SearchBar component, enhanced readings API
  - Priority: Medium

- [x] Enhance QuotesList component with sorting and search highlights
  - Explicit Description: Update the existing quotes list to support column sorting, search term highlighting, and empty state handling
  - Dependencies: SearchBar component, enhanced quotes API
  - Priority: Medium

## State Management

- [x] Implement admin list state management hooks
  - Explicit Description: Create a custom hook using useState/useReducer to track and update search, filter, sort, and pagination state
  - Dependencies: None
  - Priority: High

- [ ] Add localStorage persistence for user preferences
  - Explicit Description: Implement saving and loading of search filters, sort preferences, and pagination settings using localStorage
  - Dependencies: State management implementation
  - Priority: Medium

- [ ] Implement URL query parameter synchronization
  - Explicit Description: Add functionality to sync the current filter state with URL query parameters for shareable filtered views
  - Dependencies: State management implementation
  - Priority: Low

## Readings Admin Page

- [x] Integrate SearchBar and filters in readings admin page
  - Explicit Description: Add the SearchBar component to the readings admin page with specific filters for reading status
  - Dependencies: SearchBar component, state management hooks
  - Priority: High

- [x] Add pagination to readings admin page
  - Explicit Description: Integrate the Pagination component with the readings list and connect it to the API
  - Dependencies: Pagination component, enhanced readings API, state management hooks
  - Priority: Medium

- [x] Implement loading states for readings search/filter operations
  - Explicit Description: Add loading indicators during data fetching and implement smooth transitions between states
  - Dependencies: Enhanced ReadingsList component
  - Priority: Medium

- [ ] Add selection checkboxes and bulk operations for readings
  - Explicit Description: Implement selection functionality with checkboxes and add bulk delete and status update operations
  - Dependencies: Enhanced ReadingsList component
  - Priority: Low

## Quotes Admin Page

- [x] Integrate SearchBar and filters in quotes admin page
  - Explicit Description: Add the SearchBar component to the quotes admin page with author filtering options
  - Dependencies: SearchBar component, state management hooks
  - Priority: High

- [x] Add pagination to quotes admin page
  - Explicit Description: Integrate the Pagination component with the quotes list and connect it to the API
  - Dependencies: Pagination component, enhanced quotes API, state management hooks
  - Priority: Medium

- [x] Implement loading states for quotes search/filter operations
  - Explicit Description: Add loading indicators during data fetching and implement smooth transitions between states
  - Dependencies: Enhanced QuotesList component
  - Priority: Medium

## Accessibility and UX Improvements

- [ ] Ensure dark mode compatibility for all new components
  - Explicit Description: Verify and adjust styling for all new components to properly support the existing dark mode implementation
  - Dependencies: All UI components
  - Priority: Medium
