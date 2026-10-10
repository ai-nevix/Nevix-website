/**
 * Shared ESLint rules for the NEVIX monorepo.
 *
 * Kept deliberately small: the rules here are the ones that catch real defects or enforce a
 * decision recorded elsewhere in the repo. Stylistic concerns are Prettier's job.
 */

/** @type {import('eslint').Linter.Config['rules']} */
export const sharedRules = {
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['../../../*'],
          message: 'Use the "@/" path alias instead of deep relative imports.',
        },
      ],
    },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'warn',
    { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
  ],
  eqeqeq: ['error', 'smart'],
  'prefer-const': 'error',
};

/**
 * Secrets must never reach the browser bundle (specification §13.1, §22).
 * Only NEXT_PUBLIC_* may be read from client components.
 */
export const clientEnvRule = {
  'no-restricted-properties': [
    'error',
    {
      object: 'process',
      property: 'env',
      message:
        'Read environment variables through lib/env.ts. Client components may only use NEXT_PUBLIC_* values.',
    },
  ],
};
