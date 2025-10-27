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
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: active ? 'var(--primary-color)' : 'transparent',
        color: active ? 'white' : 'var(--text-color)',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
      }}
      aria-label={active ? 'Show all readings' : 'Show only favorites'}
    >
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {active ? 'Show All' : 'Favorites Only'}
    </button>
  );
}
