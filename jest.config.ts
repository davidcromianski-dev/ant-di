import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/__tests__/**/*.+(ts)', '**/?(*.)+(spec|test).+(ts)'],
  transform: {
    '^.+\\.(ts)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
  },
};

export default config;
