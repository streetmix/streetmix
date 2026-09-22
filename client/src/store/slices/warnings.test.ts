import warnings, { setSliceWarnings } from './warnings'

describe('warnings reducer', () => {
  const initialState = {
    slices: {},
  }

  it('should handle setSliceWarnings()', () => {
    expect(
      warnings(
        initialState,
        setSliceWarnings({
          'slice-id': {
            outOfBounds: true,
            slopePathExceeded: true,
          },
        })
      )
    ).toEqual({
      slices: {
        'slice-id': {
          outOfBounds: true,
          slopePathExceeded: true,
        },
      },
    })
  })
})
