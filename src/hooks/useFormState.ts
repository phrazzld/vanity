import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Hook that manages dual state for forms - tracking both current and submitted values
 *
 * This pattern is useful for forms where you need to:
 * - Know what values have been submitted vs what's currently being edited
 * - Show visual indicators when there are unsaved changes
 * - Support both immediate and deferred submission patterns
 * - Reset to last submitted state or initial state
 *
 * @template T - The type of the form values
 * @param initialValues - The initial values for the form
 * @returns Object with state management utilities
 *
 * @example
 * ```tsx
 * function SearchForm() {
 *   const {
 *     values,
 *     submittedValues,
 *     setValue,
 *     setValues,
 *     submit,
 *     reset,
 *     resetToSubmitted,
 *     hasChanges
 *   } = useFormState({
 *     query: '',
 *     category: 'all'
 *   });
 *
 *   const handleSubmit = (e: FormEvent) => {
 *     e.preventDefault();
 *     submit();
 *     // Perform search with submittedValues
 *     performSearch(submittedValues);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={values.query}
 *         onChange={(e) => setValue('query', e.target.value)}
 *       />
 *       <button type="submit" disabled={!hasChanges}>
 *         Search
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useFormState<T extends Record<string, any>>(initialValues: T) {
  // Current values (what's in the form inputs)
  const [values, setValues] = useState<T>(initialValues);

  // Submitted values (what was last submitted)
  const [submittedValues, setSubmittedValues] = useState<T>(initialValues);

  // Keep a ref to the current values for immediate access
  const valuesRef = useRef<T>(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  /**
   * Set a single field value
   */
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => {
      const updated = {
        ...prev,
        [field]: value,
      };
      valuesRef.current = updated; // Update ref immediately
      return updated;
    });
  }, []);

  /**
   * Update multiple values at once
   */
  const updateValues = useCallback((updates: Partial<T>) => {
    setValues(prev => {
      const updated = {
        ...prev,
        ...updates,
      };
      valuesRef.current = updated; // Update ref immediately
      return updated;
    });
  }, []);

  /**
   * Replace all values
   */
  const replaceValues = useCallback((newValues: T) => {
    valuesRef.current = newValues; // Update ref immediately
    setValues(newValues);
  }, []);

  /**
   * Submit the current values (sync current to submitted)
   */
  const submit = useCallback(() => {
    // Use the ref to get the most current values
    const currentValues = valuesRef.current;
    setSubmittedValues(currentValues);
    return currentValues;
  }, []);

  /**
   * Submit with callback
   */
  const submitWithCallback = useCallback((callback: (values: T) => void) => {
    // Use the ref to get the most current values
    const currentValues = valuesRef.current;
    setSubmittedValues(currentValues);
    callback(currentValues);
  }, []);

  /**
   * Reset to initial values
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setSubmittedValues(initialValues);
  }, [initialValues]);

  /**
   * Reset current values to last submitted values
   */
  const resetToSubmitted = useCallback(() => {
    setValues(submittedValues);
  }, [submittedValues]);

  /**
   * Check if there are any changes between current and submitted values
   */
  const hasChanges = useMemo(() => {
    // Deep comparison for objects
    const keys = Object.keys(values) as Array<keyof T>;
    return keys.some(key => {
      const currentValue = values[key];
      const submittedValue = submittedValues[key];

      // Handle different types of values
      if (typeof currentValue === 'object' && currentValue !== null) {
        return JSON.stringify(currentValue) !== JSON.stringify(submittedValue);
      }

      return currentValue !== submittedValue;
    });
  }, [values, submittedValues]);

  /**
   * Get the changes between current and submitted values
   */
  const getChanges = useCallback((): Partial<T> => {
    const changes: Partial<T> = {};
    const keys = Object.keys(values) as Array<keyof T>;

    keys.forEach(key => {
      const currentValue = values[key];
      const submittedValue = submittedValues[key];

      const isDifferent =
        typeof currentValue === 'object' && currentValue !== null
          ? JSON.stringify(currentValue) !== JSON.stringify(submittedValue)
          : currentValue !== submittedValue;

      if (isDifferent) {
        changes[key] = currentValue;
      }
    });

    return changes;
  }, [values, submittedValues]);

  /**
   * Check if a specific field has changed
   */
  const hasFieldChanged = useCallback(
    <K extends keyof T>(field: K): boolean => {
      const currentValue = values[field];
      const submittedValue = submittedValues[field];

      if (typeof currentValue === 'object' && currentValue !== null) {
        return JSON.stringify(currentValue) !== JSON.stringify(submittedValue);
      }

      return currentValue !== submittedValue;
    },
    [values, submittedValues]
  );

  return {
    // State
    values,
    submittedValues,

    // Setters
    setValue,
    setValues: updateValues,
    updateValues,
    replaceValues,

    // Actions
    submit,
    submitWithCallback,
    reset,
    resetToSubmitted,

    // Status
    hasChanges,
    getChanges,
    hasFieldChanged,

    // Direct state setters (for advanced use cases)
    setValuesState: setValues,
    setSubmittedValuesState: setSubmittedValues,
  };
}

/**
 * Type helper for extracting the form values type from useFormState
 */
export type FormStateValues<T> = T extends { values: infer V } ? V : never;

/**
 * Type helper for the return type of useFormState
 */
export type FormState<T extends Record<string, any>> = ReturnType<typeof useFormState<T>>;
