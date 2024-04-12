import path from 'node:path'
import '@testing-library/jest-dom'
import { setImmediate, clearImmediate } from 'timers'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import 'vitest-canvas-mock'

import { server } from './test/server/index.js'

// eslint-disable-next-line @typescript-eslint/no-var-requires
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

// Add mocks for global methods
global.ResizeObserver = class ResizeObserver {
  observe (): void {} // noop
  unobserve (): void {} // noop
  disconnect (): void {} // noop
}

// Imports timers from Node because jsdom doesn't have them
// These are used by a subdependency (degenerator) of cloudinary
global.setImmediate = setImmediate
global.clearImmediate = clearImmediate

// Add stubs for global methods
global.print = vi.fn()
global.confirm = vi.fn(() => true)

// Add HTML methods not implemented in jsdom
// https://github.com/jsdom/jsdom/issues/1695
global.HTMLElement.prototype.scrollIntoView = vi.fn()

// Declare all mock modules globally
vi.mock('@fortawesome/react-fontawesome')
vi.mock('@primer/octicons-react')
vi.mock('@radix-ui/react-icons')
vi.mock('react-icons/io5')
vi.mock('react-transition-group')
