import coastmix, {
  resetCoastmixState,
  showCoastalFloodingPanel,
  hideCoastalFloodingPanel,
  setSeaLevelRise,
  setFloodDetails,
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

  describe('setFloodDetails()', () => {
    it('sets flood details for the left side', () => {
      const left: FloodDetails = {
        direction: 'left',
        distance: 1,
        floodedTypes: [],
        flooded: false,
      }

      const action = coastmix(initialState, setFloodDetails([left, null]))

      expect(action.floodDetails).toEqual([left, null])
    })

    it('sets flood details for the right side', () => {
      const right: FloodDetails = {
        direction: 'right',
        distance: 2,
        floodedTypes: ['BIKE'],
        flooded: true,
      }

      const action = coastmix(initialState, setFloodDetails([null, right]))

      expect(action.floodDetails).toEqual([null, right])
    })

    it('sets flood details for both sides', () => {
      const left: FloodDetails = {
        direction: 'left',
        distance: 2,
        floodedTypes: ['BIKE'],
        flooded: true,
      }
      const right: FloodDetails = {
        direction: 'right',
        distance: 1,
        floodedTypes: [],
        flooded: false,
      }

      const action = coastmix(initialState, setFloodDetails([left, right]))

      expect(action.floodDetails).toEqual([left, right])
    })

    it('resets flood details', () => {
      const action = coastmix(
        {
          ...initialState,
          floodDetails: [
            {
              direction: 'left',
              distance: 1,
              floodedTypes: [],
              flooded: false,
            },
            {
              direction: 'right',
              distance: 2,
              floodedTypes: ['BIKE'],
              flooded: true,
            },
          ],
        },
        setFloodDetails([null, null])
      )

      expect(action.floodDetails).toEqual([null, null])
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
