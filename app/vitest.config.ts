import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'server',
    globals: true,
    environment: 'node',
    setupFiles: './test/vitest.setup.ts',
    include: ['__tests__/**/*.test.ts', 'authentication.test.ts'],
  },
})
