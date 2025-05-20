/**
 * API query parameter type definitions
 *
 * Contains interface definitions for API request parameters used in endpoints
 * throughout the application. These types facilitate search, filtering, sorting,
 * and pagination functionality.
 */

/**
 * ReadingsQueryParams interface
 *
 * Parameters for querying the readings API with search, filter, sort, and pagination
 * capabilities.
 */
export interface ReadingsQueryParams {
  /** Text to search within title, author, and thoughts */
  search?: string;

  /** Filter by reading status */
  status?: 'read' | 'dropped' | 'all';

  /** Field to sort by */
  sortBy?: 'date' | 'title' | 'author';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';

  /** Maximum number of readings to return */
  limit?: number;

  /** Number of readings to skip for pagination */
  offset?: number;
}

/**
 * QuotesQueryParams interface
 *
 * Parameters for querying the quotes API with search, sort, and pagination
 * capabilities.
 */
export interface QuotesQueryParams {
  /** Text to search within quote text and author fields */
  search?: string;

  /** Field to sort by */
  sortBy?: 'author' | 'id';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';

  /** Maximum number of quotes to return */
  limit?: number;

  /** Number of quotes to skip for pagination */
  offset?: number;
}

/**
 * PaginationResult interface
 *
 * Generic interface for paginated API responses that includes
 * metadata about the pagination state along with the actual data.
 */
export interface PaginationResult<T> {
  /** Array of items for the current page */
  data: T[];

  /** Total number of items across all pages */
  totalCount: number;

  /** Current page number (1-based) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Number of items per page */
  pageSize: number;
}
