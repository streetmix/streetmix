/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@streetmix/parts',
    globals: true,
    environment: 'node',
    // TypeScript still checks/builds *.test.ts files, but we don't
    // need to actually run tests on the compiled files.
    exclude: ['build']
  }
})
