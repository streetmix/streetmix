import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: {
      label: 'server',
      color: 'cyan',
    },
    globals: true,
    environment: 'node',
    setupFiles: './test/vitest.setup.ts',
    include: ['**/*.test.ts'],
  },
})
