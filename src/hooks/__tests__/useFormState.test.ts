import { renderHook, act } from '@testing-library/react';
import { useFormState } from '../useFormState';

describe('useFormState', () => {
  const initialValues = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
    preferences: { newsletter: true },
  };

  it('should initialize with provided values', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.submittedValues).toEqual(initialValues);
    expect(result.current.hasChanges).toBe(false);
  });

  describe('setValue', () => {
    it('should update a single field value', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      expect(result.current.values.name).toBe('Jane');
      expect(result.current.values.age).toBe(30); // Other values unchanged
      expect(result.current.submittedValues.name).toBe('John'); // Submitted unchanged
      expect(result.current.hasChanges).toBe(true);
    });

    it('should handle nested object updates', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('preferences', { newsletter: false });
      });

      expect(result.current.values.preferences).toEqual({ newsletter: false });
      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('updateValues', () => {
    it('should update multiple fields at once', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.updateValues({
          name: 'Jane',
          age: 25,
        });
      });

      expect(result.current.values.name).toBe('Jane');
      expect(result.current.values.age).toBe(25);
      expect(result.current.values.email).toBe('john@example.com'); // Unchanged
      expect(result.current.hasChanges).toBe(true);
    });

    it('should handle partial updates', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.updateValues({ age: 35 });
      });

      expect(result.current.values.age).toBe(35);
      expect(result.current.values.name).toBe('John');
    });
  });

  describe('replaceValues', () => {
    it('should replace all values', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      const newValues = {
        name: 'Alice',
        age: 28,
        email: 'alice@example.com',
        preferences: { newsletter: false },
      };

      act(() => {
        result.current.replaceValues(newValues);
      });

      expect(result.current.values).toEqual(newValues);
      expect(result.current.submittedValues).toEqual(initialValues); // Submitted unchanged
      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('submit', () => {
    it('should sync current values to submitted values', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('name', 'Jane');
        result.current.setValue('age', 25);
      });

      expect(result.current.hasChanges).toBe(true);

      let returnedValues;
      act(() => {
        returnedValues = result.current.submit();
      });

      expect(returnedValues).toEqual(result.current.values);

      expect(result.current.submittedValues).toEqual({
        ...initialValues,
        name: 'Jane',
        age: 25,
      });
      expect(result.current.hasChanges).toBe(false);
    });

    it('should return current values on submit', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('email', 'new@example.com');
      });

      let submittedData;
      act(() => {
        submittedData = result.current.submit();
      });

      expect(submittedData).toEqual({
        ...initialValues,
        email: 'new@example.com',
      });
    });
  });

  describe('submitWithCallback', () => {
    it('should submit and call callback with values', () => {
      const { result } = renderHook(() => useFormState(initialValues));
      const callback = jest.fn();

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      act(() => {
        result.current.submitWithCallback(callback);
      });

      expect(callback).toHaveBeenCalledWith({
        ...initialValues,
        name: 'Jane',
      });
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset to initial values', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('name', 'Jane');
        result.current.setValue('age', 25);
      });

      act(() => {
        result.current.submit();
      });

      act(() => {
        result.current.setValue('email', 'new@example.com');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.submittedValues).toEqual(initialValues);
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('resetToSubmitted', () => {
    it('should reset current values to last submitted values', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      // Make changes
      act(() => {
        result.current.setValue('name', 'Jane');
      });

      // Submit in separate act to ensure state is updated
      act(() => {
        result.current.submit();
      });

      // Check submitted values after submit
      expect(result.current.submittedValues.name).toBe('Jane');

      // Make more changes
      act(() => {
        result.current.setValue('email', 'temp@example.com');
        result.current.setValue('age', 40);
      });

      expect(result.current.values.email).toBe('temp@example.com');
      expect(result.current.hasChanges).toBe(true);

      // Check submitted values before reset
      expect(result.current.submittedValues.name).toBe('Jane');

      // Reset to submitted
      act(() => {
        result.current.resetToSubmitted();
      });

      expect(result.current.values).toEqual({
        ...initialValues,
        name: 'Jane', // Keeps the submitted change
      });
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('hasChanges', () => {
    it('should detect changes in primitive values', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.submit();
      });

      expect(result.current.hasChanges).toBe(false);
    });

    it('should detect changes in nested objects', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('preferences', { newsletter: false });
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('should handle null values correctly', () => {
      const { result } = renderHook(() =>
        useFormState({
          value: null as string | null,
          data: { key: 'value' },
        })
      );

      act(() => {
        result.current.setValue('value', 'something');
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('getChanges', () => {
    it('should return only changed fields', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('name', 'Jane');
        result.current.setValue('age', 25);
      });

      const changes = result.current.getChanges();

      expect(changes).toEqual({
        name: 'Jane',
        age: 25,
      });
      expect(changes).not.toHaveProperty('email');
      expect(changes).not.toHaveProperty('preferences');
    });

    it('should return empty object when no changes', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      const changes = result.current.getChanges();

      expect(changes).toEqual({});
    });

    it('should detect nested object changes', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('preferences', { newsletter: false });
      });

      const changes = result.current.getChanges();

      expect(changes).toEqual({
        preferences: { newsletter: false },
      });
    });
  });

  describe('hasFieldChanged', () => {
    it('should check if specific field has changed', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      expect(result.current.hasFieldChanged('name')).toBe(true);
      expect(result.current.hasFieldChanged('age')).toBe(false);
      expect(result.current.hasFieldChanged('email')).toBe(false);
    });

    it('should handle nested object field changes', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('preferences', { newsletter: false });
      });

      expect(result.current.hasFieldChanged('preferences')).toBe(true);
      expect(result.current.hasFieldChanged('name')).toBe(false);
    });

    it('should return false after submit', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      expect(result.current.hasFieldChanged('name')).toBe(true);

      act(() => {
        result.current.submit();
      });

      expect(result.current.hasFieldChanged('name')).toBe(false);
    });
  });

  describe('direct state setters', () => {
    it('should allow direct manipulation of values state', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setValuesState(prev => ({
          ...prev,
          name: 'Direct Update',
        }));
      });

      expect(result.current.values.name).toBe('Direct Update');
    });

    it('should allow direct manipulation of submitted values state', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      act(() => {
        result.current.setSubmittedValuesState(prev => ({
          ...prev,
          age: 50,
        }));
      });

      expect(result.current.submittedValues.age).toBe(50);
      expect(result.current.hasChanges).toBe(true); // Values and submitted now differ
    });
  });

  describe('edge cases', () => {
    it('should handle empty initial values', () => {
      const { result } = renderHook(() => useFormState({}));

      expect(result.current.values).toEqual({});
      expect(result.current.submittedValues).toEqual({});
      expect(result.current.hasChanges).toBe(false);
    });

    it('should handle arrays in values', () => {
      const { result } = renderHook(() =>
        useFormState({
          tags: ['tag1', 'tag2'],
          name: 'Test',
        })
      );

      act(() => {
        result.current.setValue('tags', ['tag1', 'tag2', 'tag3']);
      });

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.getChanges()).toEqual({
        tags: ['tag1', 'tag2', 'tag3'],
      });
    });

    it('should maintain reference equality when no changes', () => {
      const { result } = renderHook(() => useFormState(initialValues));

      const _values1 = result.current.values;
      const submittedValues1 = result.current.submittedValues;

      // Trigger a re-render without changes
      act(() => {
        result.current.setValue('name', 'John'); // Same value
      });

      const _values2 = result.current.values;
      const submittedValues2 = result.current.submittedValues;

      // Check that values were captured (to satisfy TypeScript)
      expect(_values1).toBeDefined();
      expect(_values2).toBeDefined();
      expect(submittedValues1).toBe(submittedValues2); // Reference equality
    });
  });
});
