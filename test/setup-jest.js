import LocalStorageMock from './__mocks__/LocalStorageMock'
import fetch from 'jest-fetch-mock'

global.fetch = fetch
global.localStorage = new LocalStorageMock()
