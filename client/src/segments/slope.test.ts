import { calculateSlope } from './slope'

describe('calculateSlope', () => {
  it('calculates slope', () => {
    const street = {
      segments: [
        { width: 4, elevation: 0 },
        { width: 4, slope: true },
        { width: 4, elevation: 0.125 }
      ]
    }
    expect(calculateSlope(street, 1)).toEqual({
      leftElevation: 0,
      rightElevation: 0.125,
      slope: '3.13',
      ratio: 32,
      warnings: {
        slopeExceededBerm: false,
        slopeExceededPath: false
      }
    })
  })

  it('calculates slope exceeding path slope', () => {
    const street = {
      width: 20,
      segments: [
        { width: 4, elevation: 0 },
        { width: 4, slope: true },
        { width: 4, elevation: 1 }
      ]
    }
    expect(calculateSlope(street, 1)).toEqual({
      leftElevation: 0,
      rightElevation: 1,
      slope: '25.00',
      ratio: 4,
      warnings: {
        slopeExceededBerm: false,
        slopeExceededPath: true
      }
    })
  })

  it('calculates slope exceeding berm slope', () => {
    const street = {
      segments: [
        { width: 4, elevation: 0 },
        { width: 4, slope: true },
        { width: 4, elevation: 2 }
      ]
    }
    expect(calculateSlope(street, 1)).toEqual({
      leftElevation: 0,
      rightElevation: 2,
      slope: '50.00',
      ratio: 2,
      warnings: {
        slopeExceededBerm: true,
        slopeExceededPath: true
      }
    })
  })

  it.todo('calculates slopes against left boundary')
  it.todo('calculates slopes against right boundary')

  it('handles flat slices', () => {
    const street = {
      segments: [
        { width: 4, elevation: 0 },
        { width: 4, elevation: 0 },
        { width: 4, elevation: 2 }
      ]
    }
    expect(calculateSlope(street, 1)).toEqual({
      leftElevation: 0,
      rightElevation: 2,
      slope: '0.00',
      ratio: undefined,
      warnings: {
        slopeExceededBerm: false,
        slopeExceededPath: false
      }
    })
  })
})
