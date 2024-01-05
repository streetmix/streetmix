/* eslint-env jest */
import flags, { setFeatureFlag, setFlagOverrides } from './flags'

jest.mock('@streetmix/feature-flags', () => {
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
  it('should handle initial state', () => {
    expect(flags(undefined, {})).toEqual({
      BAZ_QUX: {
        label: 'baz — qux',
        defaultValue: true,
        source: 'initial',
        value: true
      },
      FOO_BAR: {
        label: 'foo — bar',
        defaultValue: false,
        source: 'initial',
        value: false
      }
    })
  })

  it('should handle setFeatureFlag()', () => {
    const action = flags(
      {
        BAZ_QUX: {
          source: 'initial',
          value: true
        },
        FOO_BAR: {
          source: 'initial',
          value: false
        }
      },
      setFeatureFlag({
        flag: 'BAZ_QUX',
        value: false
      })
    )

    const result = {
      BAZ_QUX: {
        source: 'session',
        value: false
      },
      FOO_BAR: {
        source: 'initial',
        value: false
      }
    }

    expect(action).toEqual(result)
  })

  it('should handle setFlagOverrides()', () => {
    const action = flags(
      {
        BAZ_QUX: {
          source: 'initial',
          value: true
        },
        FOO_BAR: {
          source: 'initial',
          value: false
        }
      },
      setFlagOverrides({
        BAZ_QUX: {
          source: 'role:USER',
          value: false
        },
        FOO_BAR: {
          source: 'role:FOO',
          value: true
        }
      })
    )

    const result = {
      BAZ_QUX: {
        source: 'role:USER',
        value: false
      },
      FOO_BAR: {
        source: 'role:FOO',
        value: true
      }
    }

    expect(action).toEqual(result)
  })
})
