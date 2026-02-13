import { getSlopeValues, getRiseRunValues, getSlopeWarnings } from './slope'

describe('getSlopeValues', () => {
  it('calculates slope', () => {
    const street = {
      segments: [
        { width: 4, elevation: 0 },
        { width: 4, slope: { on: true, values: [] } },
        { width: 4, elevation: 0.125 },
      ],
    }
    expect(getSlopeValues(street, 1)).toEqual([0, 0.125])
  })

  it('calculates slopes against left boundary', () => {
    const street = {
      boundary: {
        left: {
          elevation: 1,
        },
      },
      segments: [
        { width: 4, slope: { on: true, values: [] } },
        { width: 4, elevation: 0.125 },
      ],
    }
    expect(getSlopeValues(street, 0)).toEqual([1, 0.125])
  })

  it('calculates slopes against right boundary', () => {
    const street = {
      boundary: {
        right: {
          elevation: 0.5,
        },
      },
      segments: [
        { width: 4, elevation: 0 },
        { width: 4, slope: { on: true, values: [] } },
      ],
    }
    expect(getSlopeValues(street, 1)).toEqual([0, 0.5])
  })
})

describe('getRiseRunValues', () => {
  it('calculates rise/run values', () => {
    expect(getRiseRunValues([0, 0.125], 4)).toEqual({
      ratio: 32,
      slope: '3.13',
    })
  })

  it('handles a flat value', () => {
    expect(getRiseRunValues([1, 1], 4)).toEqual({
      ratio: undefined,
      slope: '0.00',
    })
  })
})

describe('getSlopeWarnings', () => {
  it('returns no warnings', () => {
    expect(getSlopeWarnings(25)).toEqual({
      slopeExceededBerm: false,
      slopeExceededPath: false,
    })
  })

  it('returns a warning for exceeding path slope', () => {
    expect(getSlopeWarnings(5)).toEqual({
      slopeExceededBerm: false,
      slopeExceededPath: true,
    })
  })

  it('returns a warning for exceeding berm slope', () => {
    expect(getSlopeWarnings(1)).toEqual({
      slopeExceededBerm: true,
      slopeExceededPath: true,
    })
  })
})
