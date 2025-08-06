import coastmix, { setWaterLevel } from './coastmix'

describe('coastmix reducer', () => {
  const initialState = {
    waterLevel: 0
  }

  describe('should handle setWaterLevel()', () => {
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
