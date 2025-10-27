/**
 * ReadingsFilterToggle Component
 *
 * A toggle button for filtering readings to show only favorites.
 * Displays a star icon and text that changes based on active state.
 *
 * @example
 * ```tsx
 * <ReadingsFilterToggle
 *   active={showOnlyFavorites}
 *   onToggle={() => setShowOnlyFavorites(!showOnlyFavorites)}
 * />
 * ```
 */

export interface ReadingsFilterToggleProps {
  /** Whether the favorites filter is currently active */
  active: boolean;
  /** Callback function to toggle the filter state */
  onToggle: () => void;
}

export default function ReadingsFilterToggle({ active, onToggle }: ReadingsFilterToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${
          active
            ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
            : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground border border-border'
        }
      `}
      aria-label={active ? 'Show all readings' : 'Show only favorites'}
    >
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {active ? 'Show All' : 'Favorites Only'}
    </button>
  );
}
