import { normalizeStreetWidth, recalculateWidth } from './width'

describe('normalizeStreetWidth', () => {
  it('constrains to minimum street width (metric units)', () => {
    expect(normalizeStreetWidth(1, 0)).toBe(3)
  })

  it('constrains to maximum street width (metric units)', () => {
    expect(normalizeStreetWidth(130, 0)).toBe(120)
  })

  it('constrains to minimum street width (imperial units)', () => {
    expect(normalizeStreetWidth(1, 1)).toBe(3.048) // 10 ft => m
  })

  it('constrains to maximum street width (imperial units)', () => {
    expect(normalizeStreetWidth(500, 1)).toBe(121.92) // 400 ft => m
  })

  it('rounds to nearest resolution (metric units)', () => {
    // Rounds down
    expect(normalizeStreetWidth(16.5634, 0)).toBe(16.55)

    // Rounds up
    expect(normalizeStreetWidth(16.3479, 0)).toBe(16.35)
  })

  it('rounds to nearest resolution (imperial units)', () => {
    // Rounds down
    expect(normalizeStreetWidth(15.955, 1)).toBe(15.926) // 52.25 ft

    // Rounds up
    expect(normalizeStreetWidth(16.347, 1)).toBe(16.383) // 53.75 ft
  })
})

// Helper function to convert Decimal.js values to plain numbers from the
// `recalculateWidth()` return value
function convertToNumbers (obj) {
  const result = {}
  const keys = [...Object.getOwnPropertyNames(obj)]

  for (const key of keys) {
    // Assumes every value is a Decimal instance with a toNumber() method
    result[key] = obj[key].toNumber()
  }

  return result
}

describe('recalculateWidth', () => {
  it('calculates a full street', () => {
    const street = {
      width: 20,
      segments: [{ width: 4 }, { width: 8 }, { width: 8 }]
    }
    expect(convertToNumbers(recalculateWidth(street))).toEqual({
      streetWidth: 20,
      occupiedWidth: 20,
      remainingWidth: 0
    })
  })

  it('calculates an underoccupied street', () => {
    const street = {
      width: 20,
      segments: [{ width: 4 }, { width: 8 }]
    }
    expect(convertToNumbers(recalculateWidth(street))).toEqual({
      streetWidth: 20,
      occupiedWidth: 12,
      remainingWidth: 8
    })
  })

  it('calculates an overoccupied street', () => {
    const street = {
      width: 20,
      segments: [{ width: 8 }, { width: 6 }, { width: 8 }]
    }
    expect(convertToNumbers(recalculateWidth(street))).toEqual({
      streetWidth: 20,
      occupiedWidth: 22,
      remainingWidth: -2
    })
  })

  it('returns valid data for streets with zero segments', () => {
    const street = {
      width: 20,
      segments: []
    }
    expect(convertToNumbers(recalculateWidth(street))).toEqual({
      streetWidth: 20,
      occupiedWidth: 0,
      remainingWidth: 20
    })
  })
})
