import { calculateSeaLevelRise } from './sea_level.js'

describe('sea level rise', () => {
  describe('calculateSeaLevelRise', () => {
    it('calculates the correct sea level rises', () => {
      // Sea level rise is off
      const result1 = calculateSeaLevelRise(0, false)
      expect(result1).toBe(0)

      // Sea level rise at various targets, no storm surge
      const result2 = calculateSeaLevelRise(2030, false)
      expect(result2).toBe(0.457)

      const result3 = calculateSeaLevelRise(2050, false)
      expect(result3).toBe(0.762)

      const result4 = calculateSeaLevelRise(2070, false)
      expect(result4).toBe(1.372)

      // Sea level rise at various targets, with storm surge
      const result5 = calculateSeaLevelRise(2030, true)
      expect(result5).toBe(0.838)

      const result6 = calculateSeaLevelRise(2050, true)
      expect(result6).toBe(1.143)

      const result7 = calculateSeaLevelRise(2070, true)
      expect(result7).toBe(1.753)
    })
  })
})
