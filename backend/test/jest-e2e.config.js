module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/../src/$1',
    '^@common/(.*)$': '<rootDir>/../src/common/$1',
    '^@config/(.*)$': '<rootDir>/../src/config/$1',
  },
}; 