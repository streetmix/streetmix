/* eslint-env jest */
import reducer from '../street'
import * as actions from '../../actions/street'

describe('street reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      segments: []
    })
  })

  it('should handle ADD_SEGMENT', () => {
    // Add a segment at index 0 from initial state
    expect(
      reducer(undefined, actions.addSegment(0, { type: 'foo' }))
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
      segments: [
        { type: 'foo' },
        { type: 'bar' },
        { type: 'baz' }
      ]
    }

    // Removes a segment at index 1 from an existing street
    expect(
      reducer(Object.assign({}, existingStreet), actions.removeSegment(1))
    ).toEqual({
      segments: [
        { type: 'foo' },
        { type: 'baz' }
      ]
    })

    // Removes a segment at index 0 from an existing street
    expect(
      reducer(Object.assign({}, existingStreet), actions.removeSegment(0))
    ).toEqual({
      segments: [
        { type: 'bar' },
        { type: 'baz' }
      ]
    })

    // Returns existing street if a removed segment is out of bounds
    expect(
      reducer(Object.assign({}, existingStreet), actions.removeSegment(8))
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
      reducer(Object.assign({}, existingStreet), actions.moveSegment(0, 1))
    ).toEqual({
      segments: [
        { type: 'bar' },
        { type: 'foo' },
        { type: 'baz' }
      ]
    })

    // Moves a segment at index 2 to index 0 on an existing street
    expect(
      reducer(Object.assign({}, existingStreet), actions.moveSegment(2, 0))
    ).toEqual({
      segments: [
        { type: 'baz' },
        { type: 'foo' },
        { type: 'bar' }
      ]
    })

    // moves a segment to the end if desired index is out of bounds
    expect(
      reducer(Object.assign({}, existingStreet), actions.moveSegment(1, 8))
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
      reducer(Object.assign({}, existingStreet), actions.changeSegmentWidth(0, 20))
    ).toEqual({
      segments: [
        { type: 'foo', width: 20 },
        { type: 'bar', width: 2 },
        { type: 'baz', width: 3 }
      ]
    })
  })
})
