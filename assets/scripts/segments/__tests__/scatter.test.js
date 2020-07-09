/* eslint-env jest */
import { getRandomObjects } from '../scatter'
import PEOPLE from '../people.json'

// The unit test for `getRandomObjects()` is designed to ensure that it
// returns the same values as previous behaviour, because we're heavily
// refactoring how this works, and want to avoid regressions. We will need to
// continue making sure that we return similar output against future
// refactoring -- for instance, when transitioning from imperial to metric
// units.

// However! The output of this function is not intended to be guaranteed
// consistent across all releases, because it can change for any reason -- for
// example, just adding more people to people.json will result in different
// output. As a future improvement, we can either make this test more general,
// or roll it up into an integration test.
describe('scatter objects in segments', () => {
  it('picks people at normal density', () => {
    const [people, startLeft] = getRandomObjects(
      PEOPLE,
      28.66667,
      936877893,
      0,
      5,
      4,
      -0.5
    )

    expect(people).toMatchSnapshot()
    expect(startLeft).toEqual(3.7987234759633886)
  })

  it('picks people at sparse density', () => {
    const [people, startLeft] = getRandomObjects(
      PEOPLE,
      28.66667,
      936877893,
      3.5,
      11.8333,
      4,
      -0.5
    )

    expect(people).toMatchSnapshot()
    expect(startLeft).toEqual(4.846658384686)
  })

  it('picks people at dense density', () => {
    const [people, startLeft] = getRandomObjects(
      PEOPLE,
      28.66667,
      936877893,
      0,
      1.5,
      4,
      -0.5
    )

    expect(people).toMatchSnapshot()
    expect(startLeft).toEqual(3.0462522570605604)
  })

  it('picks from a pool of one single string id', () => {
    const scatter = {
      sprites: ['plants--bush'],
      minSpacing: -3,
      maxSpacing: 3
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
      0
    )

    expect(objects).toMatchSnapshot()
    expect(startLeft).toEqual(4.430707699360696)
  })
})
