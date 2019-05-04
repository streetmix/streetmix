/* eslint-env jest */
import { normalizeStreetWidth, recalculateWidth } from '../width'

describe('normalizeStreetWidth', () => {
  it('constrains to minimum street width', () => {
    expect(normalizeStreetWidth(1, 1)).toBe(10)
  })

  it('constrains to maximum street width', () => {
    expect(normalizeStreetWidth(5000, 1)).toBe(400)
  })

  it('rounds to nearest resolution (metric units)', () => {
    // Rounds down
    // Truncate and cast results to string to avoid precision errors
    expect(normalizeStreetWidth(50.347, 2).toFixed(3)).toBe('50.333')

    // Rounds up
    // Truncate and cast results to string to avoid precision errors
    expect(normalizeStreetWidth(50.59, 2).toFixed(3)).toBe('50.667')
  })

  it('rounds to nearest resolution (imperial units)', () => {
    // Rounds down
    expect(normalizeStreetWidth(50.347, 1)).toBe(50.25)

    // Rounds up
    expect(normalizeStreetWidth(50.49, 1)).toBe(50.5)
  })
})

describe('recalculateWidth', () => {
  it('calculates a full street', () => {
    const street = {
      width: 50,
      segments: [
        { width: 10 },
        { width: 20 },
        { width: 20 }
      ]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 50,
      remainingWidth: 0,
      segments: [
        { width: 10, warnings: [ undefined, false, false, false ] },
        { width: 20, warnings: [ undefined, false, false, false ] },
        { width: 20, warnings: [ undefined, false, false, false ] }
      ]
    })
  })

  it('calculates an underoccupied street', () => {
    const street = {
      width: 50,
      segments: [
        { width: 10 },
        { width: 30 }
      ]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 40,
      remainingWidth: 10,
      segments: [
        { width: 10, warnings: [ undefined, false, false, false ] },
        { width: 30, warnings: [ undefined, false, false, false ] }
      ]
    })
  })

  it('calculates an overoccupied street', () => {
    const street = {
      width: 50,
      segments: [
        { width: 30 },
        { width: 10 },
        { width: 30 }
      ]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 70,
      remainingWidth: -20,
      segments: [
        { width: 30, warnings: [ undefined, true, false, false ] },
        { width: 10, warnings: [ undefined, false, false, false ] },
        { width: 30, warnings: [ undefined, true, false, false ] }
      ]
    })
  })

  it('calculates an overoccupied street', () => {
    const street = {
      width: 50,
      segments: [
        { width: 30 },
        { width: 10 },
        { width: 30 }
      ]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 70,
      remainingWidth: -20,
      segments: [
        { width: 30, warnings: [ undefined, true, false, false ] },
        { width: 10, warnings: [ undefined, false, false, false ] },
        { width: 30, warnings: [ undefined, true, false, false ] }
      ]
    })
  })

  it('calculates warnings for segments above max width or below min width', () => {
    const street = {
      width: 50,
      segments: [
        { width: 2, type: 'sidewalk', variantString: 'normal' },
        { width: 10, type: 'divider', variantString: 'bush' },
        { width: 18, type: 'parking-lane', variantString: 'inbound|left' }
      ]
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 30,
      remainingWidth: 20,
      segments: [
        { width: 2, type: 'sidewalk', variantString: 'normal', warnings: [ undefined, false, true, false ] },
        { width: 10, type: 'divider', variantString: 'bush', warnings: [ undefined, false, false, false ] },
        { width: 18, type: 'parking-lane', variantString: 'inbound|left', warnings: [ undefined, false, false, true ] }
      ]
    })
  })

  it('returns valid data for streets with zero segments', () => {
    const street = {
      width: 50,
      segments: []
    }
    expect(recalculateWidth(street)).toEqual({
      occupiedWidth: 0,
      remainingWidth: 50,
      segments: []
    })
  })
})
