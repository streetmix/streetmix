/* eslint-env jest */
import system, { setSystemFlags } from './system'

describe('system reducer', () => {
  const initialState = {
    phone: false,
    safari: false,
    windows: false,
    offline: false,
    devicePixelRatio: 1
  }

  it('should handle initial state', () => {
    expect(system(undefined, {})).toEqual(initialState)
  })

  it('should handle setSystemFlags()', () => {
    expect(
      system(
        initialState,
        setSystemFlags({
          offline: true,
          devicePixelRatio: 2
        })
      )
    ).toEqual({
      phone: false,
      safari: false,
      windows: false,
      offline: true,
      devicePixelRatio: 2
    })
  })
})
