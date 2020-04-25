import { createSlice } from '@reduxjs/toolkit'
import { GALLERY_MODES } from '../../gallery/constants'

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState: {
    visible: false,
    userId: null,
    mode: GALLERY_MODES.NONE,
    streets: []
  },

  reducers: {
    show (state, action) {
      state.visible = true
      state.userId = action.payload
      state.mode = GALLERY_MODES.NONE
    },

    hide (state, action) {
      state.visible = false
    },

    receiveGalleryStreets (state, action) {
      state.mode = GALLERY_MODES.GALLERY
      state.streets = action.payload
    },

    deleteGalleryStreet (state, action) {
      state.streets = state.streets.filter((street) => {
        return street.id !== action.payload
      })
    },

    setGalleryMode (state, action) {
      state.mode = GALLERY_MODES[action.payload]
    },

    setGalleryUserId (state, action) {
      state.userId = action.payload
    }
  }
})

export const {
  show,
  hide,
  receiveGalleryStreets,
  deleteGalleryStreet,
  setGalleryMode,
  setGalleryUserId
} = gallerySlice.actions

export default gallerySlice.reducer
