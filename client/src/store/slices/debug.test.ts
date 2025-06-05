import debug, { setDebugFlags } from './debug'

describe('debug reducer', () => {
  const initialState = {
    forceLeftHandTraffic: false,
    forceNonRetina: false,
    forceOfflineMode: false,
    forceReadOnly: false
  }

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
        forceNonRetina: true,
        forceOfflineMode: false,
        forceReadOnly: false
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
        forceNonRetina: true,
        forceOfflineMode: false,
        forceReadOnly: false
      }

      expect(action).toEqual(result)
    })
  })
})
