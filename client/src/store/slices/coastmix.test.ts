import coastmix, {
  showCoastmixControls,
  hideCoastmixControls,
  setWaterLevel
} from './coastmix'

describe('coastmix reducer', () => {
  const initialState = {
    controlsVisible: false,
    waterLevel: 0
  }

  describe('toggle controls', () => {
    it('should show Coastmix controls', () => {
      const action = coastmix(initialState, showCoastmixControls())

      expect(action.controlsVisible).toEqual(true)
    })

    it('should set water level to initial', () => {
      const action = coastmix(initialState, hideCoastmixControls())

      expect(action.controlsVisible).toEqual(false)
    })
  })

  describe('setWaterLevel()', () => {
    it('should set water level to something', () => {
      const action = coastmix(initialState, setWaterLevel(1))

      expect(action.waterLevel).toEqual(1)
    })

    it('should set water level to initial', () => {
      const action = coastmix(initialState, setWaterLevel(0))

      expect(action.waterLevel).toEqual(0)
    })
  })
})
