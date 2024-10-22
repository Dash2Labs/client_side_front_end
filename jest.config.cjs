module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'src/tsconfig.client.json',
    }],
    '^.+\\.jsx?$': 'babel-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
};