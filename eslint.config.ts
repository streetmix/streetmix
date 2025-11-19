import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import cypress from "eslint-plugin-cypress/flat";
import love from "eslint-config-love";

export default defineConfig([
  globalIgnores([
    "client/src/vendor/",
    "test/integration/smoke.spec.js",
    "**/build",
    "**/docs",
  ]),
  eslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"], // Add this with React 17+, apparently
    ...reactHooks.configs.flat.recommended,
    files: ["**/*.{js,jsx,ts,tsx,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "import/no-unresolved": 0,
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "~/**",
              group: "internal",
            },
          ],
        },
      ],
      "jsx-quotes": ["error", "prefer-double"],
      "react/jsx-no-bind": 0,
      "no-restricted-globals": [
        "error",
        {
          name: "isNaN",
          message: "Use Number.isNaN() instead of the global isNan().",
        },
        {
          name: "isFinite",
          message: "Use Number.isFinite() instead of the global isFinite().",
        },
        {
          name: "parseInt",
          message: "Use Number.parseInt() instead of the global parseInt().",
        },
        {
          name: "parseFloat",
          message:
            "Use Number.parseFloat() instead of the global parseFloat().",
        },
      ],
      // `react-hooks` plugin really wants us to define rules explicitly
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Disable for now bc something has made it start reporting
      "no-unused-vars": "off",
    },
  },
  {
    // Only run TypeScript linting on TypeScript files
    // Disabling eslint-config-love for now, since I can't find a way to make
    // it work in this config
    // ...love,
    files: ["client/**/*.{ts,tsx}", "packages/**/*.ts"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: {
          // Run eslint on configuration and test files that will _not_ be
          // built by the TypeScript compiler. Globs are not allowed here, so
          // we need to specify included test file paths.
          allowDefaultProject: [
            "packages/*/vitest.config.ts",
            "packages/utils/src/*.test.ts",
            "packages/parts/src/*.test.ts",
          ],
        },
      },
    },
    rules: {
      // Relaxes strict error checking for unused variables.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          // Allows unused variables to be prefixed with `_`
          // Event handlers generally should not omit arguments
          argsIgnorePattern: "^_",
          // Allows argument passed to catch() to be unused
          caughtErrors: "none",
          // Allow rest properties to omit sibling properties from an object
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.vitest,
      },
    },
  },
  {
    files: ["cypress/**/*.cy.js"],
    extends: [cypress.configs.recommended],
  },
]);
