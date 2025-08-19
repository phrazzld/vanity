import { renderHook, act } from '@testing-library/react';
import { useSearchFilters, FilterConfig } from '../useSearchFilters';

describe('useSearchFilters', () => {
  const sampleFilterConfigs: FilterConfig[] = [
    {
      name: 'category',
      label: 'Category',
      options: [
        { value: '', label: 'All Categories' },
        { value: 'tech', label: 'Technology' },
        { value: 'design', label: 'Design' },
        { value: 'business', label: 'Business' },
      ],
      defaultValue: '',
    },
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'Any Status' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'type',
      label: 'Type',
      options: [
        { value: '', label: 'All Types' },
        { value: 'post', label: 'Post' },
        { value: 'page', label: 'Page' },
      ],
      // No default value
    },
  ];

  describe('initialization', () => {
    it('should initialize with default values from configs', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      expect(result.current.activeFilters).toEqual({
        category: '',
        status: 'active',
        type: '',
      });
      expect(result.current.submittedFilters).toEqual({
        category: '',
        status: 'active',
        type: '',
      });
    });

    it('should handle empty filter configs', () => {
      const { result } = renderHook(() => useSearchFilters([]));

      expect(result.current.activeFilters).toEqual({});
      expect(result.current.submittedFilters).toEqual({});
      expect(result.current.hasChanges).toBe(false);
    });

    it('should handle undefined filter configs', () => {
      const { result } = renderHook(() => useSearchFilters());

      expect(result.current.activeFilters).toEqual({});
      expect(result.current.submittedFilters).toEqual({});
    });
  });

  describe('setFilter', () => {
    it('should update a single filter value', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'tech');
      });

      expect(result.current.activeFilters.category).toBe('tech');
      expect(result.current.activeFilters.status).toBe('active'); // Unchanged
      expect(result.current.submittedFilters.category).toBe(''); // Not submitted yet
      expect(result.current.hasChanges).toBe(true);
    });

    it('should handle setting non-existent filter', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('nonexistent', 'value');
      });

      expect(result.current.activeFilters.nonexistent).toBe('value');
    });
  });

  describe('setFilters', () => {
    it('should update multiple filters at once', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilters({
          category: 'design',
          status: 'archived',
        });
      });

      expect(result.current.activeFilters.category).toBe('design');
      expect(result.current.activeFilters.status).toBe('archived');
      expect(result.current.activeFilters.type).toBe(''); // Unchanged
    });
  });

  describe('replaceFilters', () => {
    it('should replace all filter values', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'tech');
      });

      act(() => {
        result.current.replaceFilters({
          category: 'business',
          status: '',
          type: 'post',
        });
      });

      expect(result.current.activeFilters).toEqual({
        category: 'business',
        status: '',
        type: 'post',
      });
    });
  });

  describe('submit', () => {
    it('should sync active filters to submitted filters', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'tech');
        result.current.setFilter('type', 'post');
      });

      expect(result.current.hasChanges).toBe(true);

      let submittedValues;
      act(() => {
        submittedValues = result.current.submit();
      });

      expect(submittedValues).toEqual({
        category: 'tech',
        status: 'active',
        type: 'post',
      });
      expect(result.current.submittedFilters).toEqual({
        category: 'tech',
        status: 'active',
        type: 'post',
      });
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('submitWithCallback', () => {
    it('should submit and call callback with filters', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));
      const callback = jest.fn();

      act(() => {
        result.current.setFilter('category', 'design');
      });

      act(() => {
        result.current.submitWithCallback(callback);
      });

      expect(callback).toHaveBeenCalledWith({
        category: 'design',
        status: 'active',
        type: '',
      });
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all filters to initial values', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'tech');
        result.current.setFilter('status', 'archived');
        result.current.submit();
      });

      act(() => {
        result.current.setFilter('type', 'page');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.activeFilters).toEqual({
        category: '',
        status: 'active',
        type: '',
      });
      expect(result.current.submittedFilters).toEqual({
        category: '',
        status: 'active',
        type: '',
      });
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('resetToSubmitted', () => {
    it('should reset active filters to last submitted values', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      // Set and submit filters
      act(() => {
        result.current.setFilter('category', 'tech');
        result.current.submit();
      });

      // Make more changes
      act(() => {
        result.current.setFilter('category', 'design');
        result.current.setFilter('status', 'archived');
      });

      expect(result.current.hasChanges).toBe(true);

      // Reset to submitted
      act(() => {
        result.current.resetToSubmitted();
      });

      expect(result.current.activeFilters).toEqual({
        category: 'tech',
        status: 'active',
        type: '',
      });
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all filter values to empty strings', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'tech');
        result.current.setFilter('status', 'archived');
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.activeFilters).toEqual({
        category: '',
        status: '',
        type: '',
      });
    });
  });

  describe('hasChanges', () => {
    it('should detect changes between active and submitted filters', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setFilter('category', 'tech');
      });

      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.submit();
      });

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setFilter('category', ''); // Back to default
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('hasActiveFilters', () => {
    it('should detect if any filters are active (non-empty)', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      // Initially has 'active' status
      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.clear();
      });

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.setFilter('category', 'tech');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('activeFilterCount', () => {
    it('should count active (non-empty) filters', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      // Initially has 'active' status
      expect(result.current.activeFilterCount).toBe(1);

      act(() => {
        result.current.setFilter('category', 'tech');
      });

      expect(result.current.activeFilterCount).toBe(2);

      act(() => {
        result.current.setFilter('type', 'post');
      });

      expect(result.current.activeFilterCount).toBe(3);

      act(() => {
        result.current.clear();
      });

      expect(result.current.activeFilterCount).toBe(0);
    });
  });

  describe('getChangedFilters', () => {
    it('should return only changed filters', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'tech');
        result.current.setFilter('type', 'post');
      });

      const changed = result.current.getChangedFilters();

      expect(changed).toEqual({
        category: 'tech',
        type: 'post',
      });
      expect(changed).not.toHaveProperty('status'); // Unchanged
    });

    it('should return empty object when no changes', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      const changed = result.current.getChangedFilters();

      expect(changed).toEqual({});
    });
  });

  describe('getActiveFilters', () => {
    it('should return only non-empty filters', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'tech');
        result.current.setFilter('status', ''); // Clear this one
      });

      const active = result.current.getActiveFilters();

      expect(active).toEqual({
        category: 'tech',
      });
      expect(active).not.toHaveProperty('status');
      expect(active).not.toHaveProperty('type');
    });
  });

  describe('hasFilterChanged', () => {
    it('should check if specific filter has changed', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'tech');
      });

      expect(result.current.hasFilterChanged('category')).toBe(true);
      expect(result.current.hasFilterChanged('status')).toBe(false);
      expect(result.current.hasFilterChanged('type')).toBe(false);

      act(() => {
        result.current.submit();
      });

      expect(result.current.hasFilterChanged('category')).toBe(false);
    });
  });

  describe('isFilterActive', () => {
    it('should check if specific filter is active (non-empty)', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      expect(result.current.isFilterActive('category')).toBe(false);
      expect(result.current.isFilterActive('status')).toBe(true); // Has default

      act(() => {
        result.current.setFilter('category', 'tech');
      });

      expect(result.current.isFilterActive('category')).toBe(true);

      act(() => {
        result.current.setFilter('status', '');
      });

      expect(result.current.isFilterActive('status')).toBe(false);
    });
  });

  describe('getFilterConfig', () => {
    it('should return config for specific filter', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      const categoryConfig = result.current.getFilterConfig('category');

      expect(categoryConfig?.name).toBe('category');
      expect(categoryConfig?.label).toBe('Category');
      expect(categoryConfig?.options).toHaveLength(4);
    });

    it('should return undefined for non-existent filter', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      const config = result.current.getFilterConfig('nonexistent');

      expect(config).toBeUndefined();
    });
  });

  describe('getFilterValueLabel', () => {
    it('should return label for current filter value', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      expect(result.current.getFilterValueLabel('status')).toBe('Active');

      act(() => {
        result.current.setFilter('category', 'tech');
      });

      expect(result.current.getFilterValueLabel('category')).toBe('Technology');

      act(() => {
        result.current.setFilter('category', '');
      });

      expect(result.current.getFilterValueLabel('category')).toBe('All Categories');
    });

    it('should return empty string for non-existent filter', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      expect(result.current.getFilterValueLabel('nonexistent')).toBe('');
    });

    it('should return empty string for invalid value', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setFilter('category', 'invalid-value');
      });

      expect(result.current.getFilterValueLabel('category')).toBe('');
    });
  });

  describe('direct state setters', () => {
    it('should allow direct manipulation of active filters', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setActiveFiltersState({
          category: 'business',
          status: 'archived',
          type: 'page',
        });
      });

      expect(result.current.activeFilters).toEqual({
        category: 'business',
        status: 'archived',
        type: 'page',
      });
    });

    it('should allow direct manipulation of submitted filters', () => {
      const { result } = renderHook(() => useSearchFilters(sampleFilterConfigs));

      act(() => {
        result.current.setSubmittedFiltersState({
          category: 'tech',
          status: 'active',
          type: '',
        });
      });

      expect(result.current.submittedFilters).toEqual({
        category: 'tech',
        status: 'active',
        type: '',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle filters with no options', () => {
      const configs: FilterConfig[] = [
        {
          name: 'empty',
          label: 'Empty Filter',
          options: [],
        },
      ];

      const { result } = renderHook(() => useSearchFilters(configs));

      expect(result.current.activeFilters).toEqual({ empty: '' });
      expect(result.current.getFilterValueLabel('empty')).toBe('');
    });

    it('should handle dynamic filter config changes', () => {
      const { result, rerender } = renderHook(({ configs }) => useSearchFilters(configs), {
        initialProps: { configs: sampleFilterConfigs },
      });

      expect(result.current.filterConfigs).toHaveLength(3);

      const newConfigs = sampleFilterConfigs.slice(0, 2);
      rerender({ configs: newConfigs });

      expect(result.current.filterConfigs).toHaveLength(2);
    });
  });
});
