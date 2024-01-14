/* eslint-env jest */
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
  setEnvironment
} from './street'

describe('street reducer', () => {
  const initialState = {
    segments: [],
    remainingWidth: 0,
    environment: 'day',
    userUpdated: false,
    leftBuildingHeight: 0,
    rightBuildingHeight: 0,
    immediateRemoval: true,
    editCount: 0
  }

  it('should handle initial state', () => {
    expect(street(undefined, {})).toEqual(initialState)
  })

  it('should handle updateStreetData()', () => {
    expect(
      street(
        initialState,
        updateStreetData({
          segments: [1, 2, 3],
          name: 'foo',
          userUpdated: true
        })
      )
    ).toEqual({
      segments: [1, 2, 3],
      remainingWidth: 0,
      name: 'foo',
      userUpdated: true,
      leftBuildingHeight: 0,
      rightBuildingHeight: 0,
      environment: 'day',
      immediateRemoval: true,
      editCount: 0
    })
  })

  it('should handle addSegment()', () => {
    // Add a segment at index 0 from initial state
    expect(street(initialState, addSegment(0, { type: 'foo' }))).toEqual({
      segments: [{ type: 'foo' }],
      remainingWidth: 0,
      environment: 'day',
      userUpdated: false,
      leftBuildingHeight: 0,
      rightBuildingHeight: 0,
      immediateRemoval: true,
      editCount: 0
    })

    // Insert a segment at index 0 for an existing street
    expect(
      street(
        {
          segments: [{ type: 'foo' }]
        },
        addSegment(0, { type: 'bar' })
      )
    ).toEqual({
      segments: [{ type: 'bar' }, { type: 'foo' }]
    })

    // Insert a segment at index 1 for an existing street
    expect(
      street(
        {
          segments: [{ type: 'foo' }]
        },
        addSegment(1, { type: 'bar' })
      )
    ).toEqual({
      segments: [{ type: 'foo' }, { type: 'bar' }]
    })

    // Insert a segment at index 1 for an existing street
    expect(
      street(
        {
          segments: [{ type: 'foo' }, { type: 'baz' }]
        },
        addSegment(1, { type: 'bar' })
      )
    ).toEqual({
      segments: [{ type: 'foo' }, { type: 'bar' }, { type: 'baz' }]
    })
  })

  it('should handle removeSegment()', () => {
    const existingStreet = {
      immediateRemoval: true,
      segments: [
        { type: 'foo' },
        { type: 'bar' },
        { type: 'baz' },
        { type: 'qux' }
      ]
    }

    // Removes a segment at index 1 from an existing street
    expect(street(existingStreet, removeSegment(1))).toEqual({
      immediateRemoval: true,
      segments: [{ type: 'foo' }, { type: 'baz' }, { type: 'qux' }]
    })

    // Removes a segment at index 0 from an existing street
    expect(street(existingStreet, removeSegment(0))).toEqual({
      immediateRemoval: true,
      segments: [{ type: 'bar' }, { type: 'baz' }, { type: 'qux' }]
    })

    // Returns existing street if a removed segment is out of bounds
    expect(street(existingStreet, removeSegment(8))).toEqual(existingStreet)
  })

  it('should handle moveSegment()', () => {
    const existingStreet = {
      segments: [{ type: 'foo' }, { type: 'bar' }, { type: 'baz' }]
    }

    // Moves a segment at index 0 to index 1 on an existing street
    expect(street(existingStreet, moveSegment(0, 1))).toEqual({
      segments: [{ type: 'bar' }, { type: 'foo' }, { type: 'baz' }]
    })

    // Moves a segment at index 2 to index 0 on an existing street
    expect(street(existingStreet, moveSegment(2, 0))).toEqual({
      segments: [{ type: 'baz' }, { type: 'foo' }, { type: 'bar' }]
    })

    // moves a segment to the end if desired index is out of bounds
    expect(street(existingStreet, moveSegment(1, 8))).toEqual({
      segments: [{ type: 'foo' }, { type: 'baz' }, { type: 'bar' }]
    })
  })

  it('should handle updateSegments()', () => {
    expect(street(initialState, updateSegments([1, 2, 3], 10, 20))).toEqual({
      segments: [1, 2, 3],
      occupiedWidth: 10,
      remainingWidth: 20,
      environment: 'day',
      userUpdated: false,
      leftBuildingHeight: 0,
      rightBuildingHeight: 0,
      immediateRemoval: true,
      editCount: 0
    })
  })

  it('should handle clearSegments()', () => {
    expect(
      street(
        {
          segments: [1, 2, 3],
          immediateRemoval: false
        },
        clearSegments()
      )
    ).toEqual({
      segments: [],
      immediateRemoval: true
    })
  })

  it('should handle changeSegmentWidth()', () => {
    expect(
      street(
        {
          segments: [
            { type: 'foo', width: 1 },
            { type: 'bar', width: 2 },
            { type: 'baz', width: 3 }
          ]
        },
        changeSegmentWidth(0, 20)
      )
    ).toEqual({
      segments: [
        { type: 'foo', width: 20 },
        { type: 'bar', width: 2 },
        { type: 'baz', width: 3 }
      ]
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
                'car-type': 'car'
              }
            }
          ]
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
            'car-type': 'car'
          }
        }
      ]
    })
  })

  it('should handle changeSegmentProperties()', () => {
    expect(
      street(
        {
          segments: [{ x: 1 }, { x: 2 }]
        },
        changeSegmentProperties(1, { x: 3, y: 4 })
      )
    ).toEqual({
      segments: [{ x: 1 }, { x: 3, y: 4 }]
    })
  })

  describe('saveStreetName()', () => {
    it('should update a street name when set by user', () => {
      const existingStreet = {
        name: 'street name',
        userUpdated: false
      }

      expect(
        street(existingStreet, saveStreetName('new street name', true))
      ).toEqual({
        name: 'new street name',
        userUpdated: true
      })
    })

    it('should not update a street name set by a user, when set by automation', () => {
      const existingStreet = {
        name: 'street name',
        userUpdated: true
      }

      expect(
        street(existingStreet, saveStreetName('new street name', false))
      ).toEqual({
        name: 'street name',
        userUpdated: true
      })
    })

    it('should update a street name previously set only by automation, when set by automation', () => {
      const existingStreet = {
        name: 'street name',
        userUpdated: false
      }

      expect(
        street(existingStreet, saveStreetName('new street name', false))
      ).toEqual({
        name: 'new street name',
        userUpdated: false
      })
    })

    it('should clear a street name set by automation, when cleared by automation', () => {
      const existingStreet = {
        name: 'street name',
        userUpdated: false
      }

      expect(street(existingStreet, saveStreetName(undefined, false))).toEqual({
        name: null,
        userUpdated: false
      })
    })

    it('should not clear a street name set by a user, when cleared by automation', () => {
      const existingStreet = {
        name: 'street name',
        userUpdated: true
      }

      expect(street(existingStreet, saveStreetName(null, false))).toEqual({
        name: 'street name',
        userUpdated: true
      })
    })
  })

  it('should handle saveCreatorId()', () => {
    expect(street({ creatorId: 'bar' }, saveCreatorId('foo'))).toEqual({
      creatorId: 'foo'
    })
  })

  it('should handle saveStreetId()', () => {
    expect(
      street(
        {
          id: 'baz',
          namespacedId: 'qux'
        },
        saveStreetId('foo', 'bar')
      )
    ).toEqual({
      id: 'foo',
      namespacedId: 'bar'
    })
  })

  it('should handle updateStreetIdMetadata()', () => {
    expect(
      street(
        initialState,
        updateStreetIdMetadata({
          creatorId: 'foo',
          id: 'bar',
          namespacedId: 'baz'
        })
      )
    ).toEqual({
      segments: [],
      remainingWidth: 0,
      environment: 'day',
      userUpdated: false,
      leftBuildingHeight: 0,
      rightBuildingHeight: 0,
      immediateRemoval: true,
      editCount: 0,
      creatorId: 'foo',
      id: 'bar',
      namespacedId: 'baz'
    })
  })

  it('should handle setUpdateTime()', () => {
    expect(
      street(
        {
          updatedAt: '2020-04-20T00:00:00.000Z',
          clientUpdatedAt: '2020-04-20T00:00:00.000Z'
        },
        setUpdateTime('2020-04-27T18:30:00.000Z')
      )
    ).toEqual({
      updatedAt: '2020-04-27T18:30:00.000Z',
      clientUpdatedAt: '2020-04-27T18:30:00.000Z'
    })
  })

  it('should handle saveOriginalStreetId()', () => {
    expect(
      street({ originalStreetId: 'bar' }, saveOriginalStreetId('foo'))
    ).toEqual({
      originalStreetId: 'foo'
    })
  })

  it('should handle updateEditCount()', () => {
    expect(street({ editCount: 2 }, updateEditCount(3))).toEqual({
      editCount: 3
    })
  })

  it('should handle setUnits()', () => {
    expect(street({ units: 0 }, setUnits(1))).toEqual({
      units: 1
    })
  })

  it('should handle updateStreetWidth()', () => {
    expect(street({ width: 10 }, updateStreetWidth(11))).toEqual({
      width: 11
    })
  })

  it('should handle updateSchemaVersion()', () => {
    expect(street({ schemaVersion: 20 }, updateSchemaVersion(21))).toEqual({
      schemaVersion: 21
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
        street: 'street'
      },
      geometryId: null,
      intersectionId: null
    }

    it('should handle addLocation()', () => {
      expect(street({ location: null }, addLocation(location))).toEqual({
        location
      })
    })

    it('should handle clearLocation(), clearing street name if user has not edited it', () => {
      expect(
        street(
          {
            location,
            userUpdated: false,
            name: 'test street'
          },
          clearLocation()
        )
      ).toEqual({
        location: null,
        userUpdated: false,
        name: null
      })
    })

    it('should handle clearLocation(), leaving street name if user has edited it', () => {
      expect(
        street(
          {
            location,
            userUpdated: true,
            name: 'test street'
          },
          clearLocation()
        )
      ).toEqual({
        location: null,
        userUpdated: true,
        name: 'test street'
      })
    })
  })

  describe('buildings', () => {
    describe('addBuildingFloor()', () => {
      it('adds a floor on the left building', () => {
        const existingStreet = {
          leftBuildingHeight: 1
        }

        expect(street(existingStreet, addBuildingFloor('left'))).toEqual({
          leftBuildingHeight: 2
        })
      })

      it('adds a floor on the right building', () => {
        const existingStreet = {
          rightBuildingHeight: 19
        }

        expect(street(existingStreet, addBuildingFloor('right'))).toEqual({
          rightBuildingHeight: 20
        })
      })

      it('will not increase a building height past maximum', () => {
        const existingStreet = {
          rightBuildingHeight: 20
        }

        expect(street(existingStreet, addBuildingFloor('right'))).toEqual({
          rightBuildingHeight: 20
        })
      })

      it('does nothing if position is not provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(street(existingStreet, addBuildingFloor())).toEqual(
          existingStreet
        )
      })

      it('does nothing if an unknown position is provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(street(existingStreet, addBuildingFloor('middle'))).toEqual(
          existingStreet
        )
      })
    })

    describe('removeBuildingFloor()', () => {
      it('removes a floor on the left building', () => {
        const existingStreet = {
          leftBuildingHeight: 2
        }

        expect(street(existingStreet, removeBuildingFloor('left'))).toEqual({
          leftBuildingHeight: 1
        })
      })

      it('removes a floor on the right building', () => {
        const existingStreet = {
          rightBuildingHeight: 19
        }

        expect(street(existingStreet, removeBuildingFloor('right'))).toEqual({
          rightBuildingHeight: 18
        })
      })

      it('will not decrease a building height past minimum', () => {
        const existingStreet = {
          leftBuildingHeight: 1
        }

        expect(street(existingStreet, removeBuildingFloor('left'))).toEqual({
          leftBuildingHeight: 1
        })
      })

      it('does nothing if position is not provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(street(existingStreet, removeBuildingFloor())).toEqual(
          existingStreet
        )
      })

      it('does nothing if an unknown position is provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(street(existingStreet, removeBuildingFloor('middle'))).toEqual(
          existingStreet
        )
      })
    })

    describe('setBuildingFloorValue()', () => {
      it('sets a floor value on the left building', () => {
        const existingStreet = {
          leftBuildingHeight: 1
        }

        expect(
          street(existingStreet, setBuildingFloorValue('left', 3))
        ).toEqual({
          leftBuildingHeight: 3
        })
      })

      it('sets a floor value on the right building', () => {
        const existingStreet = {
          rightBuildingHeight: 1
        }

        expect(
          street(existingStreet, setBuildingFloorValue('right', 1))
        ).toEqual({
          rightBuildingHeight: 1
        })
      })

      it('will clamp a value to minimum', () => {
        const existingStreet = {
          leftBuildingHeight: 20
        }

        expect(
          street(existingStreet, setBuildingFloorValue('left', 0))
        ).toEqual({
          leftBuildingHeight: 1
        })
      })

      it('will clamp a value to maximum', () => {
        const existingStreet = {
          rightBuildingHeight: 1
        }

        expect(
          street(existingStreet, setBuildingFloorValue('right', 1000))
        ).toEqual({
          rightBuildingHeight: 20
        })
      })

      it('refuses to set a value that is NaN', () => {
        const existingStreet = {
          rightBuildingHeight: 5
        }

        expect(
          street(existingStreet, setBuildingFloorValue('right', NaN))
        ).toEqual({
          rightBuildingHeight: 5
        })
      })

      it('refuses to set a value that is falsy', () => {
        const existingStreet = {
          leftBuildingHeight: 5
        }

        expect(
          street(existingStreet, setBuildingFloorValue('left', null))
        ).toEqual({
          leftBuildingHeight: 5
        })

        expect(
          street(existingStreet, setBuildingFloorValue('left', false))
        ).toEqual({
          leftBuildingHeight: 5
        })

        expect(
          street(existingStreet, setBuildingFloorValue('left', ''))
        ).toEqual({
          leftBuildingHeight: 5
        })

        expect(street(existingStreet, setBuildingFloorValue('left'))).toEqual({
          leftBuildingHeight: 5
        })
      })

      it('parses integer values from non-integer input', () => {
        const existingStreet = {
          rightBuildingHeight: 5
        }

        expect(
          street(existingStreet, setBuildingFloorValue('right', 4.5))
        ).toEqual({
          rightBuildingHeight: 4
        })

        expect(
          street(existingStreet, setBuildingFloorValue('right', '9'))
        ).toEqual({
          rightBuildingHeight: 9
        })

        expect(
          street(existingStreet, setBuildingFloorValue('right', '6 floors'))
        ).toEqual({
          rightBuildingHeight: 6
        })
      })

      it('does not set a value if integer value cannot be parsed from non-integer input', () => {
        const existingStreet = {
          leftBuildingHeight: 5
        }

        expect(
          street(existingStreet, setBuildingFloorValue('right', 'foo'))
        ).toEqual({
          leftBuildingHeight: 5
        })
      })

      it('does nothing if position is not provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(street(existingStreet, setBuildingFloorValue())).toEqual(
          existingStreet
        )
      })

      it('does nothing if an unknown position is provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(street(existingStreet, setBuildingFloorValue('middle'))).toEqual(
          existingStreet
        )
      })
    })

    describe('setBuildingVariant()', () => {
      it('sets a variant on the left building', () => {
        const existingStreet = {
          leftBuildingVariant: 'wide'
        }

        expect(
          street(existingStreet, setBuildingVariant('left', 'narrow'))
        ).toEqual({
          leftBuildingVariant: 'narrow'
        })
      })

      it('sets a floor value on the right building', () => {
        const existingStreet = {
          rightBuildingVariant: 'narrow'
        }

        expect(
          street(existingStreet, setBuildingVariant('right', 'wide'))
        ).toEqual({
          rightBuildingVariant: 'wide'
        })
      })

      it('refuses to set a value that is falsy', () => {
        const existingStreet = {
          leftBuildingVariant: 'waterfront'
        }

        expect(
          street(existingStreet, setBuildingVariant('left', null))
        ).toEqual({
          leftBuildingVariant: 'waterfront'
        })

        expect(
          street(existingStreet, setBuildingVariant('left', false))
        ).toEqual({
          leftBuildingVariant: 'waterfront'
        })

        expect(street(existingStreet, setBuildingVariant('left', ''))).toEqual({
          leftBuildingVariant: 'waterfront'
        })

        expect(street(existingStreet, setBuildingVariant('left'))).toEqual({
          leftBuildingVariant: 'waterfront'
        })
      })

      it('does nothing if position is not provided', () => {
        const existingStreet = {
          leftBuildingVariant: 'fence',
          rightBuildingVariant: 'parking'
        }

        expect(street(existingStreet, setBuildingVariant())).toEqual(
          existingStreet
        )
      })

      it('does nothing if an unknown position is provided', () => {
        const existingStreet = {
          leftBuildingVariant: 'fence',
          rightBuildingVariant: 'parking'
        }

        expect(street(existingStreet, setBuildingVariant('middle'))).toEqual(
          existingStreet
        )
      })
    })
  })

  it('should handle setEnvironment()', () => {
    expect(street(initialState, setEnvironment('foo'))).toEqual({
      segments: [],
      remainingWidth: 0,
      environment: 'foo',
      userUpdated: false,
      leftBuildingHeight: 0,
      rightBuildingHeight: 0,
      immediateRemoval: true,
      editCount: 0
    })
  })
})
