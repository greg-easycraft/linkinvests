module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [],
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
  };
};
