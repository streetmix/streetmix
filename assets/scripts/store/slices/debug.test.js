/* eslint-env jest */
import debug, { setDebugFlags } from './debug'

describe('debug reducer', () => {
  const initialState = {
    forceLeftHandTraffic: false,
    forceUnsupportedBrowser: false,
    forceNonRetina: false,
    forceNoInternet: false,
    forceReadOnly: false,
    forceTouch: false,
    forceLiveUpdate: false
  }

  it('should handle initial state', () => {
    expect(debug(undefined, {})).toEqual(initialState)
  })

  describe('should handle setDebugFlags()', () => {
    it('should handle one flag', () => {
      const action = debug(
        initialState,
        setDebugFlags({
          forceNonRetina: true
        })
      )

      const result = {
        forceLeftHandTraffic: false,
        forceUnsupportedBrowser: false,
        forceNonRetina: true,
        forceNoInternet: false,
        forceReadOnly: false,
        forceTouch: false,
        forceLiveUpdate: false
      }

      expect(action).toEqual(result)
    })

    it('should handle multiple flags', () => {
      const action = debug(
        initialState,
        setDebugFlags({
          forceLeftHandTraffic: true,
          forceNonRetina: true,
          forceReadOnly: false,
          forceTouch: true
        })
      )

      const result = {
        forceLeftHandTraffic: true,
        forceUnsupportedBrowser: false,
        forceNonRetina: true,
        forceNoInternet: false,
        forceReadOnly: false,
        forceTouch: true,
        forceLiveUpdate: false
      }

      expect(action).toEqual(result)
    })
  })
})
