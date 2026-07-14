import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { StreetAPIResponse, GalleryAPIResponse } from '@streetmix/types'

interface GalleryState extends GalleryAPIResponse {
  visible: boolean
  instant: boolean
  userId: string | null
  mode: 'none' | 'loading' | 'gallery' | 'error'
}

const initialState: GalleryState = {
  visible: false,
  instant: false,
  userId: null,
  mode: 'none',
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

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState,

  reducers: {
    showGallery(state, action: PayloadAction<GalleryState['userId']>) {
      state.visible = true
      state.userId = action.payload
      state.mode = 'none'
    },

    hideGallery(state) {
      state.visible = false
    },

    deleteGalleryStreet(state, action: PayloadAction<StreetAPIResponse['id']>) {
      state.streets = state.streets.filter((street) => {
        return street.id !== action.payload
      })
    },

    setGalleryUserId(state, action: PayloadAction<GalleryState['userId']>) {
      state.userId = action.payload
    },
  },

  extraReducers: (builder) => {
    // Referring to these action types by string instead of the generated
    // variables is because importing the action module during store/slice
    // creation will import other dependent modules too early. We can also
    // solve this by declaring action types in a separate file (similar to
    // basic Redux syntax)
    builder
      .addMatcher(
        (
          action
        ): action is {
          type: 'gallery/openGallery/pending'
          meta: { arg: { userId: string | null; instant?: boolean } }
        } => action.type === 'gallery/openGallery/pending',
        (state, action) => {
          state.visible = true
          state.instant = action.meta.arg.instant ?? false
          state.userId = action.meta.arg.userId ?? null
          state.mode = 'loading'
        }
      )

      .addMatcher(
        (
          action
        ): action is {
          type: 'gallery/openGallery/fulfilled'
          payload: GalleryAPIResponse
        } => action.type === 'gallery/openGallery/fulfilled',
        (state, action) => {
          state.mode = 'gallery'
          state.streets = action.payload.streets
          state.pagination = action.payload.pagination
        }
      )

      .addMatcher(
        (action): action is { type: 'gallery/fetchPage/pending' } =>
          action.type === 'gallery/fetchPage/pending',
        (state) => {
          state.mode = 'loading'
        }
      )

      .addMatcher(
        (
          action
        ): action is {
          type: 'gallery/fetchPage/fulfilled'
          payload: GalleryAPIResponse
        } => action.type === 'gallery/fetchPage/fulfilled',
        (state, action) => {
          state.mode = 'gallery'
          state.streets = action.payload.streets
          state.pagination = action.payload.pagination
        }
      )

      .addMatcher(
        (
          action
        ): action is {
          type: 'gallery/fetchPage/rejected'
          error: { stack?: string }
        } => action.type === 'gallery/fetchPage/rejected',
        (state, action) => {
          console.error('gallery/fetchPage/rejected', action.error.stack)
          state.mode = 'error'
        }
      )

      .addMatcher(
        (
          action
        ): action is {
          type: 'gallery/openGallery/rejected'
          error: { stack?: string }
          payload?: { killGallery?: boolean }
        } => action.type === 'gallery/openGallery/rejected',
        (state, action) => {
          // Log this error because otherwise it's swallowed
          console.error('gallery/openGallery/rejected', action.error.stack)

          state.mode = 'error'

          // A rejection occurs with an optional value. The `killGallery` value
          // can be sent, which means we want to close the gallery immediately.
          // If the rejection occurs without a value, then `action.payload` will
          // be undefined.
          if (action.payload?.killGallery === true) {
            state.visible = false
            state.instant = true
          }
        }
      )

      .addMatcher(
        (
          action
        ): action is {
          type: 'gallery/closeGallery/fulfilled'
          payload: { instant?: boolean }
        } => action.type === 'gallery/closeGallery/fulfilled',
        (state, action) => {
          state.visible = false
          state.instant = action.payload.instant ?? false
        }
      )

      .addMatcher(
        (
          action
        ): action is {
          type: 'gallery/closeGallery/rejected'
          error: { stack?: string }
        } => action.type === 'gallery/closeGallery/rejected',
        (state, action) => {
          // Log this error because otherwise it's swallowed
          console.error('gallery/closeGallery/rejected', action.error.stack)
        }
      )
  },
})

export const {
  showGallery,
  hideGallery,
  deleteGalleryStreet,
  setGalleryUserId,
} = gallerySlice.actions

export default gallerySlice.reducer
