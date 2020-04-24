/* eslint-env jest */
import system, { setSystemFlags, setViewportSize } from './system'

describe('system reducer', () => {
  const initialState = {
    phone: false,
    safari: false,
    windows: false,
    noInternet: false,
    viewportWidth: 1024,
    viewportHeight: 768,
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
          noInternet: true,
          devicePixelRatio: 2
        })
      )
    ).toEqual({
      phone: false,
      safari: false,
      windows: false,
      noInternet: true,
      viewportWidth: 1024,
      viewportHeight: 768,
      devicePixelRatio: 2
    })
  })

  it('should handle setViewportSize()', () => {
    expect(
      system(
        initialState,
        setViewportSize({
          width: 800,
          height: 600
        })
      )
    ).toEqual({
      phone: false,
      safari: false,
      windows: false,
      noInternet: false,
      viewportWidth: 800,
      viewportHeight: 600,
      devicePixelRatio: 1
    })
  })
})
