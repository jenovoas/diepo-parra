export default {
  preset: 'ts-jest/presets/default-esm', // Use default-esm preset for better ESM support
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'],
  transform: {
    // Explicitly define transformations for ts, tsx, js, and jsx files
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.json', // Specify tsconfig if needed
    }],
  },
  transformIgnorePatterns: [
    // Transform all node_modules except specific ESM packages
    'node_modules/(?!jose|next-auth|@next-auth)/',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/setupTests.ts', // Ignore setupTests.ts as a test file
  ],
};
