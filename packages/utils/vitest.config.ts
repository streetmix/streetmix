import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: {
      label: '@streetmix/utils',
      color: 'white',
    },
    globals: true,
    environment: 'node',
    exclude: ['build'],
  },
})
