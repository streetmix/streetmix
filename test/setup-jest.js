/* eslint-env jest */
import path from 'path'
import { setImmediate, clearImmediate } from 'timers'
import '@testing-library/jest-dom/extend-expect'
import fetch from 'jest-fetch-mock'
import 'jest-canvas-mock'
import 'jest-date-mock'
import LocalStorageMock from './__mocks__/LocalStorageMock'

require('dotenv').config({
  path: path.resolve(process.cwd(), '.env.test')
})

// Add mocks for global methods
fetch.enableMocks()
global.localStorage = new LocalStorageMock()
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
