// Test cases:
// 1) User flags override default flags
// 2) Session flags override user flags
import { generateFlagOverrides, applyFlagOverrides } from '../flag_utils'

const initialFlags = {
  FOO_BAR: { source: 'initial', value: true },
  BAZ_QUX: { source: 'initial', value: false },
  FOO_BAZ: { source: 'initial', value: true },
  BAZ_BAR: { source: 'initial', value: false }
}

const roleOverrides = {
  source: 'role:USER',
  flags: [{ flag: 'BAZ_QUX', value: true }]
}

const userOverrides = {
  source: 'user',
  flags: [
    { flag: 'FOO_BAR', value: false },
    { flag: 'BAZ_BAR', value: true }
  ]
}

const sessionOverrides = {
  source: 'session',
  flags: [
    { flag: 'BAZ_QUX', value: true },
    { flag: 'FOO_BAR', value: true }
  ]
}

describe('generateFlagOverrides', () => {
  it('creates an object with source, flags, and priority as keys', () => {
    const userFlags = {
      FOO_BAR: false
    }

    const result = generateFlagOverrides(userFlags, 'user')
    expect(result).toEqual({
      source: 'user',
      flags: [{ flag: 'FOO_BAR', value: false }]
    })
  })
})

describe('applyFlagOverrides', () => {
  it('updates feature flag values according to flag overrides and priority levels', () => {
    const result = applyFlagOverrides(
      initialFlags,
      userOverrides,
      sessionOverrides,
      roleOverrides
    )
    expect(result).toEqual({
      FOO_BAR: { source: 'session', value: true },
      BAZ_QUX: { source: 'session', value: true },
      FOO_BAZ: { source: 'initial', value: true },
      BAZ_BAR: { source: 'user', value: true }
    })
  })

  it('updates role overrides with colon (:) separator', () => {
    const result = applyFlagOverrides(initialFlags, roleOverrides)
    expect(result).toEqual({
      FOO_BAR: { source: 'initial', value: true },
      BAZ_QUX: { source: 'role:USER', value: true },
      FOO_BAZ: { source: 'initial', value: true },
      BAZ_BAR: { source: 'initial', value: false }
    })
  })

  it('does not apply flags that are not present in the application', () => {
    // It is possible for a flag to be removed or deprecated from the application,
    // but the value for the flag remains stored in user data or in localstorage.
    // We do not want these "dead" flags to be in the final object.
    const userOverrides = {
      source: 'user',
      flags: [{ flag: 'FOO_FOO', value: false }]
    }

    const result = applyFlagOverrides(initialFlags, userOverrides)

    expect(result).toEqual(initialFlags)
  })

  it('does not fail if somehow an array with an undefined entry is passed in', () => {
    const result = applyFlagOverrides(initialFlags, undefined)

    expect(result).toEqual(initialFlags)
  })
})
