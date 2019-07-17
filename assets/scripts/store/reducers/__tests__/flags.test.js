/* eslint-env jest */
import reducer from '../flags'
import * as actions from '../../actions/flags'

jest.mock('../../../../../app/data/flags', () => {
  return {
    FOO_BAR: {
      label: 'foo — bar',
      defaultValue: false
    },
    BAZ_QUX: {
      label: 'baz — qux',
      defaultValue: true
    }
  }
})

describe('flags reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      'BAZ_QUX': {
        'source': 'initial',
        'value': true
      },
      'FOO_BAR': {
        'source': 'initial',
        'value': false
      }
    })
  })

  it('should set a user-defined value', () => {
    const action = reducer(undefined, actions.setFeatureFlag('BAZ_QUX', false))
    const result = {
      'BAZ_QUX': {
        'source': 'session',
        'value': false
      },
      'FOO_BAR': {
        'source': 'initial',
        'value': false
      }
    }
    expect(action).toEqual(result)
  })
})
