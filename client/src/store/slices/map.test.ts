import map, { setMapState, resetMapState } from './map'

describe('map reducer', () => {
  const initialState = {
    markerLocation: null,
    addressInformation: {},
    rawInputString: null,
  }

  it('should handle setMapState()', () => {
    expect(
      map(
        initialState,
        setMapState({
          markerLocation: {
            lat: 1,
            lng: 2,
          },
          addressInformation: {
            foo: 'bar',
          },
        })
      )
    ).toEqual({
      markerLocation: {
        lat: 1,
        lng: 2,
      },
      addressInformation: {
        foo: 'bar',
      },
      rawInputString: null,
    })
  })

  it('should handle resetMapState()', () => {
    expect(map(initialState, resetMapState())).toEqual(initialState)
  })
})
