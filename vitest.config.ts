import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['client/vitest.config.ts', 'packages/*']
  }
})
