import path from 'node:path'
import { setImmediate, clearImmediate } from 'timers'
import { vi } from 'vitest'
import '@testing-library/jest-dom'
import createFetchMock from 'vitest-fetch-mock'
// import 'dotenv/config' // TODO: fix this
import 'vitest-canvas-mock'
// import 'jest-date-mock' // TODO: do we need this?
import { server } from '../../test/server/index.js'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path: path.resolve(process.cwd(), '.env.test')
})

// Set up listeners on API with mock-service-worker
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

// We still need to polyfill the environment with fetch or our
// components break. But we also don't really need to / want to
// mock fetch requests, that's what msw is for!
const fetchMock = createFetchMock(vi)
fetchMock.dontMock()

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
