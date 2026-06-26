module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts', '**/*.test.ts', '**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/config/**',
    '!src/openapi.spec.ts',
    '!src/**/*.middleware.ts',
  ],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  globalSetup: '<rootDir>/jest.global-setup.ts',
  globalTeardown: '<rootDir>/jest.global-teardown.ts',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'openapi.spec.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 24,
      functions: 33,
      lines: 45,
      statements: 45,
    },
  },
};
