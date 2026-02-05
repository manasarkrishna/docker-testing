module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'server.js',
    'utils/**/*.js',
    '!**/node_modules/**',
  ],
  testTimeout: 10000,
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/unit/**/*.test.js'],
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/integration/**/*.test.js'],
    },
  ],
};
