import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@streetmix/utils',
    globals: true,
    environment: 'node',
    // TypeScript still checks/builds *.test.ts files, but we don't
    // need to actually run tests on the compiled files.
    exclude: ['build'],
    // Vitest v2 changes the default pool from `threads` to `forks`,
    // which feels like it will fix situations where test suite hangs
    // and runs forever in background.
    // https://github.com/vitest-dev/vitest/pull/5047
    // We can't update to Vitest v2 right now, but we can pull this
    // change forward
    pool: 'forks'
  }
})
