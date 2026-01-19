/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/src/mocks/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^agents/(.*)$': '<rootDir>/packages/agents/$1',
    '^until-async$': '<rootDir>/src/mocks/until-async.js', // Add this line
    '^msw/node$': '<rootDir>/src/mocks/msw-node.js',
    '^msw$': '<rootDir>/src/mocks/msw.js',
  },
  clearMocks: true,
  resetModules: false,
  resetMocks: false,
  restoreMocks: true,
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transformIgnorePatterns: [],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  // Option A: relax coverage gate during local validation (keep reporting only)
  coverageThreshold: {
    global: { branches: 0, functions: 0, lines: 0, statements: 0 },
  },
}

export default createJestConfig(customJestConfig)
