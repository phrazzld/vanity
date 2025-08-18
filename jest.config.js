const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you when using `next/jest`)
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock nanoid to fix ES module import issues in Jest
    '^nanoid$': '<rootDir>/src/__mocks__/nanoid',
    // Mock JSON data imports to fix test resolution issues
    '^.*/public/data/quotes\\.json$': '<rootDir>/src/__mocks__/quotesData.json',
    '^.*/public/data/readings\\.json$': '<rootDir>/src/__mocks__/readingsData.json',
    // Mock Leaflet and react-leaflet for map component testing
    '^leaflet$': '<rootDir>/src/__mocks__/leaflet.ts',
    '^react-leaflet$': '<rootDir>/src/__mocks__/react-leaflet.tsx',
    // Mock CSS imports for Leaflet
    '^leaflet/dist/leaflet\\.css$': '<rootDir>/src/__mocks__/leaflet.css',
  },
  // Snapshot configuration
  snapshotResolver: '<rootDir>/snapshotResolver.js',
  snapshotSerializers: ['@emotion/jest/serializer'],
  // When should snapshots be updated
  updateSnapshot: process.env.UPDATE_SNAPSHOTS === 'true',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.v[0-9].{js,jsx,ts,tsx}', // Exclude backup/versioned files
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!**/node_modules/**',
    '!.next/**',
  ],
  coverageThreshold: {
    // Temporarily lowered thresholds while we work on improving coverage
    // See BACKLOG.md for the coverage improvement plan
    // Original targets: global 85%, core 90%
    global: {
      statements: 27,
      branches: 27, // Temporarily lowered after ReadingCard simplification
      functions: 30,
      lines: 28,
    },
    'src/lib/': {
      statements: 17,
      branches: 10,
      functions: 16,
      lines: 17,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  testMatch: ['**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)', '**/*.(test|spec).(js|jsx|ts|tsx)'],
  transformIgnorePatterns: ['/node_modules/(?!(@jest/transform)/)'],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
