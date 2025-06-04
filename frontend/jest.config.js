export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    // If you use module aliases in your tsconfig.json, map them here
    // e.g., '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^axios$': '<rootDir>/src/lib/__mocks__/axios.js', // Mock axios by default
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest', // If you have JS/JSX files to transform
  },
  // Jest will not try to transform files within node_modules, except for those you specify.
  // If you have ES modules in node_modules that Jest needs to transform:
  // transformIgnorePatterns: [
  //   '/node_modules/(?!your-es-module-dependency).+\\.js$'
  // ],
};
