import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'client',
    globals: true,
    environment: 'jsdom',
    setupFiles: 'vitest.setup.ts'
  }
})
