/* eslint-env jest */
import {
  getSegmentCapacity,
  getStreetCapacity,
  getRolledUpSegmentCapacities
} from '../capacity'

// Provide mock capacity data to prevent changes in production data from
// breaking the expected values of this test
jest.mock('../../segments/capacity.json', () =>
  require('../__mocks__/capacity.json')
)

describe('segment capacity', () => {
  it('returns capacity data for segment', () => {
    const segment = {
      type: 'foo'
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 200,
      potential: 300
    })
  })

  it('returns capacity data for segment with inherited data', () => {
    const segment = {
      type: 'zed'
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 200,
      potential: 300
    })
  })

  it('returns capacity data for segment variant with inherited data', () => {
    const segment = {
      type: 'qux',
      variant: {
        var: 'foofoo'
      }
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 200,
      potential: 300
    })
  })

  it('returns capacity data for segment from common data source', () => {
    const segment = {
      type: 'baz'
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 100,
      potential: 200
    })
  })

  it('drops capacity to zero for segments outside the street', () => {
    const segment = {
      type: 'foo',
      warnings: [null, true, false, false]
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 0,
      potential: 0
    })
  })

  it('drops capacity to zero for segments that are too small', () => {
    const segment = {
      type: 'foo',
      warnings: [null, false, true, false]
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 0,
      potential: 0
    })
  })

  it('returns null if segment does not have a capacity data point', () => {
    const segment = {
      type: 'bar'
    }

    expect(getSegmentCapacity(segment)).toEqual(null)

    // Don't return zero capacity for segments that don't have defined
    // capacities. This captures a potential bug that can occur if the logic
    // is changed or refactored.
    const segment2 = {
      type: 'bar',
      warnings: [null, true, false, false]
    }

    expect(getSegmentCapacity(segment2)).toEqual(null)
  })
})

describe('street capacity', () => {
  it('returns capacity data for street', () => {
    const street = {
      segments: [
        {
          type: 'baz'
        },
        // Include two segments (both should be added)
        {
          type: 'foo'
        },
        {
          type: 'foo'
        },
        // Include a segment without capacity (adds zero)
        {
          type: 'bar'
        },
        // Include a segment with warnings (adds zero)
        {
          type: 'baz',
          warnings: [null, true, false, false]
        }
      ]
    }

    expect(getStreetCapacity(street)).toEqual({
      average: 500,
      potential: 800
    })
  })

  it('returns capacity data for street without capacity', () => {
    const street = {
      segments: [
        {
          type: 'bar'
        },
        {
          type: 'baz',
          warnings: [null, true, false, false]
        }
      ]
    }

    expect(getStreetCapacity(street)).toEqual({
      average: 0,
      potential: 0
    })
  })
})

describe('rolled-up segment capacities', () => {
  it('returns sorted, rolled-up capacity data for street', () => {
    const street = {
      segments: [
        {
          type: 'qux'
        },
        // Include two segments (both should be added)
        // and sorted before 'qux'
        {
          type: 'foo'
        },
        {
          type: 'foo'
        },
        // Result should sort 'baz' before 'foo'
        {
          type: 'baz'
        },
        {
          type: 'qux'
        },
        // Include a segment without capacity (adds zero)
        {
          type: 'bar'
        },
        // Include a segment with warnings (adds zero)
        {
          type: 'baz',
          warnings: [null, true, false, false]
        }
      ]
    }

    expect(getRolledUpSegmentCapacities(street)).toEqual([
      {
        type: 'baz',
        capacity: { average: 100, potential: 200 }
      },
      // Results should have lower average sorted before higher average,
      // when the potential values are the same
      {
        type: 'foo',
        capacity: { average: 400, potential: 600 }
      },
      {
        type: 'qux',
        capacity: { average: 600, potential: 600 }
      }
    ])
  })

  it('returns empty array for street without capacity', () => {
    const street = {
      segments: [
        {
          type: 'bar'
        }
      ]
    }

    expect(getRolledUpSegmentCapacities(street)).toEqual([])
  })
})
