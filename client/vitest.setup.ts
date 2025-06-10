import path from 'node:path'
import '@testing-library/jest-dom'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import 'vitest-canvas-mock'

import { server } from './test/server/index.js'

// Allow require() so we can configure dotenv with test env vars
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({
  path: path.resolve(process.cwd(), '.env.test')
})

// Set up listeners on API with mock-service-worker
beforeAll(() => {
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

// Add mock stubs for global methods
global.print = vi.fn()
global.confirm = vi.fn(() => true)

// Declare all mock modules globally
vi.mock('./src/ui/Icon.tsx')
vi.mock('react-transition-group')
