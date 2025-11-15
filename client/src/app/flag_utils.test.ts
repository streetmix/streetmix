import type { FeatureFlagSettings } from '~/src/types'
import { generateFlagOverrides, applyFlagOverrides } from './flag_utils'

const initialFlags: FeatureFlagSettings = {
  FOO_BAR: { source: 'initial', value: true, label: 'a', defaultValue: true },
  BAZ_QUX: { source: 'initial', value: false, label: 'b', defaultValue: false },
  FOO_BAZ: { source: 'initial', value: true, label: 'c', defaultValue: true },
  BAZ_BAR: { source: 'initial', value: false, label: 'd', defaultValue: false }
}

const roleOverrides = {
  source: 'role:USER',
  flags: {
    BAZ_QUX: true
  }
}

const userOverrides = {
  source: 'user',
  flags: {
    FOO_BAR: false,
    BAZ_BAR: true
  }
}

const sessionOverrides = {
  source: 'session',
  flags: {
    BAZ_QUX: false,
    FOO_BAR: true
  }
}

describe('generateFlagOverrides', () => {
  it('creates an object with source, flags, and priority as keys', () => {
    const userFlags = {
      FOO_BAR: false
    }

    const result = generateFlagOverrides(userFlags, 'user')
    expect(result).toEqual({
      source: 'user',
      flags: {
        FOO_BAR: false
      }
    })
  })
})

describe('applyFlagOverrides', () => {
  it('overrides default feature flags with role and user values', () => {
    const result = applyFlagOverrides(
      initialFlags,
      roleOverrides,
      userOverrides
    )
    expect(result).toEqual({
      FOO_BAR: { source: 'user', value: false, label: 'a', defaultValue: true },
      BAZ_QUX: {
        source: 'role:USER',
        value: true,
        label: 'b',
        defaultValue: false
      },
      FOO_BAZ: {
        source: 'initial',
        value: true,
        label: 'c',
        defaultValue: true
      },
      BAZ_BAR: { source: 'user', value: true, label: 'd', defaultValue: false }
    })
  })

  it('overrides feature flags with session values', () => {
    const result = applyFlagOverrides(
      initialFlags,
      roleOverrides,
      userOverrides,
      sessionOverrides
    )
    expect(result).toEqual({
      FOO_BAR: {
        source: 'session',
        value: true,
        label: 'a',
        defaultValue: true
      },
      BAZ_QUX: {
        source: 'session',
        value: false,
        label: 'b',
        defaultValue: false
      },
      FOO_BAZ: {
        source: 'initial',
        value: true,
        label: 'c',
        defaultValue: true
      },
      BAZ_BAR: { source: 'user', value: true, label: 'd', defaultValue: false }
    })
  })

  it('updates role overrides with colon (:) separator', () => {
    const result = applyFlagOverrides(initialFlags, roleOverrides)
    expect(result).toEqual({
      FOO_BAR: {
        source: 'initial',
        value: true,
        label: 'a',
        defaultValue: true
      },
      BAZ_QUX: {
        source: 'role:USER',
        value: true,
        label: 'b',
        defaultValue: false
      },
      FOO_BAZ: {
        source: 'initial',
        value: true,
        label: 'c',
        defaultValue: true
      },
      BAZ_BAR: {
        source: 'initial',
        value: false,
        label: 'd',
        defaultValue: false
      }
    })
  })

  it('does not apply flags that are not present in the application', () => {
    // It is possible for a flag to be removed or deprecated from the application,
    // but the value for the flag remains stored in user data or in localstorage.
    // We do not want these "dead" flags to be in the final object.
    const userOverrides = {
      source: 'user',
      flags: {
        FOO_FOO: false
      }
    }

    const result = applyFlagOverrides(initialFlags, userOverrides)

    expect(result).toEqual(initialFlags)
  })
})
