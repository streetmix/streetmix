/* eslint-env jest */
import path from 'path'
import { setImmediate, clearImmediate } from 'timers'
import '@testing-library/jest-dom'
import fetch from 'jest-fetch-mock'
import 'jest-canvas-mock'
import 'jest-date-mock'
import { server } from './server/index.js'

require('dotenv').config({
  path: path.resolve(process.cwd(), '.env.test')
})

// Set up listeners on API with mock-service-worker
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
// We still need to polyfill the environment with fetch or our
// components break. But we also don't really need to / want to
// mock fetch requests, that's what msw is for!
fetch.dontMock()

// Add mocks for global methods
global.ResizeObserver = class ResizeObserver {
  observe () {} // noop
  unobserve () {} // noop
  disconnect () {} // noop
}

// Imports timers from Node because jsdom doesn't have them
// These are used by a subdependency (degenerator) of cloudinary
global.setImmediate = setImmediate
global.clearImmediate = clearImmediate

// Add stubs for global methods
global.print = jest.fn()
global.confirm = jest.fn(() => true)

// Add HTML methods not implemented in jsdom
// https://github.com/jsdom/jsdom/issues/1695
global.HTMLElement.prototype.scrollIntoView = jest.fn()
