/**
 * Components Barrel File
 * 
 * Exports all components for easier imports elsewhere in the application.
 */

export { default as SearchBar } from './SearchBar';
export type { FilterConfig, FilterOption, SearchBarProps } from './SearchBar';

export { default as Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';

export { default as DarkModeToggle } from './DarkModeToggle';

// Loading indicators and skeletons
export { default as ReadingListSkeleton } from './ReadingListSkeleton';
export { default as QuoteListSkeleton } from './QuoteListSkeleton';
export { default as SearchLoadingIndicator } from './SearchLoadingIndicator';

// Reading-related components
export { default as ReadingsList } from './readings/ReadingsList';
export type { ReadingsListProps } from './readings/ReadingsList';
export { default as ReadingCard } from './readings/ReadingCard';

// Quote-related components
export { default as QuotesList } from './quotes/QuotesList';
export type { QuotesListProps } from './quotes/QuotesList';

// Demo components
export { default as SearchBarDemo } from './SearchBarDemo';
export { default as PaginationDemo } from './PaginationDemo';
export { default as ReadingsListStateDemo } from './ReadingsListStateDemo';