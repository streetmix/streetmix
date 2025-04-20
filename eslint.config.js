// This should be able to be done in TypeScript in a recent version of ESLint 9
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, globalIgnores } from 'eslint/config'
// import js from '@eslint/js'

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'

import react from 'eslint-plugin-react'
import cypress from 'eslint-plugin-cypress'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import babelParser from '@babel/eslint-parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import _import from 'eslint-plugin-import'
import tsParser from '@typescript-eslint/parser'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

// TODO
// js.configs.recommended,
export default defineConfig([
  globalIgnores([
    'client/src/vendor/',
    'test/integration/smoke.spec.js',
    '**/build',
    '**/docs'
  ]),
  {
    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'plugin:react/recommended',
        'standard',
        'standard-jsx',
        'standard-react',
        'plugin:import/errors',
        'plugin:import/warnings'
      )
    ),

    plugins: {
      react: fixupPluginRules(react),
      cypress,
      'react-hooks': fixupPluginRules(reactHooks)
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...cypress.environments.globals.globals,
        ...globals.node,
        ...globals.mocha
      },

      parser: babelParser,
      ecmaVersion: 6,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },

        babelOptions: {
          plugins: [
            [
              '@babel/plugin-syntax-import-attributes',
              {
                deprecatedAssertSyntax: true
              }
            ]
          ]
        }
      }
    },

    settings: {
      react: {
        version: 'detect'
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
      'react/jsx-boolean-value': ['error', 'always'],
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
    files: ['client/**/*.ts', 'client/**/*.tsx', 'packages/types/**/*.ts'],

    extends: fixupConfigRules(
      compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'standard-with-typescript'
      )
    ),

    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import)
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        tsconfigRootDir: 'client',
        project: './tsconfig.json'
      }
    },

    settings: {
      'import/resolver': {
        typescript: true,
        node: true
      }
    },

    rules: {
      '@typescript-eslint/no-unsafe-argument': 'warn',

      '@typescript-eslint/strict-boolean-expressions': [
        2,
        {
          allowString: true
        }
      ],

      '@typescript-eslint/unbound-method': 'off'
    }
  },
  {
    files: ['packages/export-image/**/*.ts'],

    extends: fixupConfigRules(
      compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'standard-with-typescript'
      )
    ),

    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import)
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        tsconfigRootDir: 'packages/export-image',
        project: './tsconfig.json'
      }
    },

    settings: {
      'import/resolver': {
        typescript: true,
        node: true
      }
    },

    rules: {
      '@typescript-eslint/naming-convention': 'off'
    }
  },
  {
    files: ['packages/i18n/src/*.ts'],

    extends: fixupConfigRules(
      compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'standard-with-typescript'
      )
    ),

    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import)
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        tsconfigRootDir: 'packages/i18n',
        project: './tsconfig.json'
      }
    },

    settings: {
      'import/resolver': {
        typescript: true,
        node: true
      }
    }
  }
])
