/**
 * Jest configuration for audit-filter tests
 *
 * @jest-environment node
 */

// This file is not a test file - it's a configuration file

// Create a specialized config for audit-filter tests
/** @type {import('jest').Config} */
const _auditFilterConfig = {
  // Simple configuration for our tests
  testEnvironment: 'node',
  roots: ['<rootDir>/src/lib/audit-filter'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/lib/audit-filter/jest.setup.js'],
  testMatch: ['<rootDir>/src/lib/audit-filter/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', '<rootDir>/src/lib/audit-filter/__mocks__'],
  // Skip the setup and config files when running tests
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/lib/audit-filter/jest.setup.js',
    '<rootDir>/src/lib/audit-filter/jest.config.js',
    '<rootDir>/src/lib/audit-filter/__tests__/.eslintrc.js',
    '<rootDir>/src/lib/audit-filter/__tests__/tsconfig.json',
  ],
};

// Export this to make it a valid Jest config file
module.exports = _auditFilterConfig;
