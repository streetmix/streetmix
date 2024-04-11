import { vi } from 'vitest'
import { getRandomObjects } from '../scatter'
import PEOPLE from '../people.json'

// Provide mock people data to prevent changes in production data from
// breaking the expected values of this test
vi.mock('../people.json', () => ({
  default: require('../__mocks__/people.json')
}))

// The unit test for `getRandomObjects()` is designed so that the expected
// return values are very precise decimal numbers, on purpose. We want to see
// the same values on each test, so that refactoring it does not cause new
// regressions. One example of a large refactoring project that will happen
// in the future is when we change from using imperial to metric units
// primarily. We want the actual appearance of streets to remain as stable
// as possible.
//
// However, using these exact numbers can be brittle, because there are
// certain unavoidable cases where the resulting values will be different.
// This usually happens when the random number generator gets called with
// different input, for example, when the number of people in the `people.json`
// pool have changed. We have mocked this data, so changing the mock data
// is an expected cause for breaking the test and needing this to update.
//
// Another reason is if the random number generator is called in a slightly
// different order because we have changed the logic. This is an example that
// requires justification to break the test. Is changing the logic necessary
// to make a performance improvement, or add a new feature? If so, then this
// can cause a change in output that we expect, and we should update the test
// to allow those values to change. But let's say we refactored the code to
// make use of a new JavaScript language feature, and we do not expect the
// output to be different. If it were (and tests fail), we can then go back
// and see whether a mistake was made.
describe('scatter objects in segments', () => {
  it('picks people at normal density', () => {
    const [people, startLeft] = getRandomObjects(
      PEOPLE,
      28.66667,
      936877893,
      0,
      5,
      4,
      -0.5,
      2
    )

    expect(people).toMatchSnapshot()
    expect(startLeft).toEqual(5.479749926272657)
  })

  it('picks people at sparse density', () => {
    const [people, startLeft] = getRandomObjects(
      PEOPLE,
      28.66667,
      936877893,
      3.5,
      11.8333,
      4,
      -0.5,
      2
    )

    expect(people).toMatchSnapshot()
    expect(startLeft).toEqual(4.346658384686)
  })

  it('picks people at dense density', () => {
    const [people, startLeft] = getRandomObjects(
      PEOPLE,
      28.66667,
      936877893,
      0,
      1.5,
      4,
      -0.5,
      2
    )

    expect(people).toMatchSnapshot()
    expect(startLeft).toEqual(2.9027498893762225)
  })

  it('picks from a pool of one single string id', () => {
    const scatter = {
      sprites: ['plants--bush'],
      minSpacing: -3,
      maxSpacing: 3,
      padding: 2
    }
    const pool = [
      {
        id: 'plants--bush',
        width: 5
      }
    ]

    const [objects, startLeft] = getRandomObjects(
      pool,
      20,
      0,
      scatter.minSpacing,
      scatter.maxSpacing,
      5,
      0,
      scatter.padding
    )

    expect(objects).toMatchSnapshot()
    expect(startLeft).toEqual(4.430707699360696)
  })
})
