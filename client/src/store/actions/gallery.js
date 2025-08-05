import { createAsyncThunk } from '@reduxjs/toolkit'
import { fetchGalleryData } from '../../gallery/index'
import { updatePageUrl } from '../../app/page_url'
import { showError, ERRORS } from '../../app/errors'
import { MODES, getMode, setMode } from '../../app/mode'
import { onWindowFocus } from '../../app/focus'

export const openGallery = createAsyncThunk(
  'gallery/openGallery',
  async ({ userId }, { rejectWithValue }) => {
    updatePageUrl(true, userId)

    // TODO: Handle modes better.
    if (
      getMode() === MODES.USER_GALLERY ||
      getMode() === MODES.GLOBAL_GALLERY
    ) {
      // Prevents showing old street before the proper street loads
      showError(ERRORS.NO_STREET, false)
    }

    // Fetch data and catch errors if fetch goes wrong
    try {
      const streets = await fetchGalleryData(userId)
      return { streets }
    } catch (error) {
      // If the server error is 404, special rejection value
      // to display a "not-found" screen without the gallery
      if (error.response?.status === 404) {
        return rejectWithValue({
          killGallery: true
        })
      }

      // Re-throw original error for normal rejection
      throw error
    }
  }
)

export const closeGallery = createAsyncThunk(
  'gallery/closeGallery',
  ({ instant = false } = {}, { getState }) => {
    const state = getState()

    if (!state.errors.abortEverything) {
      updatePageUrl()
    }

    onWindowFocus()
    setMode(MODES.CONTINUE)

    return { instant }
  },
  {
    condition: (arg, { getState }) => {
      const { visible } = getState().gallery

      // If gallery isn't visible, don't dispatch again
      if (!visible) {
        return false
      }
    }
  }
)
