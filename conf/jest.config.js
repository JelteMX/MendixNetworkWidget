const paths = require('./paths');
const React = require('react');
module.exports = {
  verbose: true,
  transform: { '^.+\\.js$': '<rootDir>/jest.processor.js' },
  rootDir: __dirname,
  roots: [paths.srcDir],
  globals: {
    react: React
  }
};
