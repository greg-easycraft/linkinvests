module.exports = {
  extends: ['../../eslint.config.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
