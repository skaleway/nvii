const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './apps/web',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/apps/web/$1',
    '^@nvii/(.*)$': '<rootDir>/packages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  projects: [
    {
      displayName: 'web',
      testMatch: ['<rootDir>/apps/web/**/*.test.{js,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testEnvironment: 'jest-environment-jsdom',
    },
    {
      displayName: 'cli',
      testMatch: ['<rootDir>/packages/cli/**/*.test.{js,ts}'],
      testEnvironment: 'node',
    },
    {
      displayName: 'env-helpers',
      testMatch: ['<rootDir>/packages/env-helpers/**/*.test.{js,ts}'],
      testEnvironment: 'node',
    },
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
