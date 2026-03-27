import { defineConfig, globalIgnores } from 'eslint/config'
import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
// import importPlugin from 'eslint-plugin-import'
import pluginPromise from 'eslint-plugin-promise'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import cypress from 'eslint-plugin-cypress'

export default defineConfig([
  globalIgnores(['client/src/vendor/', '**/build', '**/coverage', '**/docs']),
  eslint.configs.recommended,
  // importPlugin.flatConfigs.recommended,
  pluginPromise.configs['flat/recommended'],
  reactRefresh.configs.recommended(),
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'], // Add this with React 17+, apparently
    ...reactHooks.configs.flat.recommended,
    files: ['**/*.{js,ts,tsx,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 'import/no-unresolved': 0,
      // 'import/order': [
      //   'warn',
      //   {
      //     groups: [
      //       'builtin',
      //       'external',
      //       'internal',
      //       'parent',
      //       'sibling',
      //       'index',
      //       'object',
      //       'type',
      //     ],
      //     pathGroups: [
      //       {
      //         pattern: '~/**',
      //         group: 'internal',
      //       },
      //     ],
      //   },
      // ],
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
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'warn',
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
