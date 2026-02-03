import coastmix, {
  showCoastalFloodingPanel,
  hideCoastalFloodingPanel,
  setSeaLevelRise,
  setFloodDirection,
  setFloodDistance,
  setStormSurge,
  toggleCoastalFloodingPanel,
} from './coastmix.js'

describe('coastmix reducer', () => {
  const initialState = {
    controlsVisible: false,
    seaLevelRise: 0,
    stormSurge: false,
    floodDirection: 'none' as const,
    floodDistance: null,
  }

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

  describe('setFloodDirection()', () => {
    it('should set flood direction', () => {
      const action = coastmix(initialState, setFloodDirection('left'))

      expect(action.floodDirection).toEqual('left')
    })

    it('should clear flood direction', () => {
      const action = coastmix(initialState, setFloodDirection())

      expect(action.floodDirection).toEqual('none')
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
    it('should set flood distance to a value', () => {
      const action = coastmix(initialState, setFloodDistance(1))

      expect(action.floodDistance).toEqual(1)
    })

    it('should set flood distance to a zero value', () => {
      const action = coastmix(initialState, setFloodDistance(0))

      expect(action.floodDistance).toEqual(0)
    })

    it('should reset flood distance to null', () => {
      const action = coastmix(initialState, setFloodDistance(null))

      expect(action.floodDistance).toEqual(null)
    })
  })
})
