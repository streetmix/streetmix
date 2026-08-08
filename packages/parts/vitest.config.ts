import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: {
      label: '@streetmix/parts',
      color: 'yellow',
    },
    globals: true,
    environment: 'node',
    exclude: ['build'],
  },
})
