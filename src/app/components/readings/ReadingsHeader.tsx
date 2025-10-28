/**
 * ReadingsHeader Component
 *
 * Integrated header bar for the readings page displaying stats and filter controls.
 * Shows total readings count, favorites count, years covered, and filter toggle.
 *
 * @example
 * ```tsx
 * <ReadingsHeader
 *   totalCount={373}
 *   favoritesCount={84}
 *   yearsCount={15}
 *   showOnlyFavorites={false}
 *   onToggleFilter={() => setShowOnlyFavorites(!showOnlyFavorites)}
 * />
 * ```
 */

import ReadingsFilterToggle from './ReadingsFilterToggle';

export interface ReadingsHeaderProps {
  /** Total number of readings */
  totalCount: number;
  /** Number of favorite readings */
  favoritesCount: number;
  /** Number of unique years with readings */
  yearsCount: number;
  /** Whether the favorites filter is currently active */
  showOnlyFavorites: boolean;
  /** Callback to toggle the favorites filter */
  onToggleFilter: () => void;
}

export default function ReadingsHeader({
  totalCount,
  favoritesCount,
  yearsCount,
  showOnlyFavorites,
  onToggleFilter,
}: ReadingsHeaderProps) {
  return (
    // Full-width header that breaks out of container-content constraints
    // Uses .full-width-breakout utility to span edge-to-edge while keeping content aligned
    <div
      className="
        full-width-breakout
        sticky top-16 z-20
        flex items-center justify-between
        py-3 mb-6
        bg-white dark:bg-gray-900
        shadow-sm
        border-b border-gray-200 dark:border-gray-800
        transition-all duration-200
      "
    >
      {/* Left: Stats */}
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {totalCount} reading{totalCount !== 1 ? 's' : ''}
        </span>
        <span className="text-gray-400 dark:text-gray-600">·</span>
        <span>
          {favoritesCount} favorite{favoritesCount !== 1 ? 's' : ''}
        </span>
        <span className="text-gray-400 dark:text-gray-600">·</span>
        <span>
          {yearsCount} year{yearsCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Right: Filter Toggle */}
      <ReadingsFilterToggle
        active={showOnlyFavorites}
        count={favoritesCount}
        onToggle={onToggleFilter}
      />
    </div>
  );
}
