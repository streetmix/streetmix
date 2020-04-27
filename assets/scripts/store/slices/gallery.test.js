/* eslint-env jest */
import gallery, {
  showGallery,
  hideGallery,
  receiveGalleryStreets,
  deleteGalleryStreet,
  setGalleryMode,
  setGalleryUserId
} from './gallery'

describe('gallery reducer', () => {
  const initialState = {
    visible: false,
    userId: null,
    mode: 'NONE',
    streets: []
  }

  it('should handle initial state', () => {
    expect(gallery(undefined, {})).toEqual(initialState)
  })

  it('should handle showGallery()', () => {
    expect(gallery(initialState, showGallery('userId'))).toEqual({
      visible: true,
      userId: 'userId',
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
          mode: 'NONE',
          streets: []
        },
        hideGallery()
      )
    ).toEqual({
      visible: false,
      userId: null,
      mode: 'NONE',
      streets: []
    })
  })

  it('should handle receiveGalleryStreets()', () => {
    expect(
      gallery(
        initialState,
        receiveGalleryStreets([{ id: 1 }, { id: 2 }, { id: 3 }])
      )
    ).toEqual({
      visible: false,
      userId: null,
      mode: 'GALLERY',
      streets: [{ id: 1 }, { id: 2 }, { id: 3 }]
    })
  })

  it('should handle deleteGalleryStreet()', () => {
    expect(
      gallery(
        {
          visible: false,
          userId: null,
          mode: 'GALLERY',
          streets: [{ id: 1 }, { id: 2 }, { id: 3 }]
        },
        deleteGalleryStreet(2)
      )
    ).toEqual({
      visible: false,
      userId: null,
      mode: 'GALLERY',
      streets: [{ id: 1 }, { id: 3 }]
    })
  })

  it('should handle setGalleryMode()', () => {
    expect(gallery(initialState, setGalleryMode('GALLERY'))).toEqual({
      visible: false,
      userId: null,
      mode: 'GALLERY',
      streets: []
    })
  })

  it('should handle setGalleryUserId()', () => {
    expect(gallery(initialState, setGalleryUserId('foo'))).toEqual({
      visible: false,
      userId: 'foo',
      mode: 'NONE',
      streets: []
    })
  })
})
