import path from 'node:path'
import { styleText } from 'node:util'
import { defineConfig } from 'vitest/config'
import ViteYaml from '@modyfi/vite-plugin-yaml'

// Behavior in change in msw 3.0
console.log(
  styleText(
    ['yellow', 'bold'],
    'Tests will now log fetch failures, this is expected behavior and not an error!'
  )
)

export default defineConfig({
  plugins: [ViteYaml()],
  test: {
    name: {
      label: 'client',
      color: 'green',
    },
    globals: true,
    environment: 'happy-dom',
    setupFiles: './test/vitest.setup.ts',
    alias: [
      {
        find: /^(.*)\.(jpg|jpeg|png|gif|svg)$/,
        replacement: path.resolve(
          import.meta.dirname,
          './__mocks__/fileMock.ts'
        ),
      },
      {
        find: '~',
        replacement: path.resolve(import.meta.dirname, './'),
      },
    ],
  },
})
