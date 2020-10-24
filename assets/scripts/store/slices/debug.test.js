/* eslint-env jest */
import debug, { setDebugFlags } from './debug'

describe('debug reducer', () => {
  const initialState = {
    forceLeftHandTraffic: false,
    forceUnsupportedBrowser: false,
    forceNonRetina: false,
    forceOfflineMode: false,
    forceReadOnly: false,
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
        forceOfflineMode: false,
        forceReadOnly: false,
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
          forceReadOnly: false
        })
      )

      const result = {
        forceLeftHandTraffic: true,
        forceUnsupportedBrowser: false,
        forceNonRetina: true,
        forceOfflineMode: false,
        forceReadOnly: false,
        forceLiveUpdate: false
      }

      expect(action).toEqual(result)
    })
  })
})
