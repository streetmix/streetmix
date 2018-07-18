/* eslint-env jest */
import { recalculateWidth } from '../width'

jest.mock('../../app/window_resize', () => {})
jest.mock('../../segments/buildings', () => {})

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
