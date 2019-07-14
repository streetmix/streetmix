/* eslint-env jest */
import reducer from '../street'
import * as actions from '../../actions/street'
import { DEFAULT_ENVIRONS } from '../../../streets/constants'

describe('street reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      immediateRemoval: true,
      segments: [],
      environment: DEFAULT_ENVIRONS
    })
  })

  it('should handle ADD_SEGMENT', () => {
    // Add a segment at index 0 from initial state
    expect(
      reducer({
        segments: []
      }, actions.addSegment(0, { type: 'foo' }))
    ).toEqual({
      segments: [
        { type: 'foo' }
      ]
    })

    // Insert a segment at index 0 for an existing street
    expect(
      reducer({
        segments: [
          { type: 'foo' }
        ]
      }, actions.addSegment(0, { type: 'bar' }))
    ).toEqual({
      segments: [
        { type: 'bar' },
        { type: 'foo' }
      ]
    })

    // Insert a segment at index 1 for an existing street
    expect(
      reducer({
        segments: [
          { type: 'foo' }
        ]
      }, actions.addSegment(1, { type: 'bar' }))
    ).toEqual({
      segments: [
        { type: 'foo' },
        { type: 'bar' }
      ]
    })

    // Insert a segment at index 1 for an existing street
    expect(
      reducer({
        segments: [
          { type: 'foo' },
          { type: 'baz' }
        ]
      }, actions.addSegment(1, { type: 'bar' }))
    ).toEqual({
      segments: [
        { type: 'foo' },
        { type: 'bar' },
        { type: 'baz' }
      ]
    })
  })

  it('should handle REMOVE_SEGMENT', () => {
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
    expect(
      reducer({ ...existingStreet }, actions.removeSegment(1))
    ).toEqual({
      immediateRemoval: true,
      segments: [
        { type: 'foo' },
        { type: 'baz' },
        { type: 'qux' }
      ]
    })

    // Removes a segment at index 0 from an existing street
    expect(
      reducer({ ...existingStreet }, actions.removeSegment(0))
    ).toEqual({
      immediateRemoval: true,
      segments: [
        { type: 'bar' },
        { type: 'baz' },
        { type: 'qux' }
      ]
    })

    // Returns existing street if a removed segment is out of bounds
    expect(
      reducer({ ...existingStreet }, actions.removeSegment(8))
    ).toEqual(existingStreet)
  })

  it('should handle MOVE_SEGMENT', () => {
    const existingStreet = {
      segments: [
        { type: 'foo' },
        { type: 'bar' },
        { type: 'baz' }
      ]
    }

    // Moves a segment at index 0 to index 1 on an existing street
    expect(
      reducer({ ...existingStreet }, actions.moveSegment(0, 1))
    ).toEqual({
      segments: [
        { type: 'bar' },
        { type: 'foo' },
        { type: 'baz' }
      ]
    })

    // Moves a segment at index 2 to index 0 on an existing street
    expect(
      reducer({ ...existingStreet }, actions.moveSegment(2, 0))
    ).toEqual({
      segments: [
        { type: 'baz' },
        { type: 'foo' },
        { type: 'bar' }
      ]
    })

    // moves a segment to the end if desired index is out of bounds
    expect(
      reducer({ ...existingStreet }, actions.moveSegment(1, 8))
    ).toEqual({
      segments: [
        { type: 'foo' },
        { type: 'baz' },
        { type: 'bar' }
      ]
    })
  })

  it('should handle CHANGE_SEGMENT_WIDTH', () => {
    const existingStreet = {
      segments: [
        { type: 'foo', width: 1 },
        { type: 'bar', width: 2 },
        { type: 'baz', width: 3 }
      ]
    }

    // Changes a segment width
    expect(
      reducer({ ...existingStreet }, actions.changeSegmentWidth(0, 20))
    ).toEqual({
      segments: [
        { type: 'foo', width: 20 },
        { type: 'bar', width: 2 },
        { type: 'baz', width: 3 }
      ]
    })
  })

  it('should handle CHANGE_SEGMENT_VARIANT', () => {
    const existingStreet = {
      segments: [
        { type: 'foo' },
        { type: 'bar' },
        {
          type: 'drive-lane',
          variantString: 'inbound|car',
          variant: {
            direction: 'inbound',
            'car-type': 'car'
          }
        }
      ]
    }

    expect(
      reducer({ ...existingStreet }, actions.changeSegmentVariant(2, 'direction', 'outbound'))
    ).toEqual({
      segments: [
        { type: 'foo' },
        { type: 'bar' },
        {
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

  it('should handle ADD_LOCATION', () => {
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

    expect(
      reducer({}, actions.addLocation(location))
    ).toEqual({
      location: location
    })
  })

  describe('CLEAR_LOCATION', () => {
    it('sets street.location to be null and clears original street name if userUpdated was false', () => {
      const existingStreet = {
        name: 'test street',
        userUpdated: false,
        location: {
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
      }

      expect(
        reducer({ ...existingStreet }, actions.clearLocation())
      ).toEqual({
        name: null,
        userUpdated: false,
        location: null
      })
    })
  })

  describe('SAVE_STREET_NAME', () => {
    it('renames street name if user updated and sets userUpdated to true', () => {
      const existingStreet = {
        name: 'street name',
        userUpdated: false
      }

      expect(
        reducer({ ...existingStreet }, actions.saveStreetName('new street name', true))
      ).toEqual({
        name: 'new street name',
        userUpdated: true
      })
    })

    it('does not rename street if not user updated and userUpdate is true', () => {
      const existingStreet = {
        name: 'street name',
        userUpdated: true
      }

      expect(
        reducer({ ...existingStreet }, actions.saveStreetName('new street name', false))
      ).toEqual({
        name: 'street name',
        userUpdated: true
      })
    })

    it('renames street if userUpdated is false', () => {
      const existingStreet = {
        name: 'street name',
        userUpdated: false
      }

      expect(
        reducer({ ...existingStreet }, actions.saveStreetName('new street name', false))
      ).toEqual({
        name: 'new street name',
        userUpdated: false
      })
    })
  })

  describe('buildings', () => {
    describe('ADD_BUILDING_FLOOR', () => {
      it('adds a floor on the left building', () => {
        const existingStreet = {
          leftBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.addBuildingFloor('left'))
        ).toEqual({
          leftBuildingHeight: 2
        })
      })

      it('adds a floor on the right building', () => {
        const existingStreet = {
          rightBuildingHeight: 19
        }

        expect(
          reducer({ ...existingStreet }, actions.addBuildingFloor('right'))
        ).toEqual({
          rightBuildingHeight: 20
        })
      })

      it('will not increase a building height past maximum', () => {
        const existingStreet = {
          rightBuildingHeight: 20
        }

        expect(
          reducer({ ...existingStreet }, actions.addBuildingFloor('right'))
        ).toEqual({
          rightBuildingHeight: 20
        })
      })

      it('does nothing if position is not provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.addBuildingFloor())
        ).toEqual(existingStreet)
      })

      it('does nothing if an unknown position is provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.addBuildingFloor('middle'))
        ).toEqual(existingStreet)
      })
    })

    describe('REMOVE_BUILDING_FLOOR', () => {
      it('removes a floor on the left building', () => {
        const existingStreet = {
          leftBuildingHeight: 2
        }

        expect(
          reducer({ ...existingStreet }, actions.removeBuildingFloor('left'))
        ).toEqual({
          leftBuildingHeight: 1
        })
      })

      it('removes a floor on the right building', () => {
        const existingStreet = {
          rightBuildingHeight: 19
        }

        expect(
          reducer({ ...existingStreet }, actions.removeBuildingFloor('right'))
        ).toEqual({
          rightBuildingHeight: 18
        })
      })

      it('will not decrease a building height past minimum', () => {
        const existingStreet = {
          leftBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.removeBuildingFloor('left'))
        ).toEqual({
          leftBuildingHeight: 1
        })
      })

      it('does nothing if position is not provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.removeBuildingFloor())
        ).toEqual(existingStreet)
      })

      it('does nothing if an unknown position is provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.removeBuildingFloor('middle'))
        ).toEqual(existingStreet)
      })
    })

    describe('SET_BUILDING_FLOOR_VALUE', () => {
      it('sets a floor value on the left building', () => {
        const existingStreet = {
          leftBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('left', 3))
        ).toEqual({
          leftBuildingHeight: 3
        })
      })

      it('sets a floor value on the right building', () => {
        const existingStreet = {
          rightBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('right', 1))
        ).toEqual({
          rightBuildingHeight: 1
        })
      })

      it('will clamp a value to minimum', () => {
        const existingStreet = {
          leftBuildingHeight: 20
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('left', 0))
        ).toEqual({
          leftBuildingHeight: 1
        })
      })

      it('will clamp a value to maximum', () => {
        const existingStreet = {
          rightBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('right', 1000))
        ).toEqual({
          rightBuildingHeight: 20
        })
      })

      it('refuses to set a value that is NaN', () => {
        const existingStreet = {
          rightBuildingHeight: 5
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('right', NaN))
        ).toEqual({
          rightBuildingHeight: 5
        })
      })

      it('refuses to set a value that is falsy', () => {
        const existingStreet = {
          leftBuildingHeight: 5
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('left', null))
        ).toEqual({
          leftBuildingHeight: 5
        })

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('left', false))
        ).toEqual({
          leftBuildingHeight: 5
        })

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('left', ''))
        ).toEqual({
          leftBuildingHeight: 5
        })

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('left'))
        ).toEqual({
          leftBuildingHeight: 5
        })
      })

      it('parses integer values from non-integer input', () => {
        const existingStreet = {
          rightBuildingHeight: 5
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('right', 4.5))
        ).toEqual({
          rightBuildingHeight: 4
        })

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('right', '9'))
        ).toEqual({
          rightBuildingHeight: 9
        })

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('right', '6 floors'))
        ).toEqual({
          rightBuildingHeight: 6
        })
      })

      it('does not set a value if integer value cannot be parsed from non-integer input', () => {
        const existingStreet = {
          leftBuildingHeight: 5
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('right', 'foo'))
        ).toEqual({
          leftBuildingHeight: 5
        })
      })

      it('does nothing if position is not provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue())
        ).toEqual(existingStreet)
      })

      it('does nothing if an unknown position is provided', () => {
        const existingStreet = {
          leftBuildingHeight: 1,
          rightBuildingHeight: 1
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingFloorValue('middle'))
        ).toEqual(existingStreet)
      })
    })

    describe('SET_BUILDING_VARIANT', () => {
      it('sets a variant on the left building', () => {
        const existingStreet = {
          leftBuildingVariant: 'wide'
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingVariant('left', 'narrow'))
        ).toEqual({
          leftBuildingVariant: 'narrow'
        })
      })

      it('sets a floor value on the right building', () => {
        const existingStreet = {
          rightBuildingVariant: 'narrow'
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingVariant('right', 'wide'))
        ).toEqual({
          rightBuildingVariant: 'wide'
        })
      })

      it('refuses to set a value that is falsy', () => {
        const existingStreet = {
          leftBuildingVariant: 'waterfront'
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingVariant('left', null))
        ).toEqual({
          leftBuildingVariant: 'waterfront'
        })

        expect(
          reducer({ ...existingStreet }, actions.setBuildingVariant('left', false))
        ).toEqual({
          leftBuildingVariant: 'waterfront'
        })

        expect(
          reducer({ ...existingStreet }, actions.setBuildingVariant('left', ''))
        ).toEqual({
          leftBuildingVariant: 'waterfront'
        })

        expect(
          reducer({ ...existingStreet }, actions.setBuildingVariant('left'))
        ).toEqual({
          leftBuildingVariant: 'waterfront'
        })
      })

      it('does nothing if position is not provided', () => {
        const existingStreet = {
          leftBuildingVariant: 'fence',
          rightBuildingVariant: 'parking'
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingVariant())
        ).toEqual(existingStreet)
      })

      it('does nothing if an unknown position is provided', () => {
        const existingStreet = {
          leftBuildingVariant: 'fence',
          rightBuildingVariant: 'parking'
        }

        expect(
          reducer({ ...existingStreet }, actions.setBuildingVariant('middle'))
        ).toEqual(existingStreet)
      })
    })
  })

  describe('environs', () => {
    it('sets a new environs', () => {
      expect(
        reducer({ environment: 'foo' }, actions.setEnvironment('bar'))
      ).toEqual({
        environment: 'bar'
      })
    })
  })
})
