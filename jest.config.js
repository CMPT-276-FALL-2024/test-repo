module.exports = {
  transform: {
    '^.+\\.[t|j]s$': 'babel-jest',  // Using babel-jest to transpile JS/TS files
  },
  testEnvironment: 'node',  // Use the node test environment
  verbose: true,  // Optional: Make tests verbose for better output
};
