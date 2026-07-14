import gallery, {
  showGallery,
  hideGallery,
  deleteGalleryStreet,
  setGalleryUserId,
} from './gallery.js'

describe('gallery reducer', () => {
  const initialState = {
    visible: false,
    instant: false,
    userId: null,
    mode: 'none' as const,
    streets: [],
    pagination: {
      page: 1,
      limit: 100,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }

  it('should handle showGallery()', () => {
    expect(gallery(initialState, showGallery('userId'))).toEqual({
      ...initialState,
      visible: true,
      userId: 'userId',
    })
  })

  it('should handle hideGallery()', () => {
    expect(
      gallery(
        {
          ...initialState,
          visible: true,
        },
        hideGallery()
      )
    ).toEqual({
      ...initialState,
      visible: false,
    })
  })

  it('should handle deleteGalleryStreet()', () => {
    expect(
      gallery(
        {
          ...initialState,
          visible: true,
          mode: 'gallery',
          streets: [{ id: '1' }, { id: '2' }, { id: '3' }],
        },
        deleteGalleryStreet('2')
      )
    ).toEqual({
      ...initialState,
      visible: true,
      mode: 'gallery',
      streets: [{ id: '1' }, { id: '3' }],
    })
  })

  it('should handle setGalleryUserId()', () => {
    expect(gallery(initialState, setGalleryUserId('foo'))).toEqual({
      ...initialState,
      userId: 'foo',
    })
  })
})
