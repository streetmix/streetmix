// Test cases:
// 1) User flags override default flags
// 2) Session flags override user flags
/* eslint-env jest */

import { generateFlagOverrides, applyFlagOverrides } from '../flag_utils'

jest.mock('../../app/routing', () => {})
jest.mock('../../app/errors', () => {})

const initialFlags = {
  FOO_BAR: {
    value: true,
    source: 'initial'
  },
  BAZ_QUX: {
    value: false,
    source: 'initial'
  }
}

const flagOverrides = [
  {
    source: 'user',
    flags: [
      {
        flag: 'FOO_BAR',
        value: false
      }
    ],
    priority: 1
  },
  {
    source: 'session',
    flags: [
      {
        flag: 'BAZ_QUX',
        value: true
      },
      {
        flag: 'FOO_BAR',
        value: true
      }
    ],
    priority: 2
  }
]

describe('generateFlagOverrides', () => {
  it('creates an object with source, flags, and priority as keys', () => {
    const userFlags = {
      FOO_BAR: false
    }

    const result = generateFlagOverrides(userFlags, 'user')
    expect(result).toEqual({
      source: 'user',
      flags: [{
        flag: 'FOO_BAR',
        value: false
      }],
      priority: 1
    })
  })
})

describe('applyFlagOverrides', () => {
  it('updates feature flag values according to flag overrides and priority levels', () => {
    const result = applyFlagOverrides(flagOverrides, initialFlags)
    expect(result).toEqual({
      FOO_BAR: {
        source: 'session',
        value: true
      },
      BAZ_QUX: {
        source: 'session',
        value: true
      }
    })
  })
})
