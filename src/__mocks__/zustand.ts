/* eslint-env jest */
/**
 * Zustand Mock for Jest Testing
 *
 * Provides automatic state reset between tests to prevent state bleeding.
 * Based on official Zustand testing guide: https://zustand.docs.pmnd.rs/guides/testing
 *
 * Usage:
 * - Place this file in src/__mocks__/zustand.ts
 * - Jest automatically uses this mock when tests import from 'zustand'
 * - All stores created during tests will be reset after each test
 */

import { act } from '@testing-library/react';
import type * as ZustandExportedTypes from 'zustand';

// Re-export everything from the real zustand module
export * from 'zustand';

// Get the actual implementations from the real zustand module
const { create: actualCreate, createStore: actualCreateStore } =
  jest.requireActual<typeof ZustandExportedTypes>('zustand');

// Track all store reset functions
export const storeResetFns = new Set<() => void>();

/**
 * Creates a store with automatic reset capability
 * Captures the initial state and registers a reset function
 */
const createUncurried = <T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  const store = actualCreate(stateCreator);
  const initialState = store.getState();

  // Register reset function that restores initial state
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });

  return store;
};

/**
 * Mock implementation of zustand's create function
 * Supports both curried and uncurried usage patterns
 */
export const create = (<T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  // Support both usage patterns:
  // 1. create(stateCreator) - direct call
  // 2. create<T>()(stateCreator) - curried with type parameter
  return typeof stateCreator === 'function' ? createUncurried(stateCreator) : createUncurried;
}) as typeof ZustandExportedTypes.create;

/**
 * Mock implementation of zustand's createStore function
 * Similar to create but returns the store directly without hook
 */
const createStoreUncurried = <T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  const store = actualCreateStore(stateCreator);
  const initialState = store.getState();

  // Register reset function
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });

  return store;
};

export const createStore = (<T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  return typeof stateCreator === 'function'
    ? createStoreUncurried(stateCreator)
    : createStoreUncurried;
}) as typeof ZustandExportedTypes.createStore;

/**
 * Reset all stores after each test
 * Wrapped in act() to handle React state updates properly
 */
afterEach(() => {
  act(() => {
    storeResetFns.forEach(resetFn => {
      resetFn();
    });
  });
});
