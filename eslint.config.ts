import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, globalIgnores } from 'eslint/config'
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
// import js from '@eslint/js'
import react from 'eslint-plugin-react'
import cypress from 'eslint-plugin-cypress/flat'
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
    files: ['cypress/**/*.cy.js'],
    plugins: {
      cypress
    },
    extends: [cypress.configs.recommended]
  },
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
      'react-hooks': fixupPluginRules(reactHooks)
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
        ...globals.vitest
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
    // Only run TypeScript linting on TypeScript files, otherwise it'd
    // report TypeScript errors on regular JavaScript files (bad!)
    files: ['client/**/*.ts', 'client/**/*.tsx', 'packages/types/**/*.ts'],
    extends: fixupConfigRules(
      compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'love'
      )
    ),
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import)
    },
    languageOptions: {
      parser: tsParser,
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
      // This was added as an error in eslint-config-love
      // v42.0.0 and is much too strict while parts of the app are still in JS
      // Warnings indicate opportunities for typescript porting
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/strict-boolean-expressions': [
        2,
        {
          allowString: true
        }
      ],
      // Turns off an error that was only reporting for useIntl
      // see https://github.com/formatjs/formatjs/issues/4133
      '@typescript-eslint/unbound-method': 'off'
    }
  },
  {
    // TODO: set up project-specific eslint config?
    files: ['packages/export-image/**/*.ts'],
    extends: fixupConfigRules(
      compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'love'
      )
    ),
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import)
    },
    languageOptions: {
      parser: tsParser,
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
      // Allow legacy __dirname and __filename variables
      '@typescript-eslint/naming-convention': 'off'
    }
  },
  {
    // TODO: set up project-specific eslint config?
    files: ['packages/i18n/src/*.ts'],
    extends: fixupConfigRules(
      compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'love'
      )
    ),
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import)
    },
    languageOptions: {
      parser: tsParser,
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
