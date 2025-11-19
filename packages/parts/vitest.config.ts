import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@streetmix/parts',
    globals: true,
    environment: 'node',
    exclude: ['build']
  }
})
