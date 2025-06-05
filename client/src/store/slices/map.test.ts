import map, { setMapState, resetMapState } from './map'

describe('map reducer', () => {
  const initialState = {
    markerLocation: null,
    addressInformation: {},
    rawInputString: null
  }

  it('should handle setMapState()', () => {
    expect(
      map(
        initialState,
        setMapState({
          markerLocation: [1, 2],
          addressInformation: {
            foo: 'bar'
          }
        })
      )
    ).toEqual({
      markerLocation: [1, 2],
      addressInformation: {
        foo: 'bar'
      },
      rawInputString: null
    })
  })

  it('should handle resetMapState()', () => {
    expect(map(initialState, resetMapState())).toEqual(initialState)
  })

  it('should handle extra reducers', () => {
    expect(map(initialState, 'CLEAR_LOCATION')).toEqual(initialState)
  })
})
