import coastmix, {
  resetCoastmixState,
  showCoastalFloodingPanel,
  hideCoastalFloodingPanel,
  setSeaLevelRise,
  setFloodDistance,
  setStormSurge,
  toggleCoastalFloodingPanel,
} from './coastmix.js'
import type { FloodDistance } from '@streetmix/types'

describe('coastmix reducer', () => {
  const initialState = {
    controlsVisible: false,
    seaLevelRise: 0,
    stormSurge: false,
    floodDistance: [null, null] as [FloodDistance, FloodDistance],
  }

  describe('reset state', () => {
    it('should reset state', () => {
      const action = coastmix(
        {
          controlsVisible: true,
          seaLevelRise: 2030,
          stormSurge: true,
          floodDistance: [1, null],
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

  describe('setFloodDistance()', () => {
    it('should set left flood distance to a value', () => {
      const action = coastmix(initialState, setFloodDistance([1, null]))

      expect(action.floodDistance).toEqual([1, null])
    })

    it('should set left flood distance to a zero value', () => {
      const action = coastmix(initialState, setFloodDistance([0, null]))

      expect(action.floodDistance).toEqual([0, null])
    })

    it('should set right flood distance to a value', () => {
      const action = coastmix(initialState, setFloodDistance([null, 1]))

      expect(action.floodDistance).toEqual([null, 1])
    })

    it('should set right flood distance to a zero value', () => {
      const action = coastmix(initialState, setFloodDistance([null, 0]))

      expect(action.floodDistance).toEqual([null, 0])
    })

    it('should set both flood distance to a value', () => {
      const action = coastmix(initialState, setFloodDistance([3, 2]))

      expect(action.floodDistance).toEqual([3, 2])
    })

    it('should set both flood distance to a zero value', () => {
      const action = coastmix(initialState, setFloodDistance([0, 0]))

      expect(action.floodDistance).toEqual([0, 0])
    })

    it('should reset both flood distance to null', () => {
      const action = coastmix(initialState, setFloodDistance([null, null]))

      expect(action.floodDistance).toEqual([null, null])
    })
  })
})
