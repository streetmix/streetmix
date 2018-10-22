// Test cases:
// 1) User flags override default flags
// 2) Session flags override user flags
// 3) When user signs out, remove user flags from Redux
/* eslint-env jest */

import { receiveUserFlags } from '../authentication'
import LocalStorageMock from '../../../../test/__mocks__/LocalStorageMock'
import configureStore from 'redux-mock-store'

jest.mock('../../app/routing', () => {})
jest.mock('../../app/errors', () => {})
window.localStorage = LocalStorageMock

const module = jest.genMockFromModule('../../store')
const mockStore = configureStore()
module.default = mockStore({
  flags: {
    FOO_BAR: {
      source: 'initial',
      value: false
    }
  }
})

const userFlags = {
  FOO_BAR: true
}

describe('receiveFeatureFlags', () => {
  it('on receiving user flags will override default feature flags', () => {
    receiveUserFlags(userFlags)
    expect(module.default.getActions()).toBeUndefined()
  })
})
