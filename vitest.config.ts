import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'app/vitest.config.ts',
      'client/vitest.config.ts',
      'packages/*',
      '!packages/tsconfig.base.json',
    ],
  },
})
