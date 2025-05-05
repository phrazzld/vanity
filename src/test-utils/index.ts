// src/test-utils/index.ts
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';

// Mock Fetch Response Helper
export function createMockResponse<T>(data: T, status = 200, statusText = 'OK') {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

// Create a failed response
export function createMockErrorResponse(
  status = 500,
  statusText = 'Server Error',
  message = 'An error occurred'
) {
  return {
    ok: false,
    status,
    statusText,
    json: jest.fn().mockResolvedValue({ error: message }),
    text: jest.fn().mockResolvedValue(JSON.stringify({ error: message })),
  };
}

// Mocks the global fetch for testing API calls
export function mockFetch<T>(data: T, status = 200) {
  const mockResponse = createMockResponse(data, status);
  global.fetch = jest.fn().mockResolvedValue(mockResponse);
  return { mockResponse, mockFetch: global.fetch };
}

// Helper to wait for a condition
export function waitForCondition(
  callback: () => boolean | Promise<boolean>,
  { timeout = 1000, interval = 50 } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = async () => {
      const result = await callback();
      if (result) {
        resolve();
        return;
      }

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > timeout) {
        reject(new Error(`Timed out waiting for condition after ${timeout}ms`));
        return;
      }

      setTimeout(checkCondition, interval);
    };

    checkCondition();
  });
}

// Export everything from testing library to make imports cleaner
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
