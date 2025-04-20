import { defineConfig } from 'vitest/config'
import ViteYaml from '@modyfi/vite-plugin-yaml'

export default defineConfig({
  plugins: [ViteYaml()],
  test: {
    name: 'client',
    globals: true,
    environment: 'jsdom',
    setupFiles: 'vitest.setup.ts',
    alias: [
      {
        find: /^(.*)\.(jpg|jpeg|png|gif|svg)$/,
        replacement: '/__mocks__/fileMock.js'
      },
      { find: '~', replacement: '/' }
    ],
    include: [
      '../client/src/app/**/*.test.?(c|m)[jt]s?(x)',
      '../client/src/dialogs/**/*.test.?(c|m)[jt]s?(x)'
    ]
    // Vitest v2 changes the default pool from `threads` to `forks`,
    // which feels like it will fix situations where test suite hangs
    // and runs forever in background.
    // https://github.com/vitest-dev/vitest/pull/5047
    // We can't update to Vitest v2 right now, but we can pull this
    // change forward
    // pool: 'forks'
  }
})
