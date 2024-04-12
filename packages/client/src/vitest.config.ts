import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'client',
    globals: true,
    environment: 'jsdom',
    setupFiles: 'vitest.setup.ts',
    alias: [
      {
        find: /^(.*)\.(jpg|jpeg|png|gif|svg)$/,
        replacement: '/__mocks__/fileMock.js'
      }
    ]
  }
})
