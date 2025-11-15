import { vi } from 'vitest'
import {
  getSegmentCapacity,
  getStreetCapacity,
  getRolledUpSegmentCapacities,
  getCsv
} from '../capacity'

// Provide mock capacity data to prevent changes in production data from
// breaking the expected values of this test
vi.mock('../../segments/capacity_data.json', () => ({
  default: require('../__mocks__/capacity_data.json')
}))

describe('segment capacity', () => {
  it('returns capacity data for segment', () => {
    const segment = {
      type: 'foo',
      warnings: []
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 200,
      potential: 300
    })
  })

  it('returns capacity data for segment with inherited data', () => {
    const segment = {
      type: 'zed',
      warnings: []
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
      },
      warnings: []
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 200,
      potential: 300
    })
  })

  it('returns capacity data for segment from common data source', () => {
    const segment = {
      type: 'baz',
      warnings: []
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 100,
      potential: 200
    })
  })

  it('drops capacity to zero for segments outside the street', () => {
    const segment = {
      type: 'foo',
      warnings: [false, true, false, false]
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 0,
      potential: 0
    })
  })

  it('drops capacity to zero for segments that are too small', () => {
    const segment = {
      type: 'foo',
      warnings: [false, false, true, false]
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 0,
      potential: 0
    })
  })

  it('returns undefined if segment does not have a capacity data point', () => {
    const segment = {
      type: 'bar',
      warnings: []
    }

    expect(getSegmentCapacity(segment)).toEqual(undefined)

    // Don't return zero capacity for segments that don't have defined
    // capacities. This captures a potential bug that can occur if the logic
    // is changed or refactored.
    const segment2 = {
      type: 'bar',
      warnings: [false, true, false, false]
    }

    expect(getSegmentCapacity(segment2)).toEqual(undefined)
  })
})

describe('street capacity', () => {
  it('returns capacity data for street', () => {
    const street = {
      segments: [
        {
          type: 'baz',
          warnings: []
        },
        // Include two segments (both should be added)
        {
          type: 'foo',
          warnings: []
        },
        {
          type: 'foo',
          warnings: []
        },
        // Include a segment without capacity (adds zero)
        {
          type: 'bar',
          warnings: []
        },
        // Include a segment with warnings (adds zero)
        {
          type: 'baz',
          warnings: [false, true, false, false]
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
          type: 'bar',
          warnings: []
        },
        {
          type: 'baz',
          warnings: [false, true, false, false]
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
  const street = {
    segments: [
      {
        type: 'qux',
        warnings: []
      },
      // Include two segments (both should be added)
      // and sorted before 'qux'
      {
        type: 'foo',
        warnings: []
      },
      {
        type: 'foo',
        warnings: []
      },
      // Result should sort 'baz' before 'foo'
      {
        type: 'baz',
        warnings: []
      },
      {
        type: 'qux',
        warnings: []
      },
      // Include a segment without capacity (adds zero)
      {
        type: 'bar',
        warnings: []
      },
      // Include a segment with warnings (adds zero)
      {
        type: 'baz',
        warnings: [false, true, false, false]
      }
    ]
  }

  it('returns sorted, rolled-up capacity data for street', () => {
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
          type: 'bar',
          warnings: []
        }
      ]
    }

    expect(getRolledUpSegmentCapacities(street)).toEqual([])
  })

  it('exports csv data', () => {
    const data = getRolledUpSegmentCapacities(street)
    const csv = getCsv(data)
    expect(csv).toMatchSnapshot()
  })
})
