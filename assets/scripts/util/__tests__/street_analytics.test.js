/* eslint-env jest */
import { getSegmentCapacity } from '../street_analytics'

// Provide mock capacity data to prevent changes in production data from
// breaking the expected values of this test
jest.mock('../../segments/capacity.json', () =>
  require('../../segments/__mocks__/capacity.json')
)

describe('segment capacity', () => {
  it('returns capacity data for segment', () => {
    const segment = {
      type: 'foo'
    }

    expect(getSegmentCapacity(segment)).toEqual({
      average: 999,
      potential: 4747
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
