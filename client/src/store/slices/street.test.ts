import { createStreetState } from '~/test/factories/street.js'
import street, {
  updateStreetData,
  addSegment,
  removeSegment,
  moveSegment,
  updateSegments,
  clearSegments,
  changeSegmentWidth,
  changeSegmentVariant,
  changeSegmentProperties,
  saveStreetName,
  saveCreatorId,
  saveStreetId,
  updateStreetIdMetadata,
  setUpdateTime,
  saveOriginalStreetId,
  updateEditCount,
  setUnits,
  updateStreetWidth,
  updateSchemaVersion,
  addLocation,
  clearLocation,
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue,
  setBuildingVariant,
  setSkybox,
  setWeather,
} from './street.js'

describe('street reducer', () => {
  const initialState = createStreetState()

  it('should handle updateStreetData()', () => {
    expect(
      street(
        initialState,
        updateStreetData({
          segments: [1, 2, 3],
          name: 'foo',
          userUpdated: true,
        })
      )
    ).toEqual({
      ...initialState,
      segments: [1, 2, 3],
      name: 'foo',
      userUpdated: true,
    })
  })

  it('should handle addSegment()', () => {
    // Add a segment at index 0 from initial state
    expect(street(initialState, addSegment(0, { type: 'foo' }))).toEqual({
      ...initialState,
      segments: [{ type: 'foo' }],
    })

    // Insert a segment at index 0 for an existing street
    expect(
      street(
        {
          segments: [{ type: 'foo' }],
        },
        addSegment(0, { type: 'bar' })
      )
    ).toEqual({
      segments: [{ type: 'bar' }, { type: 'foo' }],
    })

    // Insert a segment at index 1 for an existing street
    expect(
      street(
        {
          segments: [{ type: 'foo' }],
        },
        addSegment(1, { type: 'bar' })
      )
    ).toEqual({
      segments: [{ type: 'foo' }, { type: 'bar' }],
    })

    // Insert a segment at index 1 for an existing street
    expect(
      street(
        {
          segments: [{ type: 'foo' }, { type: 'baz' }],
        },
        addSegment(1, { type: 'bar' })
      )
    ).toEqual({
      segments: [{ type: 'foo' }, { type: 'bar' }, { type: 'baz' }],
    })
  })

  it('should handle removeSegment()', () => {
    const existingStreet = createStreetState({
      immediateRemoval: true,
      segments: [
        { type: 'foo' },
        { type: 'bar' },
        { type: 'baz' },
        { type: 'qux' },
      ],
    })

    // Removes a segment at index 1 from an existing street
    expect(street(existingStreet, removeSegment(1))).toEqual({
      ...existingStreet,
      immediateRemoval: true,
      segments: [{ type: 'foo' }, { type: 'baz' }, { type: 'qux' }],
    })

    // Removes a segment at index 0 from an existing street
    expect(street(existingStreet, removeSegment(0))).toEqual({
      ...existingStreet,
      immediateRemoval: true,
      segments: [{ type: 'bar' }, { type: 'baz' }, { type: 'qux' }],
    })

    // Returns existing street if a removed segment is out of bounds
    expect(street(existingStreet, removeSegment(8))).toEqual(existingStreet)
  })

  it('should handle moveSegment()', () => {
    const existingStreet = createStreetState({
      segments: [{ type: 'foo' }, { type: 'bar' }, { type: 'baz' }],
    })

    // Moves a segment at index 0 to index 1 on an existing street
    expect(street(existingStreet, moveSegment(0, 1))).toEqual({
      ...existingStreet,

      segments: [{ type: 'bar' }, { type: 'foo' }, { type: 'baz' }],
    })

    // Moves a segment at index 2 to index 0 on an existing street
    expect(street(existingStreet, moveSegment(2, 0))).toEqual({
      ...existingStreet,
      segments: [{ type: 'baz' }, { type: 'foo' }, { type: 'bar' }],
    })

    // moves a segment to the end if desired index is out of bounds
    expect(street(existingStreet, moveSegment(1, 8))).toEqual({
      ...existingStreet,
      segments: [{ type: 'foo' }, { type: 'baz' }, { type: 'bar' }],
    })

    // optionally updates a moved segment's properties during a move
    // TODO: test that this preserves non-updated properties
    expect(street(existingStreet, moveSegment(0, 1, { elevation: 2 }))).toEqual(
      {
        ...existingStreet,

        segments: [
          { type: 'bar' },
          { type: 'foo', elevation: 2 },
          { type: 'baz' },
        ],
      }
    )
  })

  it('should handle updateSegments()', () => {
    expect(street(initialState, updateSegments([1, 2, 3], 10, 20))).toEqual({
      ...initialState,
      segments: [1, 2, 3],
      occupiedWidth: 10,
      remainingWidth: 20,
    })
  })

  it('should handle clearSegments()', () => {
    expect(
      street(
        {
          segments: [1, 2, 3],
          immediateRemoval: false,
        },
        clearSegments()
      )
    ).toEqual({
      segments: [],
      immediateRemoval: true,
    })
  })

  it('should handle changeSegmentWidth()', () => {
    expect(
      street(
        {
          segments: [
            { type: 'foo', width: 1 },
            { type: 'bar', width: 2 },
            { type: 'baz', width: 3 },
          ],
        },
        changeSegmentWidth(0, 20)
      )
    ).toEqual({
      segments: [
        { type: 'foo', width: 20 },
        { type: 'bar', width: 2 },
        { type: 'baz', width: 3 },
      ],
    })
  })

  it('should handle changeSegmentVariant()', () => {
    expect(
      street(
        {
          segments: [
            { type: 'foo' },
            { type: 'bar' },
            {
              elevation: 0,
              type: 'drive-lane',
              variantString: 'inbound|car',
              variant: {
                direction: 'inbound',
                'car-type': 'car',
              },
            },
          ],
        },
        changeSegmentVariant(2, 'direction', 'outbound')
      )
    ).toEqual({
      segments: [
        { type: 'foo' },
        { type: 'bar' },
        {
          elevation: 0,
          type: 'drive-lane',
          variantString: 'outbound|car',
          variant: {
            direction: 'outbound',
            'car-type': 'car',
          },
        },
      ],
    })
  })

  it('should handle changeSegmentProperties()', () => {
    expect(
      street(
        {
          segments: [{ x: 1 }, { x: 2 }],
        },
        changeSegmentProperties(1, { x: 3, y: 4 })
      )
    ).toEqual({
      segments: [{ x: 1 }, { x: 3, y: 4 }],
    })
  })

  describe('saveStreetName()', () => {
    it('should update a street name when set by user', () => {
      const existingStreet = createStreetState({
        name: 'street name',
        userUpdated: false,
      })

      expect(
        street(existingStreet, saveStreetName('new street name', true))
      ).toEqual({
        ...existingStreet,
        name: 'new street name',
        userUpdated: true,
      })
    })

    it('should not update a street name set by a user, when set by automation', () => {
      const existingStreet = createStreetState({
        name: 'street name',
        userUpdated: true,
      })

      expect(
        street(existingStreet, saveStreetName('new street name', false))
      ).toEqual({
        ...existingStreet,
        name: 'street name',
        userUpdated: true,
      })
    })

    it('should update a street name previously set only by automation, when set by automation', () => {
      const existingStreet = createStreetState({
        name: 'street name',
        userUpdated: false,
      })

      expect(
        street(existingStreet, saveStreetName('new street name', false))
      ).toEqual({
        ...existingStreet,
        name: 'new street name',
        userUpdated: false,
      })
    })

    it('should clear a street name set by automation, when cleared by automation', () => {
      const existingStreet = createStreetState({
        name: 'street name',
        userUpdated: false,
      })

      expect(street(existingStreet, saveStreetName(undefined, false))).toEqual({
        ...existingStreet,
        name: null,
        userUpdated: false,
      })
    })

    it('should not clear a street name set by a user, when cleared by automation', () => {
      const existingStreet = createStreetState({
        name: 'street name',
        userUpdated: true,
      })

      expect(street(existingStreet, saveStreetName(null, false))).toEqual({
        ...existingStreet,
        name: 'street name',
        userUpdated: true,
      })
    })
  })

  it('should handle saveCreatorId()', () => {
    const existingStreet = createStreetState({ creatorId: 'bar' })

    expect(street(existingStreet, saveCreatorId('foo'))).toEqual({
      ...existingStreet,
      creatorId: 'foo',
    })
  })

  it('should handle saveStreetId()', () => {
    const existingStreet = createStreetState({
      id: 'baz',
      namespacedId: 123,
    })

    expect(street(existingStreet, saveStreetId('foo', 456))).toEqual({
      ...existingStreet,
      id: 'foo',
      namespacedId: 456,
    })
  })

  it('should handle updateStreetIdMetadata()', () => {
    expect(
      street(
        initialState,
        updateStreetIdMetadata({
          creatorId: 'foo',
          id: 'bar',
          namespacedId: 123,
        })
      )
    ).toEqual({
      ...initialState,
      creatorId: 'foo',
      id: 'bar',
      namespacedId: 123,
    })
  })

  it('should handle setUpdateTime()', () => {
    const existingStreet = createStreetState({
      updatedAt: '2020-04-20T00:00:00.000Z',
      clientUpdatedAt: '2020-04-20T00:00:00.000Z',
    })
    expect(
      street(existingStreet, setUpdateTime('2020-04-27T18:30:00.000Z'))
    ).toEqual({
      ...existingStreet,
      updatedAt: '2020-04-27T18:30:00.000Z',
      clientUpdatedAt: '2020-04-27T18:30:00.000Z',
    })
  })

  it('should handle saveOriginalStreetId()', () => {
    const existingStreet = createStreetState({
      originalStreetId: 'bar',
    })

    expect(street(existingStreet, saveOriginalStreetId('foo'))).toEqual({
      ...existingStreet,
      originalStreetId: 'foo',
    })
  })

  it('should handle updateEditCount()', () => {
    const existingStreet = createStreetState({ editCount: 2 })

    expect(street(existingStreet, updateEditCount(3))).toEqual({
      ...existingStreet,
      editCount: 3,
    })
  })

  it('should handle setUnits()', () => {
    const existingStreet = createStreetState({ units: 0 })

    expect(street(existingStreet, setUnits(1))).toEqual({
      ...existingStreet,
      units: 1,
    })
  })

  it('should handle updateStreetWidth()', () => {
    const existingStreet = createStreetState({ width: 10 })

    expect(street(existingStreet, updateStreetWidth(11))).toEqual({
      ...existingStreet,
      width: 11,
    })
  })

  it('should handle updateSchemaVersion()', () => {
    const existingStreet = createStreetState({
      schemaVersion: 33,
    })

    expect(street(existingStreet, updateSchemaVersion(34))).toEqual({
      ...existingStreet,
      schemaVersion: 34,
    })
  })

  describe('location', () => {
    const location = {
      latlng: { lat: 0, lng: 0 },
      label: 'test street',
      hierarchy: {
        country: 'country',
        locality: 'locality',
        neighbourhood: 'neighbourhood',
        street: 'street',
      },
      geometryId: null,
      intersectionId: null,
    }

    it('should handle addLocation()', () => {
      expect(street(initialState, addLocation(location))).toEqual({
        ...initialState,
        location,
      })
    })

    it('should handle clearLocation(), clearing street name if user has not edited it', () => {
      const existingStreet = createStreetState({
        location,
        userUpdated: false,
        name: 'test street',
      })

      expect(street(existingStreet, clearLocation())).toEqual({
        ...existingStreet,
        location: null,
        userUpdated: false,
        name: null,
      })
    })

    it('should handle clearLocation(), leaving street name if user has edited it', () => {
      const existingStreet = createStreetState({
        location,
        userUpdated: true,
        name: 'test street',
      })

      expect(street(existingStreet, clearLocation())).toEqual({
        ...existingStreet,
        location: null,
        userUpdated: true,
        name: 'test street',
      })
    })
  })

  describe('buildings', () => {
    describe('addBuildingFloor()', () => {
      it('adds a floor on the left building', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              floors: 1,
            },
          },
        })

        const result = street(existingStreet, addBuildingFloor('left'))
        expect(result.boundary.left.floors).toEqual(2)
      })

      it('adds a floor on the right building', () => {
        const existingStreet = createStreetState({
          boundary: {
            right: {
              floors: 19,
            },
          },
        })

        const result = street(existingStreet, addBuildingFloor('right'))
        expect(result.boundary.right.floors).toEqual(20)
      })

      it('will not increase a building height past maximum', () => {
        const existingStreet = createStreetState({
          boundary: {
            right: {
              floors: 20,
            },
          },
        })

        const result = street(existingStreet, addBuildingFloor('right'))
        expect(result.boundary.right.floors).toEqual(20)
      })
    })

    describe('removeBuildingFloor()', () => {
      it('removes a floor on the left building', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              floors: 2,
            },
          },
        })

        const result = street(existingStreet, removeBuildingFloor('left'))
        expect(result.boundary.left.floors).toEqual(1)
      })

      it('removes a floor on the right building', () => {
        const existingStreet = createStreetState({
          boundary: {
            right: {
              floors: 19,
            },
          },
        })

        const result = street(existingStreet, removeBuildingFloor('right'))
        expect(result.boundary.right.floors).toEqual(18)
      })

      it('will not decrease a building height past minimum', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              floors: 1,
            },
          },
        })

        const result = street(existingStreet, removeBuildingFloor('left'))
        expect(result.boundary.left.floors).toEqual(1)
      })
    })

    describe('setBuildingFloorValue()', () => {
      it('sets a floor value on the left building', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              floors: 1,
            },
          },
        })

        const result = street(
          existingStreet,
          setBuildingFloorValue('left', '3')
        )
        expect(result.boundary.left.floors).toEqual(3)
      })

      it('sets a floor value on the right building', () => {
        const existingStreet = createStreetState({
          boundary: {
            right: {
              floors: 1,
            },
          },
        })

        const result = street(
          existingStreet,
          setBuildingFloorValue('right', '1')
        )
        expect(result.boundary.right.floors).toEqual(1)
      })

      it('will clamp a value to minimum', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              floors: 20,
            },
          },
        })

        const result = street(
          existingStreet,
          setBuildingFloorValue('left', '0')
        )
        expect(result.boundary.left.floors).toEqual(1)
      })

      it('will clamp a value to maximum', () => {
        const existingStreet = createStreetState({
          boundary: {
            right: {
              floors: 1,
            },
          },
        })

        const result = street(
          existingStreet,
          setBuildingFloorValue('right', '1000')
        )
        expect(result.boundary.right.floors).toEqual(20)
      })

      it('refuses to set a value that is NaN', () => {
        const existingStreet = createStreetState({
          boundary: {
            right: {
              floors: 5,
            },
          },
        })

        const result = street(
          existingStreet,
          setBuildingFloorValue('right', NaN)
        )
        expect(result.boundary.right.floors).toEqual(5)
      })

      it('refuses to set a value that is falsy', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              floors: 5,
            },
          },
        })

        // Only cover the empty string case because all other falsy values are
        // type errors
        expect(
          street(existingStreet, setBuildingFloorValue('left', ''))
        ).toEqual(existingStreet)
      })

      it('parses integer values from non-integer input', () => {
        const existingStreet = createStreetState({
          boundary: {
            right: {
              floors: 5,
            },
          },
        })

        const result1 = street(
          existingStreet,
          setBuildingFloorValue('right', '4.5')
        )
        expect(result1.boundary.right.floors).toEqual(4)

        const result2 = street(
          existingStreet,
          setBuildingFloorValue('right', '9')
        )
        expect(result2.boundary.right.floors).toEqual(9)

        const result3 = street(
          existingStreet,
          setBuildingFloorValue('right', '6 floors')
        )
        expect(result3.boundary.right.floors).toEqual(6)
      })

      it('does not set a value if integer value cannot be parsed from non-integer input', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              floors: 5,
            },
          },
        })

        const result = street(
          existingStreet,
          setBuildingFloorValue('right', 'foo')
        )
        expect(result.boundary.left.floors).toEqual(5)
      })
    })

    describe('setBuildingVariant()', () => {
      it('sets a variant on the left building', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              variant: 'wide',
              elevation: 0,
            },
            right: {
              variant: 'wide',
              elevation: 0,
            },
          },
        })

        const result = street(
          existingStreet,
          setBuildingVariant('left', 'narrow')
        )
        expect(result.boundary.left.variant).toEqual('narrow')
      })

      it('sets a floor value on the right building', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              variant: 'narrow',
              elevation: 0,
            },
            right: {
              variant: 'narrow',
              elevation: 0,
            },
          },
        })

        const result = street(
          existingStreet,
          setBuildingVariant('right', 'wide')
        )
        expect(result.boundary.right.variant).toEqual('wide')
      })

      it('refuses to set a value that is falsy', () => {
        const existingStreet = createStreetState({
          boundary: {
            left: {
              variant: 'waterfront',
              elevation: 0,
            },
            right: {
              variant: 'waterfront',
              elevation: 0,
            },
          },
        })

        // Only cover the empty string case because all other falsy values
        // are type errors
        const result = street(existingStreet, setBuildingVariant('left', ''))
        expect(result.boundary.left.variant).toEqual('waterfront')
      })

      it.todo('matches waterfront sea level heights')
    })
  })

  it('should handle setSkybox()', () => {
    expect(street(initialState, setSkybox('foo'))).toEqual({
      ...initialState,
      skybox: 'foo',
    })
  })

  it('should handle setWeather()', () => {
    expect(street(initialState, setWeather('rain'))).toEqual({
      ...initialState,
      weather: 'rain',
    })

    expect(street(initialState, setWeather(null))).toEqual({
      ...initialState,
      weather: null,
    })
  })
})
