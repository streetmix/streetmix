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
    mode: 'none',
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
      mode: 'none',
      streets: []
    })
  })

  it('should handle hideGallery()', () => {
    expect(
      gallery(
        {
          visible: true,
          userId: null,
          mode: 'none',
          streets: []
        },
        hideGallery()
      )
    ).toEqual({
      visible: false,
      userId: null,
      mode: 'none',
      streets: []
    })
  })

  it('should handle deleteGalleryStreet()', () => {
    expect(
      gallery(
        {
          visible: false,
          userId: null,
          mode: 'gallery',
          streets: [{ id: 1 }, { id: 2 }, { id: 3 }]
        },
        deleteGalleryStreet(2)
      )
    ).toEqual({
      visible: false,
      userId: null,
      mode: 'gallery',
      streets: [{ id: 1 }, { id: 3 }]
    })
  })

  it('should handle setGalleryUserId()', () => {
    expect(gallery(initialState, setGalleryUserId('foo'))).toEqual({
      visible: false,
      instant: false,
      userId: 'foo',
      mode: 'none',
      streets: []
    })
  })
})
