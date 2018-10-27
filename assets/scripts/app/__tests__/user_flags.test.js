// Test cases:
// 1) User flags override default flags
// 2) Session flags override user flags
/* eslint-env jest */

import { receiveUserFlags } from '../../app/flag_utils'
import configureStore from 'redux-mock-store'
import { setUserFlags } from '../../store/actions/flags'
import { SET_USER_FLAGS } from '../../store/actions'

jest.mock('../../app/routing', () => {})
jest.mock('../../app/errors', () => {})

const initialState = {
  flags: {
    FOO_BAR: {
      value: true,
      source: 'initial'
    },
    BAZ_QUX: {
      value: false,
      source: 'initial'
    }
  }
}

const userFlags = {
  FOO_BAR: false,
  BAZ_QUX: true
}

const mockStore = configureStore()
const store = mockStore(initialState)
window.localStorage = localStorage

describe('receiveUserFlags', () => {
  beforeEach(() => {
    store.clearActions()
  })

  it('overrides default feature flags', () => {
    const userOverrides = receiveUserFlags(userFlags)
    store.dispatch(setUserFlags(userOverrides))

    const expectedActions = {
      type: SET_USER_FLAGS,
      userFlags: {
        FOO_BAR: {
          value: userFlags.FOO_BAR,
          source: 'user'
        },
        BAZ_QUX: {
          value: userFlags.BAZ_QUX,
          source: 'user'
        }
      }
    }

    expect(store.getActions()).toEqual([expectedActions])
  })

  it('does not override session overrides', () => {
    const sessionFlag = { FOO_BAR: false }
    localStorage.setItem('flags', JSON.stringify(sessionFlag))

    const userOverrides = receiveUserFlags(userFlags)
    store.dispatch(setUserFlags(userOverrides))

    const expectedActions = {
      type: SET_USER_FLAGS,
      userFlags: {
        BAZ_QUX: {
          value: userFlags.BAZ_QUX,
          source: 'user'
        }
      }
    }

    expect(store.getActions()).toEqual([expectedActions])
  })
})
