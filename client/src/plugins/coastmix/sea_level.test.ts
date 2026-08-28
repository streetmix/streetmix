import { createStreetState } from '~/test/factories/street.js'
import { calculateSeaLevelRise, calculateFloodDetails } from './sea_level.js'

describe('sea level rise', () => {
  it('calculates the correct sea level rises', () => {
    const street = createStreetState({
      boundary: {
        left: {
          variant: 'beach',
          elevation: 0,
        },
        right: {
          variant: 'grass',
          elevation: 1,
        },
      },
    })

    // Sea level rise is off (current year, no storm surge)
    const result1a = calculateSeaLevelRise(0, false, street)
    expect(result1a).toBe(0)

    // Sea level rise is at current year, with storm surge
    const result1b = calculateSeaLevelRise(0, true, street)
    expect(result1b).toBe(0.381)

    // Sea level rise at various targets, no storm surge
    const result2 = calculateSeaLevelRise(2030, false, street)
    expect(result2).toBe(0.457)

    const result3 = calculateSeaLevelRise(2050, false, street)
    expect(result3).toBe(0.762)

    const result4 = calculateSeaLevelRise(2070, false, street)
    expect(result4).toBe(1.372)

    // Sea level rise at various targets, with storm surge
    const result5 = calculateSeaLevelRise(2030, true, street)
    expect(result5).toBe(0.838)

    const result6 = calculateSeaLevelRise(2050, true, street)
    expect(result6).toBe(1.143)

    const result7 = calculateSeaLevelRise(2070, true, street)
    expect(result7).toBe(1.753)

    // Sea level rise when sea level is raised
    street.boundary.right.variant = 'beach'
    street.boundary.left.elevation = 1
    const result8 = calculateSeaLevelRise(2030, true, street)
    expect(result8).toBe(1.838)

    const result9 = calculateSeaLevelRise(2070, false, street)
    expect(result9).toBe(2.372)
  })
})

describe('flooding distance', () => {
  // These tests cover distance -- they don't cover types and flooded state
  // TODO: types -- accurately include types from partially flooded slices,
  // make sure values are unique and `undefined` is filtered out, covers
  // slices where sloping is not permitted
  it.each([
    ['left', [0, 1]],
    ['right', [1, 0]],
  ] as const)(
    'detects a flooded distance from the %s',
    (direction, elevations) => {
      expect(
        calculateFloodDetails(
          elevations.map((elevation) => ({
            width: elevation === 0 ? 2 : 3,
            slope: { on: false, values: [] },
            type: 'sidewalk',
            variantString: 'normal',
            elevation,
          })),
          1,
          direction
        )
      ).toEqual({
        direction,
        distance: 2,
        floodedTypes: ['PEDESTRIAN'],
        flooded: false,
      })
    }
  )

  it.each(['left', 'right'] as const)(
    'detects zero flooding distance from the %s',
    (direction) => {
      expect(
        calculateFloodDetails(
          [
            {
              width: 2,
              slope: { on: false, values: [] },
              type: 'sidewalk',
              variantString: 'normal',
              elevation: 1.5,
            },
          ],
          1,
          direction
        )
      ).toEqual({
        direction,
        distance: 0,
        floodedTypes: [],
        flooded: false,
      })
    }
  )

  it.each(['left', 'right'] as const)(
    'detects infinite flooding distance from the %s',
    (direction) => {
      expect(
        calculateFloodDetails(
          [
            {
              width: 2,
              slope: { on: false, values: [] },
              type: 'sidewalk',
              variantString: 'normal',
              elevation: 0,
            },
          ],
          1,
          direction
        )
      ).toEqual({
        direction,
        distance: 'max',
        floodedTypes: ['PEDESTRIAN'],
        flooded: false,
      })
    }
  )

  it.each([
    ['left', [2, 0]],
    ['right', [0, 2]],
  ] as const)(
    'blocks flooding at a higher near slope edge from the %s',
    (direction, values) => {
      expect(
        calculateFloodDetails(
          [
            {
              width: 2,
              slope: { on: true, values },
              type: 'sidewalk',
              variantString: 'normal',
              elevation: 0,
            },
          ],
          1,
          direction
        )
      ).toEqual({
        direction,
        distance: 0,
        floodedTypes: [],
        flooded: false,
      })
    }
  )

  it.each([
    ['left', [0, 0.5]],
    ['right', [0.5, 0]],
  ] as const)('floods over a lower slope from the %s', (direction, values) => {
    expect(
      calculateFloodDetails(
        [
          {
            width: 2,
            slope: { on: true, values },
            type: 'sidewalk',
            variantString: 'normal',
            elevation: 0,
          },
        ],
        1,
        direction
      )
    ).toEqual({
      direction,
      distance: 'max',
      floodedTypes: ['PEDESTRIAN'],
      flooded: false,
    })
  })

  it.each([
    ['left', [0, 2]],
    ['right', [2, 0]],
  ] as const)('partially floods a slope from the %s', (direction, values) => {
    expect(
      calculateFloodDetails(
        [
          {
            width: 10,
            slope: { on: true, values },
            type: 'sidewalk',
            variantString: 'normal',
            elevation: 0,
          },
        ],
        1,
        direction
      )
    ).toEqual({
      direction,
      distance: 5,
      floodedTypes: ['PEDESTRIAN'],
      flooded: false,
    })
  })

  it('does not divide by zero for a level slope at the flood height', () => {
    expect(
      calculateFloodDetails(
        [
          {
            width: 2,
            slope: { on: true, values: [1, 1] },
            type: 'sidewalk',
            variantString: 'normal',
            elevation: 0,
          },
        ],
        1,
        'left'
      )
    ).toEqual({
      direction: 'left',
      distance: 0,
      floodedTypes: [],
      flooded: false,
    })
  })
})
