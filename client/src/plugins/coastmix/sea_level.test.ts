import { createStreetState } from '~/test/factories/street.js'
import { calculateSeaLevelRise } from './sea_level.js'

describe('sea level rise', () => {
  describe('calculateSeaLevelRise', () => {
    it('calculates the correct sea level rises', () => {
      const street = createStreetState({
        boundary: {
          left: {
            variant: 'beach',
            elevation: 0,
          },
          right: {
            variant: 'grass',
            elevation: 1,
          },
        },
      })

      // Sea level rise is off
      const result1 = calculateSeaLevelRise(0, false, street)
      expect(result1).toBe(0)

      // Sea level rise at various targets, no storm surge
      const result2 = calculateSeaLevelRise(2030, false, street)
      expect(result2).toBe(0.457)

      const result3 = calculateSeaLevelRise(2050, false, street)
      expect(result3).toBe(0.762)

      const result4 = calculateSeaLevelRise(2070, false, street)
      expect(result4).toBe(1.372)

      // Sea level rise at various targets, with storm surge
      const result5 = calculateSeaLevelRise(2030, true, street)
      expect(result5).toBe(0.838)

      const result6 = calculateSeaLevelRise(2050, true, street)
      expect(result6).toBe(1.143)

      const result7 = calculateSeaLevelRise(2070, true, street)
      expect(result7).toBe(1.753)

      // Sea level rise when sea level is raised
      street.boundary.right.variant = 'beach'
      street.boundary.left.elevation = 1
      const result8 = calculateSeaLevelRise(2030, true, street)
      expect(result8).toBe(1.838)

      const result9 = calculateSeaLevelRise(2070, false, street)
      expect(result9).toBe(2.372)
    })
  })
})
