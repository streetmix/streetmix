import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@streetmix/utils',
    globals: true,
    environment: 'node',
    exclude: ['build']
  }
})
