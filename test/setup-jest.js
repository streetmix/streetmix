/* eslint-env jest */
import '@testing-library/jest-dom/extend-expect'
import fetch from 'jest-fetch-mock'
import 'jest-canvas-mock'
import 'jest-date-mock'
import LocalStorageMock from './__mocks__/LocalStorageMock'
import Modernizr from './__mocks__/Modernizr'

global.fetch = fetch
global.localStorage = new LocalStorageMock()
global.Modernizr = Modernizr
global.print = jest.fn()
