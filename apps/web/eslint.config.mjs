import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

import { sharedRules } from '@vastrix/config/eslint';

/**
 * ESLint flat configuration.
 *
 * `eslint-config-next` 16 ships native flat configs, so they are imported directly rather than
 * bridged through `@eslint/eslintrc`'s FlatCompat. The bridge fails on ESLint 10 with
 * "Converting circular structure to JSON" while validating the plugin graph — using the native
 * export avoids the legacy validator entirely.
 *
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**', 'public/**'],
  },

  ...nextCoreWebVitals,
  ...nextTypeScript,

  {
    /**
     * The React version is pinned rather than auto-detected.
     *
     * `eslint-plugin-react`'s version detection calls `context.getFilename()`, which ESLint 10
     * removed, so `version: 'detect'` throws "contextOrFilename.getFilename is not a function"
     * on every file. Stating the version skips that code path entirely.
     *
     * Keep this in step with the `react` dependency in package.json.
     */
    settings: {
      react: { version: '19.3' },
    },
  },

  {
    rules: {
      ...sharedRules,
    },
  },

  {
    // Config files and the Nginx header generator legitimately read process.env and log to the
    // console before the validated env module exists.
    files: ['*.config.{mjs,ts}', 'lib/security-headers.mjs', 'next.config.mjs'],
    rules: {
      'no-console': 'off',
      'no-restricted-imports': 'off',
    },
  },

  {
    // Tests assert against internals and use non-null assertions on known-good fixtures.
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];

export default config;
