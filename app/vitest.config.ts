import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'server',
    globals: true,
    environment: 'node',
    setupFiles: './test/vitest.setup.ts',
    include: [
      '__tests__/**/*.test.ts',
      'authentication.test.ts',
      'resources/v1/__tests__/streets.test.ts',
      'resources/v1/__tests__/street_images.test.ts',
      'resources/v1/__tests__/users.test.ts',
      'resources/v1/__tests__/user.test.ts',
      'resources/v1/__tests__/user_session.test.ts',
      'resources/v1/__tests__/votes.test.ts',
      'resources/v1/__tests__/translate.test.ts',
    ],
  },
})
