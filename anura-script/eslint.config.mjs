import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore build artifacts, dependencies, and config files
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.ts',
      '*.config.js',
      '*.config.mjs',
      '**/test-setup.ts',
      'src/core/anura-script.ts' // JSON polyfill needs control characters for broad browser support
    ]
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Custom configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Allow 'any' type - useful for legacy code and window objects
      '@typescript-eslint/no-explicit-any': 'off',

      // Allow unused vars that start with underscore
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'no-console': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': 'warn',
      'no-var': 'error',
      'prefer-rest-params': 'warn',
      'prefer-spread': 'warn',
      'no-prototype-builtins': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },

  // Test files get more relaxed rules
  {
    files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      'no-console': 'off',
    },
  }
);
