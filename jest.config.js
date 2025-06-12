export default {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'jest-fixed-jsdom',
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'd.ts'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.ts',
    '\\.(css|sass|scss|less)$': '<rootDir>/src/__mocks__/styleMock.ts',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@i18n/(.*)$': '<rootDir>/src/infrastructure/i18n/$1',
    '^@styles/(.*)$': '<rootDir>/src/ui/styles/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  modulePaths: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(axios|@babel|@testing-library|react|react-dom)/)'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  collectCoverage: false,
  resetMocks: true,
  clearMocks: true,
  restoreMocks: true,
  moduleDirectories: ['node_modules'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
