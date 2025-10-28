# BACKLOG: Favorites Feature

## Architectural Investigations

- **Clarify ReadingsList component purpose**: Document why ReadingsList exists and when it should be used vs YearSection. If it has no distinct purpose, consider removing it to reduce cognitive load. Estimated effort: 30min investigation + documentation or removal.

- **Unified readings display strategy**: Evaluate if ReadingsList and ReadingsPage logic could be further unified. Currently we have YearSection (display), ReadingsPage (page logic), and ReadingsList (list logic with filtering). Could simplify to fewer abstractions. Estimated effort: 2-3 hours investigation + design.

## Future Enhancements

- **Additional filter options**: Add filters for audiobook status, date ranges, or author. With extracted hook pattern, these would be easy additions. Estimated effort: 1-2 hours per filter type.

- **Filter state persistence**: Save filter preferences to localStorage so they persist across page loads. Estimated effort: 1 hour.

- **Favorites count badge**: Show count of favorites in filter toggle button (e.g., "Favorites (12)"). Estimated effort: 30min.

- **Keyboard shortcuts**: Add keyboard shortcut to toggle favorites filter (e.g., 'f' key). Estimated effort: 1 hour.

## Technical Debt Opportunities

- **Refactor Layout Architecture**: Current layout uses global `container-content` wrapper, requiring components to "break out" using `.full-width-breakout` utility when they need edge-to-edge width. Consider moving to page-controlled containment where each page decides what's constrained vs full-width. Would eliminate negative margin workarounds. Effort: 3-4 hours.

- **Refactor YearSection**: Consider if YearSection should accept ReadingListItem[] instead of Reading[] since it only uses subset of fields. Would clarify data contracts. Effort: 1 hour.

- **Extract grouping logic**: The year grouping logic in ReadingsPage could be extracted to `useReadingsGrouping` hook similar to the filter hook. Would make page logic cleaner. Effort: 1-2 hours.

## Nice-to-Have Improvements

- **Animated filter transitions**: Add smooth transitions when filtering (fade out/in). Low priority but improves UX polish. Effort: 2 hours.

- **Empty state for favorites**: When "Favorites Only" is active but no favorites exist, show specific empty state message encouraging users to mark favorites. Effort: 30min.
