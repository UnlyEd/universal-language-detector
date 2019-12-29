module.exports = {
  verbose: true,
  testEnvironment: 'node',
  preset: 'ts-jest',
  roots: [
    '<rootDir>/src',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
  ]
};
