/* eslint-env jest */
import '@testing-library/jest-dom/extend-expect'
import fetch from 'jest-fetch-mock'
import 'jest-canvas-mock'
import 'jest-date-mock'
import LocalStorageMock from './__mocks__/LocalStorageMock'

// Add mocks for global methods
fetch.enableMocks()
global.localStorage = new LocalStorageMock()

// Add stubs for global methods
global.print = jest.fn()
global.confirm = jest.fn(() => true)

// Add HTML methods not implemented in jsdom
// https://github.com/jsdom/jsdom/issues/1695
global.HTMLElement.prototype.scrollIntoView = jest.fn()

process.env.PELIAS_API_KEY = process.env.PELIAS_API_KEY || 'ge-iampelias'
process.env.PELIAS_HOST_NAME = 'dummy.pelias.com'
