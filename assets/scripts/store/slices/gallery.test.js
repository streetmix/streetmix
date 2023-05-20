/* eslint-env jest */
import gallery, {
  showGallery,
  hideGallery,
  deleteGalleryStreet,
  setGalleryUserId
} from './gallery'

describe('gallery reducer', () => {
  const initialState = {
    visible: false,
    instant: false,
    userId: null,
    user: {},
    mode: 'NONE',
    streets: []
  }

  it('should handle initial state', () => {
    expect(gallery(undefined, {})).toEqual(initialState)
  })

  it('should handle showGallery()', () => {
    expect(gallery(initialState, showGallery('userId'))).toEqual({
      visible: true,
      instant: false,
      userId: 'userId',
      user: {},
      mode: 'NONE',
      streets: []
    })
  })

  it('should handle hideGallery()', () => {
    expect(
      gallery(
        {
          visible: true,
          userId: null,
          user: {},
          mode: 'NONE',
          streets: []
        },
        hideGallery()
      )
    ).toEqual({
      visible: false,
      userId: null,
      user: {},
      mode: 'NONE',
      streets: []
    })
  })

  it('should handle deleteGalleryStreet()', () => {
    expect(
      gallery(
        {
          visible: false,
          userId: null,
          user: {},
          mode: 'GALLERY',
          streets: [{ id: 1 }, { id: 2 }, { id: 3 }]
        },
        deleteGalleryStreet(2)
      )
    ).toEqual({
      visible: false,
      userId: null,
      user: {},
      mode: 'GALLERY',
      streets: [{ id: 1 }, { id: 3 }]
    })
  })

  it('should handle setGalleryUserId()', () => {
    expect(gallery(initialState, setGalleryUserId('foo'))).toEqual({
      visible: false,
      instant: false,
      userId: 'foo',
      user: {},
      mode: 'NONE',
      streets: []
    })
  })
})
