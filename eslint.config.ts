import { defineConfig, globalIgnores } from 'eslint/config'
import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { createNodeResolver, importX } from 'eslint-plugin-import-x'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import node from 'eslint-plugin-n'
// @ts-expect-error no types published for eslint-plugin-promise
import pluginPromise from 'eslint-plugin-promise'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import cypress from 'eslint-plugin-cypress'
import formatjs from 'eslint-plugin-formatjs'

export default defineConfig([
  globalIgnores(['client/src/vendor/', '**/build', '**/coverage', '**/docs']),
  eslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  pluginPromise.configs['flat/recommended'],
  reactRefresh.configs.recommended(),
  formatjs.configs.recommended,
  {
    files: ['app/**/*.{js,ts}'],
    plugins: { n: node },
    extends: ['n/recommended-module'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Falsely flags imports of `*.js` files, for some reason.
      'n/no-missing-import': 'off',
    },
  },
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'], // Add this with React 17+, apparently
    ...reactHooks.configs.flat.recommended,
    files: ['**/*.{js,ts,tsx,cjs}'],
    // plugins: { formatjs },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver(),
        createNodeResolver(),
      ],
    },
    rules: {
      // Usually importing on a "namespace" like L or React is intentional
      'import-x/no-named-as-default-member': 0,
      // This doesn't understand ~/ imports
      'import-x/no-unresolved': 0,
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '~/**',
              group: 'internal',
            },
          ],
        },
      ],
      'react/jsx-no-bind': 0,
      'no-restricted-globals': [
        'error',
        {
          name: 'isNaN',
          message: 'Use Number.isNaN() instead of the global isNan().',
        },
        {
          name: 'isFinite',
          message: 'Use Number.isFinite() instead of the global isFinite().',
        },
        {
          name: 'parseInt',
          message: 'Use Number.parseInt() instead of the global parseInt().',
        },
        {
          name: 'parseFloat',
          message:
            'Use Number.parseFloat() instead of the global parseFloat().',
        },
      ],
      // `react-hooks` plugin really wants us to define rules explicitly
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Relax `no-unused-vars` in certain legitimate use cases.
      // Options generally match corresponding @typescript-eslint rule
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Temporarily warns on promise errors -- TODO: refactor then turn off
      'promise/always-return': 'warn',
      'promise/catch-or-return': 'warn',
      // Temporarily warns on new errors introduced to eslint:recommended in
      // eslint v10 -- TODO: refactor then turn off warnings
      'no-unassigned-vars': 'warn',
      // We do not have description requirements here
      'formatjs/enforce-description': 0,
      // This is very useful but VERY noisy right now, need to selectively
      // disable for components where we intentionally don't need it. Don't
      // disable then run --fix, it will remove all the eslint comments
      // 'formatjs/no-literal-string-in-jsx': 'warn',
      // Disable this because it enforces 'literal' no matter what option you
      // set, and some defaultMessages are generated for us.
      // Reported: https://github.com/formatjs/formatjs/issues/7475
      'formatjs/enforce-default-message': ['off', 'literal'],
      'formatjs/enforce-message-types': ['error', { generateTypes: true }],
    },
  },
  {
    // Only run TypeScript linting on TypeScript files
    files: [
      'client/**/*.{ts,tsx}',
      'packages/**/*.ts',
      'app/**/*.ts',
      'app.ts',
    ],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: {
          // Run eslint on configuration and test files that will _not_ be
          // built by the TypeScript compiler. Globs are not allowed here, so
          // we need to specify included test file paths.
          allowDefaultProject: [
            'packages/*/vitest.config.ts',
            'packages/utils/src/*.test.ts',
            'packages/parts/src/*.test.ts',
          ],
        },
      },
    },
    rules: {
      // Relaxes strict error checking for unused variables.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // Allows unused variables to be prefixed with `_`
          // Event handlers generally should not omit arguments
          argsIgnorePattern: '^_',
          // Allows argument passed to catch() to be unused
          caughtErrors: 'none',
          // Allow rest properties to omit sibling properties from an object
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['**/*.test.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.vitest,
      },
    },
  },
  {
    files: ['cypress/**/*.cy.ts'],
    extends: [cypress.configs.recommended],
  },
])
