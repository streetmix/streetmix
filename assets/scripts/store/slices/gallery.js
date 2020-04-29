import { createSlice } from '@reduxjs/toolkit'
import { GALLERY_MODES } from '../../gallery/constants'

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState: {
    visible: false,
    instant: false,
    userId: null,
    mode: GALLERY_MODES.NONE,
    streets: []
  },

  reducers: {
    showGallery (state, action) {
      state.visible = true
      state.userId = action.payload
      state.mode = GALLERY_MODES.NONE
    },

    hideGallery (state, action) {
      state.visible = false
    },

    deleteGalleryStreet (state, action) {
      state.streets = state.streets.filter((street) => {
        return street.id !== action.payload
      })
    },

    setGalleryUserId (state, action) {
      state.userId = action.payload
    }
  },

  extraReducers: {
    // Referring to these action types by string instead of the generated
    // variables is because importing the action module during store/slice
    // creation will import other dependent modules too early. We can also
    // solve this by declaring action types in a separate file (similar to
    // basic Redux syntax)
    'gallery/openGallery/pending': (state, action) => {
      state.visible = true
      state.instant = action.meta.arg.instant ?? false
      state.userId = action.meta.arg.userId ?? null
      state.mode = GALLERY_MODES.LOADING
    },

    'gallery/openGallery/fulfilled': (state, action) => {
      state.mode = GALLERY_MODES.GALLERY
      state.streets = action.payload
    },

    'gallery/openGallery/rejected': (state, action) => {
      // We log this error because otherwise it's swallowed
      console.error('gallery/openGallery/rejected', action.error.stack)

      state.mode = GALLERY_MODES.ERROR

      if (action.payload.killGallery === true) {
        state.visible = false
        state.instant = true
      }
    },

    'gallery/closeGallery/fulfilled': (state, action) => {
      state.visible = false
      state.instant = action.payload.instant ?? false
    },

    'gallery/closeGallery/rejected': (state, action) => {
      // We log this error because otherwise it's swallowed
      console.error('gallery/closeGallery/rejected', action.error.stack)
    }
  }
})

export const {
  showGallery,
  hideGallery,
  deleteGalleryStreet,
  setGalleryUserId
} = gallerySlice.actions

export default gallerySlice.reducer
