module.exports = {
  'roots': [
    'app',
    'assets/scripts',
    'test'
  ],
  'setupFiles': [
    './test/setup-jest.js'
  ],
  'testPathIgnorePatterns': [
    './test/integration'
  ],
  'transform': {
    '^.+\\.jsx?$': 'babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/assets/scripts/util/fileTransform.js'
  },
  'transformIgnorePatterns': [
    '<rootDir>/node_modules/(?!lodash-es).+\\.js$'
  ],
  'snapshotSerializers': [
    'enzyme-to-json/serializer'
  ],
  'collectCoverageFrom': [
    'app.js',
    'app/**/*.{js,jsx}',
    'assets/scripts/**/*.{js,jsx}',
    '!assets/scripts/vendor/**/*.{js,jsx}'
  ],
  'moduleNameMapper': {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
    '\\.(css|scss)$': '<rootDir>/test/__mocks__/styleMock.js'
  },
  'moduleDirectories': [
    'node_modules' // This is required
  ],
  'moduleFileExtensions': [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node'
  ]
}
