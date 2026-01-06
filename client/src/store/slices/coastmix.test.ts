import coastmix, {
  showCoastalFloodingPanel,
  hideCoastalFloodingPanel,
  setSeaLevelRise,
  setStormSurge,
  setRain,
} from './coastmix.js'

describe('coastmix reducer', () => {
  const initialState = {
    controlsVisible: false,
    seaLevelRise: 0,
    stormSurge: false,
    isRaining: false,
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

  describe('setRain()', () => {
    it('should set rain to true', () => {
      const action = coastmix(initialState, setRain(true))

      expect(action.isRaining).toEqual(true)
    })

    it('should set rain to false', () => {
      const action = coastmix(initialState, setRain(false))

      expect(action.isRaining).toEqual(false)
    })
  })
})
