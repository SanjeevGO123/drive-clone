module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Convert some errors to warnings
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/alt-text': 'warn',
    
    // Keep these as errors (build-breaking)
    'no-unused-vars': 'error',
    'no-undef': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    
    // Allow warnings for these common issues
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    }
  ]
};
