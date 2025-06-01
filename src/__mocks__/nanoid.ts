/**
 * Mock implementation of nanoid for Jest testing environment
 *
 * This mock provides a deterministic ID generation for testing while maintaining
 * the same interface as the real nanoid library. Real nanoid is still used in
 * production builds.
 */

let counter = 0;

/**
 * Mock nanoid function that generates deterministic IDs for testing
 * Format: "mock-id-{counter}" for easy identification in tests
 */
export const nanoid = (): string => {
  counter += 1;
  return `mock-id-${counter.toString().padStart(3, '0')}`;
};

/**
 * Reset counter for test isolation (if needed)
 * Can be called in test setup/teardown
 */
export const resetMockNanoid = (): void => {
  counter = 0;
};
