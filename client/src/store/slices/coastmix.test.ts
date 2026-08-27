import coastmix, {
  resetCoastmixState,
  showCoastalFloodingPanel,
  hideCoastalFloodingPanel,
  setSeaLevelRise,
  setStormSurge,
  toggleCoastalFloodingPanel,
} from './coastmix.js'
import type { FloodDetails } from '@streetmix/types'

describe('coastmix reducer', () => {
  const initialState = {
    controlsVisible: false,
    seaLevelRise: 0,
    stormSurge: false,
    floodDetails: [null, null] as [FloodDetails | null, FloodDetails | null],
  }

  describe('reset state', () => {
    it('should reset state', () => {
      const action = coastmix(
        {
          controlsVisible: true,
          seaLevelRise: 2030,
          stormSurge: true,
          floodDetails: [
            {
              direction: 'left',
              distance: 1,
              floodedTypes: [],
              flooded: false,
            },
            null,
          ],
        },
        resetCoastmixState()
      )

      expect(action).toEqual(initialState)
    })
  })

  describe('toggle controls', () => {
    it('should show controls', () => {
      const action = coastmix(initialState, showCoastalFloodingPanel())

      expect(action.controlsVisible).toEqual(true)
    })

    it('should hide controls', () => {
      const action = coastmix(initialState, hideCoastalFloodingPanel())

      expect(action.controlsVisible).toEqual(false)
    })

    it('should toggle controls', () => {
      const nextState = coastmix(initialState, toggleCoastalFloodingPanel())

      expect(nextState.controlsVisible).toEqual(true)

      const finalState = coastmix(nextState, toggleCoastalFloodingPanel())

      expect(finalState.controlsVisible).toEqual(false)
    })
  })

  describe('setSeaLevelRise()', () => {
    it('should set water level to something', () => {
      const action = coastmix(initialState, setSeaLevelRise(1))

      expect(action.seaLevelRise).toEqual(1)
    })

    it('should set water level to initial', () => {
      const action = coastmix(initialState, setSeaLevelRise(0))

      expect(action.seaLevelRise).toEqual(0)
    })
  })

  describe('setStormSurge()', () => {
    it('should set storm surge to true', () => {
      const action = coastmix(initialState, setStormSurge(true))

      expect(action.stormSurge).toEqual(true)
    })

    it('should set storm surge to false', () => {
      const action = coastmix(initialState, setStormSurge(false))

      expect(action.stormSurge).toEqual(false)
    })
  })
})
