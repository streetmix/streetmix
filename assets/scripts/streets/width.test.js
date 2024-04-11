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

describe('recalculateWidth', () => {
  it('calculates a full street', () => {
    const street = {
      width: 20,
      segments: [{ width: 4 }, { width: 8 }, { width: 8 }]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 20,
      remainingWidth: 0,
      segments: [
        { width: 4, warnings: [undefined, false, false, false, false] },
        { width: 8, warnings: [undefined, false, false, false, false] },
        { width: 8, warnings: [undefined, false, false, false, false] }
      ]
    })
  })

  it('calculates an underoccupied street', () => {
    const street = {
      width: 20,
      segments: [{ width: 4 }, { width: 8 }]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 12,
      remainingWidth: 8,
      segments: [
        { width: 4, warnings: [undefined, false, false, false, false] },
        { width: 8, warnings: [undefined, false, false, false, false] }
      ]
    })
  })

  it('calculates an overoccupied street', () => {
    const street = {
      width: 20,
      segments: [{ width: 8 }, { width: 6 }, { width: 8 }]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 22,
      remainingWidth: -2,
      segments: [
        { width: 8, warnings: [undefined, true, false, false, false] },
        { width: 6, warnings: [undefined, false, false, false, false] },
        { width: 8, warnings: [undefined, true, false, false, false] }
      ]
    })
  })

  it('calculates warnings for segments above max width or below min width', () => {
    const street = {
      width: 20,
      segments: [
        { width: 0.6, type: 'sidewalk', variantString: 'normal' },
        { width: 3, type: 'divider', variantString: 'bush' },
        { width: 5.4, type: 'parking-lane', variantString: 'inbound|left' }
      ]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 9,
      remainingWidth: 11,
      segments: [
        {
          width: 0.6,
          type: 'sidewalk',
          variantString: 'normal',
          warnings: [undefined, false, true, false, false]
        },
        {
          width: 3,
          type: 'divider',
          variantString: 'bush',
          warnings: [undefined, false, false, false, false]
        },
        {
          width: 5.4,
          type: 'parking-lane',
          variantString: 'inbound|left',
          warnings: [undefined, false, false, true, false]
        }
      ]
    })
  })

  it('returns valid data for streets with zero segments', () => {
    const street = {
      width: 20,
      segments: []
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 0,
      remainingWidth: 20,
      segments: []
    })
  })
})
