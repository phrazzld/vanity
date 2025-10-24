/* eslint-env jest */
/**
 * Zustand Mock for Jest Testing
 *
 * Provides automatic state reset between tests to prevent state bleeding.
 * Based on official Zustand testing guide: https://zustand.docs.pmnd.rs/guides/testing
 *
 * IMPORTANT: This manual mock must be explicitly activated in jest.setup.js
 * with jest.mock('zustand'). Jest does NOT auto-load manual mocks from
 * src/__mocks__/ - they require explicit activation.
 *
 * Usage:
 * - jest.setup.js contains jest.mock('zustand') to activate this mock
 * - Jest automatically uses this mock when tests import from 'zustand'
 * - All stores created during tests will be reset after each test
 */

import { act } from '@testing-library/react';
import type * as zustand from 'zustand';

// Get the actual implementations from the real zustand module
const { create: actualCreate, createStore: actualCreateStore } =
  jest.requireActual<typeof zustand>('zustand');

// Track all store reset functions
export const storeResetFns = new Set<() => void>();

/**
 * Creates a store with automatic reset capability
 * Captures the initial state and registers a reset function
 */
const createUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
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
export const create = (<T>(stateCreator: zustand.StateCreator<T>) => {
  // Support both usage patterns:
  // 1. create(stateCreator) - direct call
  // 2. create<T>()(stateCreator) - curried with type parameter
  return typeof stateCreator === 'function' ? createUncurried(stateCreator) : createUncurried;
}) as typeof zustand.create;

/**
 * Mock implementation of zustand's createStore function
 * Similar to create but returns the store directly without hook
 */
const createStoreUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = actualCreateStore(stateCreator);
  const initialState = store.getState();

  // Register reset function
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });

  return store;
};

export const createStore = (<T>(stateCreator: zustand.StateCreator<T>) => {
  return typeof stateCreator === 'function'
    ? createStoreUncurried(stateCreator)
    : createStoreUncurried;
}) as typeof zustand.createStore;

/**
 * Reset all stores after each test
 * Wrapped in act() to handle React state updates properly
 *
 * TIMING: Runs after test cleanup but before next test setup
 * This ensures each test starts with a fresh store state
 */
afterEach(() => {
  act(() => {
    storeResetFns.forEach(resetFn => {
      resetFn();
    });
  });
});
