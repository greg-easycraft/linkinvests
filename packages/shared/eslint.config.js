module.exports = {
  extends: ['../../eslint.config.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/*.e2e-spec.ts', '**/*.e2e-spec.tsx'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],
};
