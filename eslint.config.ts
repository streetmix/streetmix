import { defineConfig, globalIgnores } from 'eslint/config'
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import globals from 'globals'
import babelParser from '@babel/eslint-parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import cypress from 'eslint-plugin-cypress/flat'
import importPlugin from 'eslint-plugin-import'
import love from 'eslint-config-love'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
})

export default defineConfig([
  globalIgnores([
    'client/src/vendor/',
    'test/integration/smoke.spec.js',
    '**/build',
    '**/docs'
  ]),
  js.configs.recommended,
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'], // Add this with React 17+, apparently
    files: ['**/*.{js,jsx,ts,tsx,cjs}'],
    extends: fixupConfigRules(
      compat.extends(
        'standard',
        'standard-jsx',
        'standard-react',
        'plugin:import/errors',
        'plugin:import/warnings'
      )
    ),
    plugins: {
      'react-hooks': fixupPluginRules(reactHooks)
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'import/no-unresolved': 0,
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          pathGroups: [
            {
              pattern: '~/**',
              group: 'internal'
            }
          ]
        }
      ],
      'jsx-quotes': ['error', 'prefer-double'],
      'react/jsx-no-bind': 0,
      'no-restricted-globals': [
        'error',
        {
          name: 'isNaN',
          message: 'Use Number.isNaN() instead of the global isNan().'
        },
        {
          name: 'isFinite',
          message: 'Use Number.isFinite() instead of the global isFinite().'
        },
        {
          name: 'parseInt',
          message: 'Use Number.parseInt() instead of the global parseInt().'
        },
        {
          name: 'parseFloat',
          message: 'Use Number.parseFloat() instead of the global parseFloat().'
        }
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    // Only run TypeScript linting on TypeScript files
    ...love,
    files: ['client/**/*.{ts,tsx}', 'packages/**/*.ts'],
    extends: fixupConfigRules(
      compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript'
      )
    ),
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(importPlugin)
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: {
          // Run eslint on configuration and test files that will _not_ be
          // built by the TypeScript compiler. Globs are not allowed here, so
          // we need to specify included test file paths.
          allowDefaultProject: [
            'packages/*/vitest.config.ts',
            'packages/utils/src/*.test.ts'
          ]
        }
      }
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true
      }
    },
    rules: {
      // Turns off an error added in typescript-eslint v8 (?) that is much too
      // strict re: unused variables that exist, like destructured
      // arrays, try/catch errors, event handlers etc
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.vitest
      }
    }
  },
  {
    files: ['cypress/**/*.cy.js'],
    extends: [cypress.configs.recommended]
  }
])
