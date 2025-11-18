import path from 'node:path'
import { defineConfig } from 'vitest/config'
import ViteYaml from '@modyfi/vite-plugin-yaml'

export default defineConfig({
  plugins: [ViteYaml()],
  test: {
    name: 'client',
    globals: true,
    environment: 'happy-dom',
    setupFiles: 'vitest.setup.ts',
    alias: [
      {
        find: /^(.*)\.(jpg|jpeg|png|gif|svg)$/,
        replacement: path.resolve(__dirname, './__mocks__/fileMock.js')
      },
      {
        find: '~',
        replacement: path.resolve(__dirname, './')
      }
    ]
  }
})
