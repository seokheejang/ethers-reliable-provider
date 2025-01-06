/* eslint-disable no-undef */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/*.test.ts', '**/test/**/*.test.ts'],
  testTimeout: 500000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig-cjs.json',
      },
    ],
  },
  setupFiles: ['dotenv/config'],
};
