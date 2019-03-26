// Test cases:
// 1) User flags override default flags
// 2) Session flags override user flags
/* eslint-env jest */

import { generateFlagOverrides, applyFlagOverrides } from '../flag_utils'

jest.mock('../../app/errors', () => {})

const initialFlags = {
  FOO_BAR: { value: true, source: 'initial' },
  BAZ_QUX: { value: false, source: 'initial' },
  FOO_BAZ: { value: true, source: 'initial' },
  BAZ_BAR: { value: false, source: 'initial' }
}

const userOverrides = {
  source: 'user',
  flags: [
    { flag: 'FOO_BAR', value: false },
    { flag: 'BAZ_BAR', value: true }
  ],
  priority: 1
}

const sessionOverrides = {
  source: 'session',
  flags: [
    { flag: 'BAZ_QUX', value: true },
    { flag: 'FOO_BAR', value: true }
  ],
  priority: 2
}

describe('generateFlagOverrides', () => {
  it('creates an object with source, flags, and priority as keys', () => {
    const userFlags = {
      FOO_BAR: false
    }

    const result = generateFlagOverrides(userFlags, 'user')
    expect(result).toEqual({
      source: 'user',
      flags: [
        { flag: 'FOO_BAR', value: false }
      ],
      priority: 1
    })
  })
})

describe('applyFlagOverrides', () => {
  it('updates feature flag values according to flag overrides and priority levels', () => {
    const result = applyFlagOverrides(initialFlags, userOverrides, sessionOverrides)
    expect(result).toEqual({
      FOO_BAR: { source: 'session', value: true },
      BAZ_QUX: { source: 'session', value: true },
      FOO_BAZ: { source: 'initial', value: true },
      BAZ_BAR: { source: 'user', value: true }
    })
  })

  it('does not apply flags that are not present in the application', () => {
    // It is possible for a flag to be removed or deprecated from the application,
    // but the value for the flag remains stored in user data or in localstorage.
    // We do not want these "dead" flags to be in the final object.
    const userOverrides = {
      source: 'user',
      flags: [
        { flag: 'FOO_BAZ', value: false }
      ],
      priority: 1
    }

    const result = applyFlagOverrides(initialFlags, userOverrides)

    expect(result).toEqual(initialFlags)
  })
})
